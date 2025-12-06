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
  'feature-basic': 'fa-cogs',
  'feature-advanced': 'fa-rocket',
  practice: 'fa-briefcase',
  quiz: 'fa-check-circle',
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
      const response = await submitQuiz(moduleId, {
        sessionId,
        moduleId,
        answers,
        startedAt: quizStartTime?.toISOString()
      });
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
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
          <button onClick={handleGoBack} className="mt-4 text-primary-500 hover:underline">
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 현재 레벨의 섹션들 (백엔드에서 내려준 sectionType을 그대로 사용)
  const currentSections = (contentData?.sections[currentLevel] || []).slice().sort((a, b) => a.displayOrder - b.displayOrder);
  const availableLevels = contentData?.levels || ['basic'];

  // 퀴즈 결과 화면
  if (phase === 'result' && result) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* 헤더 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <button onClick={handleGoBack} className="text-slate-500 hover:text-slate-700 mb-4">
              <i className="fas fa-arrow-left mr-2"></i>목록으로
            </button>
            <h1 className="text-2xl font-bold text-slate-800">{module.nameKo} - 자가 점검 결과</h1>
          </div>

          {/* 점수 카드 */}
          <div className="bg-gradient-to-r from-primary-500 to-indigo-600 rounded-xl shadow-lg p-8 text-white text-center mb-6">
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
            <h2 className="text-lg font-semibold text-slate-800">문제별 결과</h2>
            {result.answers.map((r, idx) => {
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
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${selectedAnswers[currentQuestion.id] === choice.id
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
                className={`w-8 h-8 rounded-full text-sm font-medium transition ${idx === currentQuestionIndex
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

  // 학습 화면 (정적 콘텐츠) - Modern Deep Glass Style
  return (
    <div className="min-h-screen pb-12 -mt-2">
      {/* 히어로 헤더 - Glass & Gradient */}
      <div className="relative overflow-hidden mb-8 rounded-b-3xl">
        <div className="absolute inset-0 bg-slate-900 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-900 z-10"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[100px] opacity-50 z-10 pointer-events-none"></div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 py-10">
          {/* 상단: 뒤로가기 + 레벨 탭 */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-white/60 hover:text-white transition group w-fit"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 backdrop-blur-sm transition-colors">
                <i className="fas fa-arrow-left group-hover:-translate-x-0.5 transition-transform text-sm"></i>
              </div>
              <span className="text-sm font-medium">목록으로</span>
            </button>

            {/* 레벨 탭 */}
            <div className="flex p-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 w-fit self-start lg:self-auto">
              {availableLevels.map((level) => {
                const levelInfo = LEVELS.find(l => l.id === level) || { name: level, icon: 'fa-book', description: '' };
                const isActive = currentLevel === level;
                return (
                  <button
                    key={level}
                    onClick={() => {
                      setCurrentLevel(level);
                      setExpandedSections(new Set(['overview']));
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 text-sm relative ${isActive ? 'text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-primary-500 rounded-lg shadow-lg shadow-primary-500/30 -z-10 animate-fade-in"></div>
                    )}
                    <i className={`fas ${levelInfo.icon}`}></i>
                    {levelInfo.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 모듈 정보 */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-primary-300">
                  Module {module.id.toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-white tracking-tight mb-4 leading-tight">{module.nameKo}</h1>
              <p className="text-white/70 text-lg max-w-2xl leading-relaxed">{module.description}</p>

              <div className="mt-6 flex flex-wrap items-center gap-6 text-sm font-medium text-white/50">
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <i className="fas fa-clock text-primary-400"></i>
                  약 {module.estimatedMinutes}분
                </span>
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <i className={`fas ${LEVELS.find(l => l.id === currentLevel)?.icon || 'fa-book'} text-primary-400`}></i>
                  {LEVELS.find(l => l.id === currentLevel)?.description || ''}
                </span>
              </div>
            </div>

            {/* 자가점검 버튼 */}
            <button
              onClick={() => setPhase('quiz')}
              className="hidden lg:flex items-center gap-3 px-6 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-indigo-50 transition shadow-lg shadow-black/20 group"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-clipboard-check"></i>
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-500 font-medium">학습 완료 후</div>
                <div className="text-base">자가 점검 시작</div>
              </div>
              <i className="fas fa-chevron-right ml-2 text-slate-300 group-hover:text-indigo-500 transition-colors"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 왼쪽: 학습 콘텐츠 (약 70%) */}
          <div className="flex-1 min-w-0">
            {/* 콘텐츠 로딩 */}
            {isLoadingContent ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 font-medium">콘텐츠를 불러오는 중...</p>
              </div>
            ) : currentSections.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-book-open text-3xl text-slate-300"></i>
                </div>
                <p className="text-slate-600 font-bold text-lg mb-2">이 레벨에는 아직 콘텐츠가 없습니다.</p>
                <p className="text-sm text-slate-400">다른 레벨을 선택하거나 AI 멘토에게 질문해보세요.</p>
              </div>
            ) : (
              <>
                {/* 전체 펼치기/접기 */}
                <div className="flex justify-end mb-4 gap-3">
                  <button
                    onClick={() => toggleAllSections(true)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <i className="fas fa-expand-alt"></i>모두 펼치기
                  </button>
                  <button
                    onClick={() => toggleAllSections(false)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <i className="fas fa-compress-alt"></i>모두 접기
                  </button>
                </div>

                {/* 섹션 목록 (아코디언) */}
                <div className="space-y-4">
                  {currentSections.map((section, index) => (
                    <div
                      key={section.id}
                      className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 border border-white/60
                        ${expandedSections.has(section.sectionType) ? 'shadow-xl ring-1 ring-primary-500/10' : 'hover:shadow-md'}
                      `}
                    >
                      {/* 섹션 헤더 */}
                      <button
                        onClick={() => toggleSection(section.sectionType)}
                        className={`w-full px-6 py-5 flex items-center justify-between transition-colors
                          ${expandedSections.has(section.sectionType) ? 'bg-primary-50/30' : 'hover:bg-white/50'}
                        `}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-sm transition-all
                            ${expandedSections.has(section.sectionType)
                              ? 'bg-gradient-to-br from-primary-500 to-indigo-600 text-white scale-110'
                              : 'bg-white text-slate-400 border border-slate-100'}
                          `}>
                            <i className={`fas ${SECTION_ICONS[section.sectionType] || 'fa-file'}`}></i>
                          </div>
                          <div className="text-left">
                            <h3 className={`font-bold text-lg transition-colors ${expandedSections.has(section.sectionType) ? 'text-primary-800' : 'text-slate-700'}`}>
                              {section.titleKo}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                              <i className="far fa-clock mr-1"></i>
                              약 {section.estimatedMinutes}분
                            </p>
                          </div>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                          ${expandedSections.has(section.sectionType) ? 'bg-primary-100 text-primary-600 rotate-180' : 'bg-slate-100 text-slate-400'}
                        `}>
                          <i className="fas fa-chevron-down"></i>
                        </div>
                      </button>

                      {/* 섹션 내용 */}
                      {expandedSections.has(section.sectionType) && (
                        <div className="px-8 pb-8 pt-2">
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary-100 to-transparent mb-6"></div>
                          <div className="prose prose-slate prose-lg max-w-none 
                            prose-headings:font-display prose-headings:font-bold prose-headings:text-slate-800 
                            prose-h3:text-primary-700 prose-h3:text-xl
                            prose-p:text-slate-600 prose-p:leading-relaxed
                            prose-strong:text-slate-900 prose-strong:font-bold
                            prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                            prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-medium
                            prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:shadow-lg
                            prose-blockquote:border-l-4 prose-blockquote:border-primary-400 prose-blockquote:bg-primary-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                            prose-img:rounded-xl prose-img:shadow-md
                          ">
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
            <div className="mt-8 lg:hidden glass-dark rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg">학습을 완료하셨나요?</h3>
                  <p className="text-slate-400 text-sm mt-1">자가 점검 퀴즈로 이해도를 확인해보세요</p>
                </div>
                <button
                  onClick={() => setPhase('quiz')}
                  className="px-5 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition shadow-lg flex-shrink-0"
                >
                  <i className="fas fa-clipboard-check mr-2"></i>시작
                </button>
              </div>
            </div>
          </div>

          {/* 오른쪽: AI 멘토 - 고정 사이드바 (약 30%) */}
          <div className="hidden lg:flex basis-[350px] xl:basis-[400px] flex-shrink-0 flex-col glass-card rounded-2xl overflow-hidden sticky top-6 self-start shadow-xl shadow-slate-200/50 border border-white/60" style={{ maxHeight: 'calc(100vh - 3rem)' }}>
            {/* 채팅 헤더 */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                  <i className="fas fa-robot text-primary-300"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI 학습 멘토</h3>
                  <p className="text-xs text-slate-400 font-medium">실시간 질의응답</p>
                </div>
              </div>
            </div>

            {/* 채팅 메시지 */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50 scroll-smooth">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    <i className="fas fa-comments text-2xl text-primary-300"></i>
                  </div>
                  <p className="text-slate-500 font-medium text-sm mb-6">학습 내용을 기반으로 답변해드립니다.<br />궁금한 점을 선택해보세요!</p>
                  <div className="space-y-2.5">
                    {SUGGESTED_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendChat(q)}
                        className="block w-full text-left text-xs font-medium px-4 py-3 bg-white rounded-xl border border-slate-200 hover:border-primary-400 hover:text-primary-700 hover:shadow-md transition-all text-slate-600 shadow-sm"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-1 shadow-md border border-slate-700">
                      <i className="fas fa-robot"></i>
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                    }`}>
                    {msg.role === 'assistant' ? (
                      msg.content ? (
                        <div className="prose prose-sm max-w-none 
                          prose-p:text-slate-700 prose-headings:text-slate-800 prose-strong:text-indigo-700 prose-a:text-indigo-600
                          prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1 prose-code:rounded
                        ">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="flex gap-1.5 py-1">
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      )
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && chatMessages[chatMessages.length - 1]?.role === 'user' && ( // Show loading only if last msg was user (waiting for assistant start)
                <div className="flex justify-start animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-1 shadow-md border border-slate-700">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm">
                    <div className="flex gap-1.5 py-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* 채팅 입력 */}
            <div className="p-4 border-t border-white/60 bg-white/50 backdrop-blur-md">
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendChat(chatInput)}
                  placeholder="무엇이든 물어보세요..."
                  className="w-full pl-5 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition text-sm shadow-inner"
                  disabled={isChatLoading}
                />
                <button
                  onClick={() => handleSendChat(chatInput)}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:bg-slate-300 transition flex items-center justify-center shadow-lg"
                >
                  <i className={`fas ${isChatLoading ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-xs`}></i>
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
