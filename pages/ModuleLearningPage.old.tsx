import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getCurriculumModule,
  streamModuleSection,
  streamModuleChat,
  getQuizQuestions,
  submitQuiz,
  updateModuleProgress,
} from '../services/apiClient';
import { CurriculumModule, QuizQuestion, QuizSubmitResponse, QuizAnswer } from '../types';

type Phase = 'learning' | 'quiz' | 'result';

interface LearningSection {
  id: string;
  title: string;
  icon: string;
  prompt: string;
  description: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const LEARNING_SECTIONS: LearningSection[] = [
  {
    id: 'overview',
    title: '개요',
    icon: 'fa-lightbulb',
    description: '핵심 개념을 이해합니다',
    prompt: `개요 및 핵심 개념에 대해 간결하게 설명해주세요.

다음 내용만 포함해주세요:
- 이 기능이 무엇인지 (2-3문장)
- 왜 중요한지 (비즈니스 가치)
- 핵심 용어 3-5개 (간단한 정의 포함)

마크다운 형식으로, 500자 이내로 작성해주세요.`
  },
  {
    id: 'features',
    title: '주요 기능',
    icon: 'fa-cogs',
    description: '실제 기능을 살펴봅니다',
    prompt: `주요 기능과 사용법에 대해 설명해주세요.

다음 형식으로 작성해주세요:
- 핵심 기능 3-4가지
- 각 기능별 간단한 설명 (2-3문장)
- 실제 사용 예시 1개씩

마크다운 형식으로, 800자 이내로 작성해주세요.`
  },
  {
    id: 'practice',
    title: '실무 활용',
    icon: 'fa-briefcase',
    description: '실무 팁을 배웁니다',
    prompt: `실무 활용 팁과 베스트 프랙티스를 알려주세요.

다음 내용을 포함해주세요:
- 실무에서 자주 사용하는 패턴 2-3가지
- 초보자가 자주 하는 실수와 해결법
- 효율적인 업무 처리를 위한 팁 2-3가지

마크다운 형식으로, 600자 이내로 작성해주세요.`
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: 'fa-question-circle',
    description: '자주 묻는 질문을 확인합니다',
    prompt: `자주 묻는 질문(FAQ) 3-4개를 Q&A 형식으로 작성해주세요.

실제 신입사원이 궁금해할 만한 질문을 선정하고,
간결하고 명확하게 답변해주세요.

마크다운 형식으로, 500자 이내로 작성해주세요.`
  },
];

const SUGGESTED_QUESTIONS = [
  '이 기능의 핵심이 뭐예요?',
  '실무에서 어떻게 활용하나요?',
  '자주 하는 실수가 있나요?',
];

const ModuleLearningPage: React.FC = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Module state
  const [module, setModule] = useState<CurriculumModule | null>(null);
  const [isLoadingModule, setIsLoadingModule] = useState(true);

  // Phase (자가 점검 - 난이도 구분 없음)
  const [phase, setPhase] = useState<Phase>('learning');

