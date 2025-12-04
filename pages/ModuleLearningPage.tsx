import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getCurriculumModule,
  getModuleContents,
  streamModuleChat,
  getQuizQuestions,
  submitQuiz,
  updateModuleProgress,
  ModuleContent,
  ModuleContentResponse,
} from '../services/apiClient';
import { CurriculumModule, QuizQuestion, QuizSubmitResponse, QuizAnswer } from '../types';

type Phase = 'learning' | 'quiz' | 'result';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// 레벨별 정보
const LEVELS = [
  { id: 'basic', name: '기초', icon: 'fa-seedling', description: '핵심 개념과 기본 사용법' },
  { id: 'intermediate', name: '중급', icon: 'fa-leaf', description: 'ITIL 기반 심화 학습' },
  { id: 'advanced', name: '고급', icon: 'fa-tree', description: '자동화와 API 활용' },
];

// 섹션별 아이콘
const SECTION_ICONS: Record<string, string> = {
  overview: 'fa-lightbulb',
  core_concepts: 'fa-brain',
  features: 'fa-cogs',
  practice: 'fa-briefcase',
  faq: 'fa-question-circle',
  advanced: 'fa-rocket',
};

const SUGGESTED_QUESTIONS = [
  '이 기능의 핵심이 뭐예요?',
  '실무에서 어떻게 활용하나요?',
  '자주 하는 실수가 있나요?',
];

