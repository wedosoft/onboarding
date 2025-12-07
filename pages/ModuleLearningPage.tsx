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

  // 퀴즈 결과 화면 - Modern Deep Glass Style
  if (phase === 'result' && result) {
    return (
      <div className="min-h-screen pb-12 -mt-2">
        {/* 히어로 헤더 */}
        <div className="relative overflow-hidden mb-8 rounded-3xl shadow-xl glass-card border border-white/50">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/95 via-slate-900 to-slate-900 z-0"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] opacity-30 z-10 pointer-events-none"></div>

          <div className="relative z-20 px-6 py-10 max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-display font-bold text-white mb-2">자가 점검 결과</h1>
            <p className="text-slate-300 mb-8">{module.nameKo}</p>

            <div className="inline-block relative">
              <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 rounded-full"></div>
              <div className="relative glass-card rounded-3xl p-8 border border-white/20 min-w-[300px]">
                <div className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-300 mb-2">
                  {result.score}
                  <span className="text-2xl text-slate-400 ml-1">점</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-emerald-300 font-medium bg-emerald-500/10 py-1 px-3 rounded-full mx-auto w-fit border border-emerald-500/20">
                  <i className="fas fa-check-circle"></i>
                  <span>{result.correctCount}개 정답 / {result.totalQuestions}문항</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={handleGoBack}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold backdrop-blur-md transition border border-white/10 flex items-center gap-2"
              >
                <i className="fas fa-arrow-left"></i> 목록으로
              </button>
              <button
                onClick={() => {
                  setPhase('learning');
                  setCurrentQuestionIndex(0);
                  setSelectedAnswers({});
                  setResult(null);
                }}
                className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition shadow-lg shadow-white/10 flex items-center gap-2"
              >
                <i className="fas fa-redo"></i> 다시 학습하기
              </button>
            </div>
          </div>
        </div>

        {/* 결과 상세 리스트 */}
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
            <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">상세 분석</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
          </div>

          {result.answers.map((r, idx) => {
            const question = questions.find(q => q.id === r.questionId);
            if (!question) return null;

            const isCorrect = r.isCorrect;

            return (
              <div key={r.questionId} className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 border 
                ${isCorrect ? 'border-emerald-200/50 hover:shadow-emerald-500/10' : 'border-rose-200/50 hover:shadow-rose-500/10'} hover:shadow-xl`}>
                <div className={`px-6 py-4 flex items-center justify-between ${isCorrect ? 'bg-emerald-50/50' : 'bg-rose-50/50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm
                      ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                      Q{idx + 1}
                    </span>
                    <span className={`font-bold text-sm uppercase tracking-wide ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isCorrect ? '정답입니다' : '오답입니다'}
                    </span>
                  </div>
                  {isCorrect ? (
                    <i className="fas fa-check text-emerald-500 text-xl"></i>
                  ) : (
                    <i className="fas fa-times text-rose-500 text-xl"></i>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">{question.question}</h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-400 mt-1 min-w-[40px]">내 답안</span>
                      <span className={`font-medium ${isCorrect ? 'text-slate-700' : 'text-rose-600 line-through'}`}>
                        {question.choices.find(c => c.id === r.choiceId)?.text}
                      </span>
                    </div>

                    {!isCorrect && (
                      <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-500 mt-1 min-w-[40px]">정답</span>
                        <span className="font-bold text-emerald-700">
                          {question.choices.find(c => c.id === r.correctChoiceId)?.text}
                        </span>
                      </div>
                    )}
                  </div>

                  {r.explanation && (
                    <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 border border-slate-100 flex items-start gap-3">
                      <i className="fas fa-lightbulb text-amber-500 mt-0.5"></i>
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">해설</span>
                        {r.explanation}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 퀴즈 화면 - Modern Deep Glass Style
  if (phase === 'quiz') {
    const currentQuestion = questions[currentQuestionIndex];
    const allAnswered = questions.length > 0 && Object.keys(selectedAnswers).length === questions.length;
    const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen pb-12 -mt-2">
        {/* 축소된 헤더 */}
        <div className="relative overflow-hidden mb-6 rounded-3xl shadow-lg glass-card border border-white/50">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/95 via-slate-900 to-slate-900 z-0"></div>

          <div className="relative z-20 px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPhase('learning')}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition backdrop-blur-md"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">자가 점검</h1>
                <p className="text-slate-400 text-sm">{module.nameKo}</p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-white font-bold text-lg mb-1">
                <span className="text-primary-400">{currentQuestionIndex + 1}</span>
                <span className="text-slate-500 mx-1">/</span>
                {questions.length}
              </span>
              <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 퀴즈 컨텐츠 */}
        <div className="max-w-3xl mx-auto px-4">
          {currentQuestion ? (
            <div className="glass-card rounded-3xl p-8 border border-white/60 shadow-xl relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-full blur-2xl -mr-10 -mt-10 opacity-60"></div>

              <div className="relative z-10">
                <div className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 border border-slate-200">
                  Question {currentQuestionIndex + 1}
                </div>

                <h2 className="text-2xl font-display font-bold text-slate-900 mb-6 leading-snug">
                  {currentQuestion.question}
                </h2>

                {currentQuestion.context && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-600 text-sm mb-8 italic flex items-start gap-3">
                    <i className="fas fa-quote-left text-slate-300 text-xl"></i>
                    {currentQuestion.context}
                  </div>
                )}

                <div className="space-y-3">
                  {currentQuestion.choices.map((choice) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === choice.id;
                    return (
                      <button
                        key={choice.id}
                        onClick={() => handleAnswerSelect(currentQuestion.id, choice.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group
                          ${isSelected
                            ? 'border-primary-500 bg-primary-50 text-primary-900 shadow-md ring-1 ring-primary-500/20'
                            : 'border-slate-100 bg-white hover:border-primary-200 hover:bg-slate-50 text-slate-700'
                          }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                          ${isSelected ? 'border-primary-500 bg-primary-500 text-white' : 'border-slate-300 group-hover:border-primary-300'}`}>
                          {isSelected && <i className="fas fa-check text-xs"></i>}
                        </div>
                        <span className="font-medium">{choice.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 하단 네비게이션 */}
              <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-5 py-2.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition flex items-center gap-2"
                >
                  <i className="fas fa-arrow-left"></i>이전 문제
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition font-bold shadow-lg shadow-slate-900/10 flex items-center gap-2"
                  >
                    다음 문제 <i className="fas fa-arrow-right"></i>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={!allAnswered || isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl hover:from-primary-500 hover:to-indigo-500 transition font-bold shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:shadow-none flex items-center gap-2 transform active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>채점 중...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-flag-checkered"></i>
                        <span>제출하기</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-card rounded-3xl p-12 text-center border border-white/60">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-primary-500">
                  <i className="fas fa-question text-xl"></i>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">문제를 준비하고 있습니다</h3>
              <p className="text-slate-500">AI가 학습 내용을 바탕으로 문제를 생성 중입니다...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 학습 화면 (정적 콘텐츠) - Modern Deep Glass Style
  return (
    <div className="flex h-full overflow-hidden">
        {/* 왼쪽: 학습 콘텐츠 (70%) */}
        <div className="flex-1 flex flex-col h-full min-w-0">
          {/* 컴팩트 히어로 헤더 */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-3">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={handleGoBack}
                  className="flex items-center gap-2 text-white/60 hover:text-white text-sm"
                >
                  <i className="fas fa-arrow-left"></i>
                  <span>목록으로</span>
                </button>
                
                {/* 레벨 & 자가점검 탭 */}
                <div className="flex gap-1">
                  {availableLevels.map((level) => {
                    const levelInfo = LEVELS.find(l => l.id === level) || { name: level };
                    const isActive = currentLevel === level;
                    return (
                      <button
                        key={level}
                        onClick={() => {
                          setCurrentLevel(level);
                          setExpandedSections(new Set(['overview']));
                        }}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          isActive 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {levelInfo.name}
                      </button>
                    );
                  })}
                  <div className="w-px bg-white/20 mx-1"></div>
                  <button
                    onClick={() => setPhase('quiz')}
                    className="px-3 py-1 bg-white/10 text-white/70 hover:bg-white/20 rounded text-xs font-medium"
                  >
                    <i className="fas fa-clipboard-check mr-1"></i>자가 점검
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-white mb-1">{module.nameKo}</h1>
                  <p className="text-white/70 text-xs">{module.description}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/60 ml-6">
                  <span className="flex items-center gap-1">
                    <i className="fas fa-clock"></i>
                    약 {module.estimatedMinutes}분
                  </span>
                  <span className="flex items-center gap-1">
                    <i className={`fas ${LEVELS.find(l => l.id === currentLevel)?.icon || 'fa-book'}`}></i>
                    핵심 개념
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 스크롤 가능한 콘텐츠 영역 */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <div className="max-w-5xl mx-auto px-2">{/* 콘텐츠 로딩 */}
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
          </div>
        </div>

        {/* 오른쪽: AI 멘토 채팅 (30%) */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full flex-shrink-0">
          {/* 채팅 헤더 */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <i className="fas fa-robot text-white"></i>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">고복수 팀장</h3>
                <p className="text-xs text-gray-500">실시간 질의응답</p>
              </div>
            </div>
          </div>

          {/* 채팅 메시지 영역 */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">
            {chatMessages.length === 0 && (
              <div className="text-center">
                <div className="inline-block p-3 bg-blue-50 rounded-full mb-3">
                  <i className="fas fa-comments text-blue-500 text-2xl"></i>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  학습 내용을 기반으로 답변해드립니다.<br/>
                  궁금한 점을 선택해보세요!
                </p>
                <div className="space-y-2">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendChat(q)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition border border-gray-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-1">
                    <i className="fas fa-robot"></i>
                  </div>
                )}
                <div className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
                  }`}>
                  {msg.role === 'assistant' && msg.content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs mr-2">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* 채팅 입력 */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendChat(chatInput)}
                placeholder="무엇이든 물어보세요..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isChatLoading}
              />
              <button
                onClick={() => handleSendChat(chatInput)}
                disabled={!chatInput.trim() || isChatLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ModuleLearningPage;