  // Section-based learning state
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionContents, setSectionContents] = useState<Record<string, string>>({});
  const [isLoadingSection, setIsLoadingSection] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

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
  const currentSection = LEARNING_SECTIONS[currentSectionIndex];

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

  // 현재 섹션 콘텐츠 로드
  useEffect(() => {
    const loadSectionContent = async () => {
      if (!moduleId || !sessionId || !module || phase !== 'learning') return;
      if (sectionContents[currentSection.id]) return;

      setIsLoadingSection(true);
      try {
        const stream = streamModuleSection(moduleId, sessionId, currentSection.id, currentSection.prompt);
        let content = '';
        for await (const event of stream) {
          if (event.event === 'result' && event.data?.text) {
            content = event.data.text as string;
          } else if (event.event === 'chunk' && event.data?.text) {
            content = event.data.text as string;
          }
        }
        setSectionContents(prev => ({ ...prev, [currentSection.id]: content }));
      } catch (error) {
        console.error('Failed to load section content:', error);
        setSectionContents(prev => ({
          ...prev,
          [currentSection.id]: '콘텐츠를 불러오는데 실패했습니다. 다시 시도해주세요.'
        }));
      } finally {
        setIsLoadingSection(false);
      }
    };
    loadSectionContent();
  }, [moduleId, sessionId, module, phase, currentSection, sectionContents]);

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
      
      // Add placeholder for assistant message
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

  // 다음 섹션
  const handleNextSection = useCallback(() => {
    setCompletedSections(prev => new Set([...prev, currentSection.id]));
    if (currentSectionIndex < LEARNING_SECTIONS.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  }, [currentSectionIndex, currentSection.id]);

  // 이전 섹션
  const handlePrevSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  }, [currentSectionIndex]);

  // 학습 완료 → 자가 점검 시작
  const handleStartQuiz = useCallback(async () => {
    if (!moduleId || !sessionId) return;
    try {
      await updateModuleProgress(moduleId, sessionId, { learningCompleted: true });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
    setPhase('quiz');
  }, [moduleId, sessionId]);

  // 답변 선택
  const handleAnswerSelect = (questionId: string, choiceId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: choiceId }));
  };

  // 다음 문제
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // 이전 문제
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // 자가 점검 제출
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
        startedAt: quizStartTime?.toISOString(),
      });
      setResult(response);
      setPhase('result');
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('자가 점검 제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 결과 확인 후 다음 단계
  const handleNextStep = () => {
    // 모듈 목록으로 돌아가기
    navigate('/curriculum/modules');
  };

  if (isLoadingModule) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">모듈 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-exclamation-triangle text-4xl text-amber-500 mb-4"></i>
          <p className="text-slate-600 mb-4">모듈을 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/curriculum/modules')}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const learningProgress = ((currentSectionIndex + (completedSections.has(currentSection.id) ? 1 : 0)) / LEARNING_SECTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/curriculum/modules')}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="fa-solid fa-arrow-left text-lg"></i>
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{module.nameKo}</h1>
                <p className="text-sm text-slate-500">
                  {phase === 'learning' && `${currentSectionIndex + 1}/${LEARNING_SECTIONS.length} - ${currentSection.title}`}
                  {phase === 'quiz' && '자가 점검'}
                  {phase === 'result' && '결과'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-500"
            style={{
              width: phase === 'learning'
                ? `${learningProgress}%`
                : phase === 'quiz'
                ? `${((currentQuestionIndex + 1) / Math.max(questions.length, 1)) * 100}%`
                : '100%',
            }}
          />
        </div>
      </header>

      {/* Learning Phase */}
      {phase === 'learning' && (
        <main className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section Navigation Pills */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {LEARNING_SECTIONS.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      if (index <= currentSectionIndex || completedSections.has(LEARNING_SECTIONS[index - 1]?.id)) {
                        setCurrentSectionIndex(index);
                      }
                    }}
                    disabled={index > currentSectionIndex && !completedSections.has(LEARNING_SECTIONS[index - 1]?.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      index === currentSectionIndex
                        ? 'bg-primary-500 text-white shadow-md'
                        : completedSections.has(section.id)
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-white text-slate-500 border border-slate-200'
                    } ${index > currentSectionIndex && !completedSections.has(LEARNING_SECTIONS[index - 1]?.id) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}`}
                  >
                    <i className={`fa-solid ${section.icon}`}></i>
                    <span>{section.title}</span>
                    {completedSections.has(section.id) && <i className="fa-solid fa-check text-xs"></i>}
                  </button>
                ))}
              </div>

              {/* Content Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Section Header */}
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-primary-50 to-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <i className={`fa-solid ${currentSection.icon} text-xl text-primary-600`}></i>
                    </div>
                    <div>
                      <div className="text-sm text-primary-600 font-medium">
                        Step {currentSectionIndex + 1} of {LEARNING_SECTIONS.length}
                      </div>
                      <h2 className="text-xl font-bold text-slate-800">{currentSection.title}</h2>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 min-h-[300px]">
                  {isLoadingSection ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-4">
                      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-500">콘텐츠를 준비하고 있습니다...</p>
                    </div>
                  ) : (
                    <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-strong:text-slate-700 prose-ul:text-slate-600 prose-li:marker:text-primary-500">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {sectionContents[currentSection.id] || ''}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                  <button
                    onClick={handlePrevSection}
                    disabled={currentSectionIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>이전</span>
                  </button>

                  {currentSectionIndex < LEARNING_SECTIONS.length - 1 ? (
                    <button
                      onClick={handleNextSection}
                      disabled={isLoadingSection}
                      className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      <span>다음 섹션</span>
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartQuiz}
                      disabled={isLoadingSection}
                      className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      <span>자가 점검 시작</span>
                      <i className="fa-solid fa-play"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* AI Mentor Chat Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-robot text-purple-600"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">AI 멘토</h3>
                      <p className="text-xs text-slate-500">{module.nameKo} 학습 도우미</p>
                    </div>
                    <button
                      onClick={() => setIsChatExpanded(!isChatExpanded)}
                      className="ml-auto text-slate-400 hover:text-slate-600 lg:hidden"
                    >
                      <i className={`fa-solid fa-chevron-${isChatExpanded ? 'down' : 'up'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className={`${isChatExpanded || 'hidden lg:block'}`}>
                  <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <i className="fa-solid fa-comments text-4xl text-slate-300 mb-3"></i>
                        <p className="text-sm text-slate-500 mb-4">궁금한 점을 물어보세요!</p>
                        <div className="space-y-2">
                          {SUGGESTED_QUESTIONS.map((q, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendChat(q)}
                              className="w-full text-left px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                            >
                              <i className="fa-solid fa-lightbulb text-amber-500 mr-2"></i>
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] px-4 py-2 rounded-2xl ${
                              msg.role === 'user'
                                ? 'bg-primary-500 text-white rounded-br-md'
                                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md'
                            }`}
                          >
                            {msg.role === 'assistant' ? (
                              <div className="prose prose-sm prose-slate max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {msg.content || '...'}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-sm">{msg.content}</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="p-3 border-t border-slate-100 bg-white">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChat(chatInput)}
                        placeholder="질문을 입력하세요..."
                        className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        disabled={isChatLoading}
                      />
                      <button
                        onClick={() => handleSendChat(chatInput)}
                        disabled={!chatInput.trim() || isChatLoading}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isChatLoading ? (
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fa-solid fa-paper-plane"></i>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Quiz Phase (자가 점검) */}
      {phase === 'quiz' && questions.length > 0 && (
        <main className="max-w-3xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {/* Quiz Header */}
            <div className="flex items-center justify-between">
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                자가 점검
              </span>
              <span className="text-slate-500">
                <span className="text-slate-800 font-bold">{currentQuestionIndex + 1}</span> / {questions.length}
              </span>
            </div>

            {/* Question Numbers */}
            <div className="flex gap-2 flex-wrap">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQuestionIndex(i)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                    i === currentQuestionIndex
                      ? 'bg-primary-500 text-white shadow-md scale-105'
                      : selectedAnswers[questions[i].id]
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6">
                {questions[currentQuestionIndex].context && (
                  <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-500 italic">{questions[currentQuestionIndex].context}</p>
                  </div>
                )}
                <h3 className="text-lg font-medium text-slate-800">
                  {questions[currentQuestionIndex].question}
                </h3>
              </div>

              <div className="p-6 pt-0 space-y-3">
                {questions[currentQuestionIndex].choices.map((choice, index) => (
                  <button
                    key={choice.id}
                    onClick={() => handleAnswerSelect(questions[currentQuestionIndex].id, choice.id)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                      selectedAnswers[questions[currentQuestionIndex].id] === choice.id
                        ? 'bg-primary-50 border-primary-500 text-slate-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        selectedAnswers[questions[currentQuestionIndex].id] === choice.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{choice.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-arrow-left"></i>
                <span>이전</span>
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(selectedAnswers).length !== questions.length || isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>제출 중...</span>
                    </>
                  ) : (
                    <>
                      <span>제출하기</span>
                      <i className="fa-solid fa-check"></i>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  <span>다음</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Result Phase (자가 점검 결과 - 통과/불통과 없음) */}
      {phase === 'result' && result && (
        <main className="max-w-2xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            {/* Score */}
            <div className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center border-4 bg-blue-50 border-blue-500 text-blue-600">
              <div>
                <div className="text-4xl font-bold">{result.score}</div>
                <div className="text-sm opacity-75">점</div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              자가 점검 완료! 📋
            </h2>
            <p className="text-slate-500 mb-6">
              {result.correctCount === result.totalQuestions 
                ? '모든 문제를 맞추셨네요! 훌륭합니다.'
                : result.correctCount > result.totalQuestions / 2
                ? '잘 하셨어요! 틀린 문제를 복습해보세요.'
                : '틀린 문제를 복습하고 다시 학습해보세요.'}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">{result.correctCount}</div>
                <div className="text-sm text-slate-500">정답</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-600">{result.totalQuestions - result.correctCount}</div>
                <div className="text-sm text-slate-500">오답</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-slate-700">
                  {result.durationSeconds ? `${Math.floor(result.durationSeconds / 60)}:${(result.durationSeconds % 60).toString().padStart(2, '0')}` : '-'}
                </div>
                <div className="text-sm text-slate-500">소요시간</div>
              </div>
            </div>

            {/* Review */}
            <details className="text-left mb-6">
              <summary className="cursor-pointer text-slate-600 hover:text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-list-check"></i>
                <span>문제 리뷰 보기</span>
              </summary>
              <div className="mt-4 space-y-3">
                {result.answers.map((answer, i) => {
                  const question = questions.find(q => q.id === answer.questionId);
                  return (
                    <div key={answer.questionId} className={`p-4 rounded-xl border ${
                      answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                          answer.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {answer.isCorrect ? '✓' : '✗'}
                        </span>
                        <div>
                          <p className="text-sm text-slate-700 mb-1">
                            {i + 1}. {question?.question}
                          </p>
                          {!answer.isCorrect && (
                            <>
                              <p className="text-sm text-green-600">
                                정답: {question?.choices.find(c => c.id === answer.correctChoiceId)?.text}
                              </p>
                              {answer.explanation && (
                                <p className="text-sm text-slate-500 mt-1 italic">
                                  💡 {answer.explanation}
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
            </details>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPhase('quiz');
                  setResult(null);
                }}
                className="flex-1 px-6 py-3 text-slate-700 bg-slate-100 rounded-xl font-medium hover:bg-slate-200"
              >
                다시 풀기 ↺
              </button>
              <button
                onClick={handleNextStep}
                className="flex-1 px-6 py-3 text-white bg-primary-500 rounded-xl font-medium hover:bg-primary-600 shadow-sm"
              >
                완료 ✓
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default ModuleLearningPage;