const ModuleLearningPage: React.FC = () => {
  const navigate = useNavigate();
  const { productId, moduleId } = useParams<{ productId: string; moduleId: string }>();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Module state
  const [module, setModule] = useState<CurriculumModule | null>(null);
  const [isLoadingModule, setIsLoadingModule] = useState(true);

  // Content state (정적 콘텐츠)
  const [contentData, setContentData] = useState<ModuleContentResponse | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [currentLevel, setCurrentLevel] = useState<string>('basic');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  // Phase (자가 점검)
  const [phase, setPhase] = useState<Phase>('learning');

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);

  const sessionId = localStorage.getItem('onboarding_session_id') || '';

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // 모듈 정보 로드
  useEffect(() => {
    const loadModule = async () => {
      if (!moduleId) return;
      setIsLoadingModule(true);
      try {
        const data = await getCurriculumModule(moduleId);
        setModule(data);
      } catch (error) {
        console.error('Failed to load module:', error);
      } finally {
        setIsLoadingModule(false);
      }
    };
    loadModule();
  }, [moduleId]);

  // 정적 콘텐츠 로드 (LLM 없이 즉시)
  useEffect(() => {
    const loadContents = async () => {
      if (!moduleId) return;
      setIsLoadingContent(true);
      try {
        const data = await getModuleContents(moduleId);
        setContentData(data);
        // 첫 번째 레벨로 설정
        if (data.levels.length > 0 && !data.levels.includes(currentLevel)) {
          setCurrentLevel(data.levels[0]);
        }
      } catch (error) {
        console.error('Failed to load contents:', error);
      } finally {
        setIsLoadingContent(false);
      }
    };
    loadContents();
  }, [moduleId]);

  // 학습 시작 시 진도 업데이트
  useEffect(() => {
    const startLearning = async () => {
      if (!moduleId || !sessionId) return;
      try {
        await updateModuleProgress(moduleId, sessionId, { status: 'learning' });
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    };
    startLearning();
  }, [moduleId, sessionId]);

  // 자가 점검 문제 로드
  useEffect(() => {
    const loadQuestions = async () => {
      if (!moduleId) return;
      try {
        const data = await getQuizQuestions(moduleId);
        setQuestions(data);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setQuizStartTime(new Date());
      } catch (error) {
        console.error('Failed to load questions:', error);
      }
    };
    if (phase === 'quiz') {
      loadQuestions();
    }
  }, [moduleId, phase]);

  // 채팅 메시지 전송
  const handleSendChat = useCallback(async (message: string) => {
    if (!message.trim() || !moduleId || !sessionId || isChatLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: message };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const stream = streamModuleChat(moduleId, sessionId, message);
      let response = '';
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      for await (const event of stream) {
        if (event.event === 'result' && event.data?.text) {
          response = event.data.text as string;
          setChatMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].content = response;
            return updated;
          });
        } else if (event.event === 'chunk' && event.data?.text) {
          response = event.data.text as string;
          setChatMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].content = response;
            return updated;
          });
        }
      }
    } catch (error) {
      console.error('Failed to send chat:', error);
      setChatMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content = '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다.';
        return updated;
      });
    } finally {
      setIsChatLoading(false);
    }
  }, [moduleId, sessionId, isChatLoading]);

  // 섹션 토글
  const toggleSection = (sectionType: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionType)) {
        newSet.delete(sectionType);
      } else {
        newSet.add(sectionType);
      }
      return newSet;
    });
  };

  // 모든 섹션 펼치기/접기
  const toggleAllSections = (expand: boolean) => {
    if (expand && contentData?.sections[currentLevel]) {
      setExpandedSections(new Set(contentData.sections[currentLevel].map(s => s.sectionType)));
    } else {
      setExpandedSections(new Set());
    }
  };

  // 답변 선택
  const handleAnswerSelect = (questionId: string, choiceId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: choiceId }));
  };

  // 퀴즈 제출
  const handleSubmitQuiz = async () => {
    if (!moduleId || !sessionId) return;
    setIsSubmitting(true);
    try {
      const answers: QuizAnswer[] = Object.entries(selectedAnswers).map(([questionId, choiceId]) => ({
        questionId,
        choiceId,
      }));
      const response = await submitQuiz(moduleId, sessionId, answers, quizStartTime || undefined);
      setResult(response);
      setPhase('result');
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모듈 목록으로 돌아가기
  const handleGoBack = () => {
    navigate(`/curriculum/${productId}`);
  };

  // 로딩 중
  if (isLoadingModule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">모듈 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
          <p className="text-gray-600">모듈을 찾을 수 없습니다.</p>
          <button onClick={handleGoBack} className="mt-4 text-blue-500 hover:underline">
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 현재 레벨의 섹션들
  const currentSections = contentData?.sections[currentLevel] || [];
  const availableLevels = contentData?.levels || ['basic'];

  // 퀴즈 결과 화면
  if (phase === 'result' && result) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* 헤더 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <button onClick={handleGoBack} className="text-gray-500 hover:text-gray-700 mb-4">
              <i className="fas fa-arrow-left mr-2"></i>목록으로
            </button>
            <h1 className="text-2xl font-bold text-gray-800">{module.nameKo} - 자가 점검 결과</h1>
          </div>

          {/* 점수 카드 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white text-center mb-6">
            <div className="text-6xl font-bold mb-2">{result.score}점</div>
            <p className="text-blue-100">
              {result.correctCount}개 정답 / {result.totalQuestions}개 문제
            </p>
            <p className="mt-4 text-sm text-blue-200">
              이 점수는 참고용입니다. 틀린 문제는 아래에서 확인하세요.
            </p>
          </div>

          {/* 결과 상세 */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">문제별 결과</h2>
            {result.results.map((r, idx) => {
              const question = questions.find(q => q.id === r.questionId);
              if (!question) return null;
              return (
                <div key={r.questionId} className={`p-4 rounded-lg border-l-4 ${r.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                  <div className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${r.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                      {r.isCorrect ? <i className="fas fa-check"></i> : <i className="fas fa-times"></i>}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Q{idx + 1}. {question.question}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        내 답: {question.choices.find(c => c.id === r.choiceId)?.text}
                      </p>
                      {!r.isCorrect && (
                        <>
                          <p className="text-sm text-green-600 mt-1">
                            정답: {question.choices.find(c => c.id === r.correctChoiceId)?.text}
                          </p>
                          {r.explanation && (
                            <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-100 rounded">
                              💡 {r.explanation}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 완료 버튼 */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleGoBack}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <i className="fas fa-check mr-2"></i>완료
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 퀴즈 화면
  if (phase === 'quiz') {
    const currentQuestion = questions[currentQuestionIndex];
    const allAnswered = questions.length > 0 && Object.keys(selectedAnswers).length === questions.length;

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* 헤더 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <button onClick={() => setPhase('learning')} className="text-gray-500 hover:text-gray-700 mb-4">
              <i className="fas fa-arrow-left mr-2"></i>학습으로 돌아가기
            </button>
            <h1 className="text-2xl font-bold text-gray-800">{module.nameKo} - 자가 점검</h1>
            <p className="text-gray-500 mt-1">
              문제 {currentQuestionIndex + 1} / {questions.length}
            </p>
          </div>

          {/* 문제 */}
          {currentQuestion ? (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{currentQuestion.question}</h2>
              {currentQuestion.context && (
                <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded">{currentQuestion.context}</p>
              )}
              <div className="space-y-3">
                {currentQuestion.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleAnswerSelect(currentQuestion.id, choice.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      selectedAnswers[currentQuestion.id] === choice.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">문제를 불러오는 중...</p>
            </div>
          )}

          {/* 네비게이션 */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              <i className="fas fa-chevron-left mr-2"></i>이전
            </button>
            
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                다음<i className="fas fa-chevron-right ml-2"></i>
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={!allAnswered || isSubmitting}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {isSubmitting ? '제출 중...' : '제출하기'}
              </button>
            )}
          </div>

          {/* 문제 인디케이터 */}
          <div className="mt-6 flex justify-center gap-2 flex-wrap">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition ${
                  idx === currentQuestionIndex
                    ? 'bg-blue-500 text-white'
                    : selectedAnswers[q.id]
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 학습 화면 (정적 콘텐츠) - homepage 스타일
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 히어로 헤더 - 전체 너비 */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* 상단: 뒤로가기 + 레벨 탭 */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={handleGoBack} 
              className="flex items-center gap-2 text-slate-400 hover:text-white transition group"
            >
              <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
              <span>목록으로</span>
            </button>
            
            {/* 레벨 탭 */}
            <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
              {availableLevels.map((level) => {
                const levelInfo = LEVELS.find(l => l.id === level) || { name: level, icon: 'fa-book', description: '' };
                return (
                  <button
                    key={level}
                    onClick={() => {
                      setCurrentLevel(level);
                      setExpandedSections(new Set(['overview']));
                    }}
                    className={`px-4 py-2 rounded-md font-medium transition flex items-center gap-2 text-sm ${
                      currentLevel === level
                        ? 'bg-white text-slate-900'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <i className={`fas ${levelInfo.icon}`}></i>
                    {levelInfo.name}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* 모듈 정보 */}
          <div className="flex items-end justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">{module.nameKo}</h1>
              <p className="text-slate-400 mt-2 max-w-2xl">{module.description}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <i className="fas fa-clock"></i>
                  약 {module.estimatedMinutes}분
                </span>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-2">
                  <i className={`fas ${LEVELS.find(l => l.id === currentLevel)?.icon || 'fa-book'}`}></i>
                  {LEVELS.find(l => l.id === currentLevel)?.description || ''}
                </span>
              </div>
            </div>
            
            {/* 자가점검 버튼 */}
            <button
              onClick={() => setPhase('quiz')}
              className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition"
            >
              <i className="fas fa-clipboard-check"></i>
              <span>자가 점검</span>
            </button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* 왼쪽: 학습 콘텐츠 */}
          <div className="flex-1 min-w-0">
            {/* 콘텐츠 로딩 */}
            {isLoadingContent ? (
              <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-900 mx-auto"></div>
                <p className="mt-4 text-slate-500">콘텐츠를 불러오는 중...</p>
              </div>
            ) : currentSections.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                <i className="fas fa-book-open text-3xl text-slate-300 mb-4"></i>
                <p className="text-slate-500">이 레벨에는 아직 콘텐츠가 없습니다.</p>
                <p className="text-sm text-slate-400 mt-2">다른 레벨을 선택하거나 AI 멘토에게 질문해보세요.</p>
              </div>
            ) : (
              <>
                {/* 전체 펼치기/접기 */}
                <div className="flex justify-end mb-4 gap-4">
                  <button
                    onClick={() => toggleAllSections(true)}
                    className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                  >
                    <i className="fas fa-expand-alt"></i>모두 펼치기
                  </button>
                  <button
                    onClick={() => toggleAllSections(false)}
                    className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                  >
                    <i className="fas fa-compress-alt"></i>모두 접기
                  </button>
                </div>

                {/* 섹션 목록 (아코디언) */}
                <div className="space-y-3">
                  {currentSections.map((section, index) => (
                    <div key={section.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors">
                      {/* 섹션 헤더 */}
                      <button
                        onClick={() => toggleSection(section.sectionType)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm">
                            <i className={`fas ${SECTION_ICONS[section.sectionType] || 'fa-file'}`}></i>
                          </span>
                          <div className="text-left">
                            <h3 className="font-medium text-slate-900">{section.titleKo}</h3>
                            <p className="text-xs text-slate-500">약 {section.estimatedMinutes}분</p>
                          </div>
                        </div>
                        <i className={`fas fa-chevron-down text-slate-400 transition-transform duration-200 ${expandedSections.has(section.sectionType) ? 'rotate-180' : ''}`}></i>
                      </button>
                      
                      {/* 섹션 내용 */}
                      {expandedSections.has(section.sectionType) && (
                        <div className="px-5 pb-5 border-t border-slate-100">
                          <div className="pt-5 prose prose-slate prose-sm max-w-none prose-headings:text-slate-800 prose-a:text-blue-600 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {section.contentMd}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 자가 점검 버튼 - 모바일용 */}
            <div className="mt-8 lg:hidden bg-slate-900 rounded-lg p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">학습을 완료하셨나요?</h3>
                  <p className="text-slate-400 text-sm mt-1">자가 점검 퀴즈로 이해도를 확인해보세요</p>
                </div>
                <button
                  onClick={() => setPhase('quiz')}
                  className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition flex-shrink-0"
                >
                  <i className="fas fa-clipboard-check mr-2"></i>시작
                </button>
              </div>
            </div>
          </div>

          {/* 오른쪽: AI 멘토 - 고정 사이드바 */}
          <div className="hidden lg:flex w-[400px] flex-shrink-0 flex-col bg-white rounded-lg border border-slate-200 overflow-hidden sticky top-4 self-start" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
            {/* 채팅 헤더 */}
            <div className="p-4 bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center">
                  <i className="fas fa-robot text-sm"></i>
                </div>
                <div>
                  <h3 className="font-medium">AI 멘토</h3>
                  <p className="text-xs text-slate-400">궁금한 점을 물어보세요</p>
                </div>
              </div>
            </div>

            {/* 채팅 메시지 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {chatMessages.length === 0 && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-slate-200 flex items-center justify-center">
                    <i className="fas fa-comments text-xl text-slate-500"></i>
                  </div>
                  <p className="text-slate-500 text-sm mb-4">학습 중 궁금한 점을 물어보세요!</p>
                  <div className="space-y-2">
                    {SUGGESTED_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendChat(q)}
                        className="block w-full text-left text-sm px-3 py-2.5 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-slate-600"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-lg px-4 py-2.5 ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}>
                    {msg.role === 'assistant' ? (
                      msg.content ? (
                        <div className="prose prose-sm max-w-none prose-slate">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                      ) : null
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-lg px-4 py-3">
                    <span className="text-sm text-slate-500">답변 생성 중...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* 채팅 입력 */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendChat(chatInput)}
                  placeholder="질문을 입력하세요..."
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition text-sm bg-slate-50"
                  disabled={isChatLoading}
                />
                <button
                  onClick={() => handleSendChat(chatInput)}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="px-5 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleLearningPage;
