import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getCurriculumModule,
  streamModuleLearning,
  getQuizQuestions,
  submitQuiz,
  updateModuleProgress,
} from '../services/apiClient';
import { CurriculumModule, QuizQuestion, QuizSubmitResponse, QuizAnswer } from '../types';
import ModuleChatSidebar from '../components/ModuleChatSidebar';

type Phase = 'learning' | 'quiz' | 'result';
type Difficulty = 'basic' | 'advanced';

const ModuleLearningPage: React.FC = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();
  const contentRef = useRef<HTMLDivElement>(null);

  // Module state
  const [module, setModule] = useState<CurriculumModule | null>(null);
  const [isLoadingModule, setIsLoadingModule] = useState(true);

  // Phase & Difficulty
  const [phase, setPhase] = useState<Phase>('learning');
  const [difficulty, setDifficulty] = useState<Difficulty>('basic');

  // Learning state
  const [learningContent, setLearningContent] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sessionId = localStorage.getItem('onboarding_session_id') || '';

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

  // 학습 콘텐츠 로드 (RAG 기반 스트리밍)
  useEffect(() => {
    const loadContent = async () => {
      if (!moduleId || !sessionId) return;

      setIsLoadingContent(true);
      setLearningContent('');

      try {
        const stream = streamModuleLearning(moduleId, sessionId);
        for await (const event of stream) {
          if (event.data?.text) {
            setLearningContent((prev) => prev + event.data.text);
          }
        }
      } catch (error) {
        console.error('Failed to load learning content:', error);
        setLearningContent('학습 콘텐츠를 불러오는데 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoadingContent(false);
      }
    };

    if (phase === 'learning') {
      loadContent();
    }
  }, [moduleId, sessionId, phase]);

  // 퀴즈 문제 로드
  useEffect(() => {
    const loadQuestions = async () => {
      if (!moduleId) return;

      try {
        const data = await getQuizQuestions(moduleId, difficulty);
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
  }, [moduleId, phase, difficulty]);

  // 학습 완료 처리
  const handleLearningComplete = useCallback(async () => {
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
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  // 다음 문제
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // 이전 문제
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
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
        difficulty,
        answers,
        startedAt: quizStartTime?.toISOString(),
      });

      setResult(response);
      setPhase('result');
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('퀴즈 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 다음 난이도 또는 완료
  const handleNextStep = () => {
    if (result?.isPassed && difficulty === 'basic') {
      // 기초 통과 → 심화로
      setDifficulty('advanced');
      setPhase('quiz');
      setResult(null);
    } else if (result?.isPassed && difficulty === 'advanced') {
      // 심화 통과 → 모듈 완료
      navigate('/assessment/products/freshservice');
    } else {
      // 불통과 → 재시도
      setPhase('quiz');
      setResult(null);
    }
  };

  // 콘텐츠 스크롤
  useEffect(() => {
    if (contentRef.current && learningContent) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [learningContent]);

  if (isLoadingModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">모듈 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-exclamation-triangle text-4xl text-yellow-400 mb-4"></i>
          <p className="text-slate-300 mb-4">모듈을 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/assessment/products/freshservice')}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 transition-all duration-300 ${isSidebarOpen ? 'mr-96' : ''}`}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/assessment/products/freshservice')}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{module.nameKo}</h1>
                <p className="text-sm text-slate-400">
                  {phase === 'learning' && '학습 중'}
                  {phase === 'quiz' && `${difficulty === 'basic' ? '기초' : '심화'} 퀴즈`}
                  {phase === 'result' && '결과'}
                </p>
              </div>
            </div>
            
            {/* AI 멘토 버튼 */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isSidebarOpen
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 text-slate-300 hover:bg-dark-600'
              }`}
            >
              <i className="fa-solid fa-robot"></i>
              <span className="text-sm">AI 멘토</span>
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-dark-800">
        <div
          className="h-full bg-primary-500 transition-all duration-500"
          style={{
            width:
              phase === 'learning'
                ? '33%'
                : phase === 'quiz'
                ? `${33 + (currentQuestionIndex / Math.max(questions.length, 1)) * 33}%`
                : '100%',
          }}
        />
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Learning Phase */}
        {phase === 'learning' && (
          <div className="space-y-6">
            {/* Content Card */}
            <div className="glass-card bg-dark-800/50 rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
                    <i className={`fa-solid fa-${module.icon || 'book'} text-primary-400`}></i>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{module.nameKo}</h2>
                    <p className="text-sm text-slate-400">{module.description}</p>
                  </div>
                </div>
              </div>

              <div
                ref={contentRef}
                className="p-6 max-h-[60vh] overflow-y-auto prose prose-invert prose-sm max-w-none 
                  prose-headings:text-primary-300 prose-strong:text-primary-200 
                  prose-a:text-primary-400 prose-code:text-primary-300
                  prose-pre:bg-dark-900 prose-pre:border prose-pre:border-white/10"
              >
                {isLoadingContent && !learningContent ? (
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>학습 콘텐츠를 생성하는 중...</span>
                  </div>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{learningContent}</ReactMarkdown>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate('/assessment/products/freshservice')}
                className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-arrow-left mr-2"></i>
                목록으로
              </button>
              <button
                onClick={handleLearningComplete}
                disabled={isLoadingContent}
                className="px-8 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary-500/20"
              >
                학습 완료, 퀴즈 시작
                <i className="fa-solid fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        )}

        {/* Quiz Phase */}
        {phase === 'quiz' && questions.length > 0 && (
          <div className="space-y-6">
            {/* Quiz Header */}
            <div className="glass-card bg-dark-800/50 rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      difficulty === 'basic'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    }`}
                  >
                    {difficulty === 'basic' ? '기초' : '심화'}
                  </span>
                  <span className="text-slate-400">
                    {currentQuestionIndex + 1} / {questions.length}
                  </span>
                </div>
                <div className="flex gap-1">
                  {questions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQuestionIndex(i)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        i === currentQuestionIndex
                          ? 'bg-primary-500 text-white'
                          : selectedAnswers[questions[i].id]
                          ? 'bg-primary-500/20 text-primary-300'
                          : 'bg-dark-700 text-slate-400 hover:bg-dark-600'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question */}
              <div className="mb-6">
                {questions[currentQuestionIndex].context && (
                  <div className="mb-4 p-4 bg-dark-900/50 rounded-lg border border-white/5">
                    <p className="text-sm text-slate-400">{questions[currentQuestionIndex].context}</p>
                  </div>
                )}
                <h3 className="text-lg font-medium text-white">
                  {questions[currentQuestionIndex].question}
                </h3>
              </div>

              {/* Choices */}
              <div className="space-y-3">
                {questions[currentQuestionIndex].choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleAnswerSelect(questions[currentQuestionIndex].id, choice.id)}
                    className={`w-full p-4 text-left rounded-xl border transition-all ${
                      selectedAnswers[questions[currentQuestionIndex].id] === choice.id
                        ? 'bg-primary-500/10 border-primary-500 text-white'
                        : 'bg-dark-700/50 border-white/10 text-slate-300 hover:bg-dark-700 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                          selectedAnswers[questions[currentQuestionIndex].id] === choice.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-600 text-slate-400'
                        }`}
                      >
                        {choice.id.toUpperCase()}
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
                className="px-6 py-3 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fa-solid fa-arrow-left mr-2"></i>
                이전
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(selectedAnswers).length !== questions.length || isSubmitting}
                  className="px-8 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                      제출 중...
                    </>
                  ) : (
                    <>
                      제출하기
                      <i className="fa-solid fa-check ml-2"></i>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-dark-700 text-white rounded-xl hover:bg-dark-600 transition-colors"
                >
                  다음
                  <i className="fa-solid fa-arrow-right ml-2"></i>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Result Phase */}
        {phase === 'result' && result && (
          <div className="max-w-2xl mx-auto">
            <div className="glass-card bg-dark-800/50 rounded-2xl border border-white/10 p-8 text-center">
              {/* Score Circle */}
              <div
                className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center border-4 ${
                  result.isPassed
                    ? 'bg-green-500/10 border-green-500 text-green-400'
                    : 'bg-red-500/10 border-red-500 text-red-400'
                }`}
              >
                <div>
                  <div className="text-4xl font-bold">{result.score}</div>
                  <div className="text-sm opacity-75">점</div>
                </div>
              </div>

              {/* Result Message */}
              <h2 className="text-2xl font-bold text-white mb-2">
                {result.isPassed ? '🎉 축하합니다!' : '😢 아쉬워요'}
              </h2>
              <p className="text-slate-400 mb-6">
                {result.isPassed
                  ? `${difficulty === 'basic' ? '기초' : '심화'} 퀴즈를 통과했습니다!`
                  : `${result.passingScore}점 이상이 필요합니다. 다시 도전해보세요.`}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{result.correctCount}</div>
                  <div className="text-sm text-slate-400">정답</div>
                </div>
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{result.totalQuestions - result.correctCount}</div>
                  <div className="text-sm text-slate-400">오답</div>
                </div>
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">
                    {result.durationSeconds ? `${Math.floor(result.durationSeconds / 60)}:${(result.durationSeconds % 60).toString().padStart(2, '0')}` : '-'}
                  </div>
                  <div className="text-sm text-slate-400">소요시간</div>
                </div>
              </div>

              {/* Answer Review */}
              <div className="text-left mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">문제 리뷰</h3>
                <div className="space-y-3">
                  {result.answers.map((answer, i) => {
                    const question = questions.find((q) => q.id === answer.questionId);
                    return (
                      <div
                        key={answer.questionId}
                        className={`p-4 rounded-xl border ${
                          answer.isCorrect
                            ? 'bg-green-500/5 border-green-500/20'
                            : 'bg-red-500/5 border-red-500/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                              answer.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}
                          >
                            {answer.isCorrect ? '✓' : '✗'}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-slate-300 mb-2">
                              {i + 1}. {question?.question || '문제를 찾을 수 없습니다.'}
                            </p>
                            {!answer.isCorrect && (
                              <p className="text-sm text-green-400">
                                정답: {question?.choices.find((c) => c.id === answer.correctChoiceId)?.text}
                              </p>
                            )}
                            {answer.explanation && (
                              <p className="text-sm text-slate-400 mt-2">{answer.explanation}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleNextStep}
                className="w-full px-8 py-4 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-400 transition-colors shadow-lg shadow-primary-500/20"
              >
                {result.isPassed && difficulty === 'basic' && (
                  <>
                    심화 퀴즈 시작
                    <i className="fa-solid fa-arrow-right ml-2"></i>
                  </>
                )}
                {result.isPassed && difficulty === 'advanced' && (
                  <>
                    모듈 완료
                    <i className="fa-solid fa-check ml-2"></i>
                  </>
                )}
                {!result.isPassed && (
                  <>
                    다시 도전하기
                    <i className="fa-solid fa-redo ml-2"></i>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* AI Mentor Sidebar */}
      <ModuleChatSidebar
        module={module}
        sessionId={sessionId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
};

export default ModuleLearningPage;
