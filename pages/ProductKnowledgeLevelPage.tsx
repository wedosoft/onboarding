import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  streamLearningContent,
  streamMentorChat,
  getAssessmentQuestions,
  submitAssessment,
  AssessmentQuestion,
  AssessmentResult,
  ChatStreamEvent,
} from '../services/apiClient';

type Phase = 'learning' | 'chat' | 'quiz' | 'result';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const LEVEL_INFO: Record<string, { title: string; description: string }> = {
  '1': { title: '시장 포지셔닝', description: '제품이 시장에서 어떤 위치를 차지하는지 학습합니다.' },
  '2': { title: '설계 철학', description: '제품의 핵심 원칙과 설계 배경을 이해합니다.' },
  '3': { title: '핵심 기능', description: '제품의 주요 기능을 깊이 있게 학습합니다.' },
  '4': { title: '세부 기능', description: '고급 기능과 활용 팁을 익힙니다.' },
};

const ProductKnowledgeLevelPage: React.FC = () => {
  const navigate = useNavigate();
  const { trackId, levelId } = useParams<{ trackId: string; levelId: string }>();

  const [phase, setPhase] = useState<Phase>('learning');
  const [learningContent, setLearningContent] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Quiz state
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const sessionId = localStorage.getItem('onboarding_session_id') || '';
  const levelInfo = LEVEL_INFO[levelId || '1'] || LEVEL_INFO['1'];

  // 학습 콘텐츠 로드 (RAG 기반 스트리밍)
  useEffect(() => {
    const loadContent = async () => {
      if (!trackId || !levelId) return;

      setIsLoadingContent(true);
      setLearningContent('');

      try {
        const stream = streamLearningContent(trackId, levelId);
        for await (const event of stream) {
          if (event.data?.text) {
            setLearningContent(prev => prev + event.data.text);
          }
        }
      } catch (error) {
        console.error('Failed to load learning content:', error);
        setLearningContent('학습 콘텐츠를 불러오는데 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoadingContent(false);
      }
    };

    loadContent();
  }, [trackId, levelId]);

  // 퀴즈 문제 로드
  useEffect(() => {
    const loadQuestions = async () => {
      if (!trackId || !levelId) return;

      try {
        const data = await getAssessmentQuestions(trackId, levelId);
        setQuestions(data);
      } catch (error) {
        console.error('Failed to load questions:', error);
      }
    };

    if (phase === 'quiz') {
      loadQuestions();
    }
  }, [trackId, levelId, phase]);

  // 채팅 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // AI 멘토 채팅
  const handleSendChat = useCallback(async () => {
    if (!chatInput.trim() || isChatLoading || !trackId || !levelId) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      const stream = streamMentorChat(sessionId, trackId, levelId, userMessage);
      let assistantMessage = '';

      setChatMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      for await (const event of stream) {
        if (event.data?.text) {
          assistantMessage += event.data.text;
          setChatMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: assistantMessage };
            return updated;
          });
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다.' }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatInput, isChatLoading, sessionId, trackId, levelId]);

  // 퀴즈 답안 선택
  const handleSelectAnswer = (questionId: string, choiceId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: choiceId }));
  };

  // 퀴즈 제출
  const handleSubmitQuiz = async () => {
    if (!trackId || !levelId) return;

    setIsSubmitting(true);
    try {
      const answers = Object.entries(selectedAnswers).map(([questionId, choiceId]) => ({
        questionId,
        choiceId,
      }));

      const result = await submitAssessment({
        sessionId,
        trackId,
        levelId,
        answers,
      });

      setResult(result);
      setPhase('result');
    } catch (error) {
      console.error('Submit error:', error);
      alert('제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const allAnswered = questions.length > 0 && questions.every(q => selectedAnswers[q.id]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/assessment/${trackId}/levels`)}
          className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors mb-4"
        >
          <i className="fas fa-arrow-left" />
          <span>레벨 목록</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center border border-primary-500/30">
            <span className="text-xl font-bold text-primary-500">{levelId}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-700">{levelInfo.title}</h1>
            <p className="text-slate-500 text-sm">{levelInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Phase Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {['learning', 'chat', 'quiz'].map((p, idx) => (
          <React.Fragment key={p}>
            <button
              onClick={() => p !== 'result' && setPhase(p as Phase)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                phase === p
                  ? 'bg-primary-500 text-white shadow-lg'
                  : phase === 'result'
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              disabled={phase === 'result'}
            >
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </span>
              <span className="hidden sm:inline">
                {p === 'learning' ? '학습' : p === 'chat' ? 'AI 멘토' : '퀴즈'}
              </span>
            </button>
            {idx < 2 && <i className="fas fa-chevron-right text-slate-300" />}
          </React.Fragment>
        ))}
      </div>

      {/* Learning Phase */}
      {phase === 'learning' && (
        <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <i className="fas fa-book-open text-primary-500" />
              학습 콘텐츠
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              AI가 RAG 기반으로 생성한 맞춤형 학습 자료입니다.
            </p>
          </div>
          <div className="p-6">
            {isLoadingContent ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="mt-4 text-slate-500">학습 콘텐츠를 생성하고 있습니다...</p>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none text-slate-700 prose-headings:text-slate-800 prose-strong:text-primary-600 prose-a:text-primary-500">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {learningContent}
                </ReactMarkdown>
              </div>
            )}
          </div>
          <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button
              onClick={() => setPhase('chat')}
              disabled={isLoadingContent}
              className="px-6 py-3 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              AI 멘토에게 질문하기
              <i className="fas fa-arrow-right ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Chat Phase */}
      {phase === 'chat' && (
        <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <i className="fas fa-comments text-primary-500" />
              AI 멘토 채팅
            </h2>
            <p className="text-sm text-slate-500">학습 내용에 대해 자유롭게 질문하세요.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <i className="fas fa-robot text-4xl mb-3" />
                <p>학습 내용에 대해 궁금한 점을 물어보세요!</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {['이 내용을 쉽게 설명해줘', '실제 업무에서 어떻게 활용해?', '더 자세히 알려줘'].map(q => (
                    <button
                      key={q}
                      onClick={() => setChatInput(q)}
                      className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-primary-500/10 hover:text-primary-600 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content || '...'}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isChatLoading && chatMessages[chatMessages.length - 1]?.content === '' && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <div className="flex gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendChat()}
                placeholder="질문을 입력하세요..."
                disabled={isChatLoading}
                className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-700 placeholder-slate-400"
              />
              <button
                onClick={handleSendChat}
                disabled={isChatLoading || !chatInput.trim()}
                className="px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <i className="fas fa-paper-plane" />
              </button>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setPhase('quiz')}
                className="px-6 py-2 bg-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-300 transition-all"
              >
                퀴즈로 이동
                <i className="fas fa-arrow-right ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Phase */}
      {phase === 'quiz' && questions.length > 0 && (
        <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                <i className="fas fa-clipboard-check text-primary-500" />
                학습 퀴즈
              </h2>
              <span className="text-sm text-slate-500">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-6">
            {currentQuestion && (
              <>
                <p className="text-lg font-medium text-slate-800 mb-6">
                  {currentQuestion.question}
                </p>
                <div className="space-y-3">
                  {currentQuestion.choices.map(choice => (
                    <button
                      key={choice.id}
                      onClick={() => handleSelectAnswer(currentQuestion.id, choice.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedAnswers[currentQuestion.id] === choice.id
                          ? 'bg-primary-500/10 border-primary-500 ring-1 ring-primary-500 text-primary-700'
                          : 'bg-slate-50 border-slate-200 hover:border-primary-500/50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-between">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <i className="fas fa-arrow-left mr-2" />
              이전
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                disabled={!selectedAnswers[currentQuestion?.id]}
                className="px-6 py-2 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                다음
                <i className="fas fa-arrow-right ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={!allAnswered || isSubmitting}
                className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2" />
                    제출 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check mr-2" />
                    제출하기
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Result Phase */}
      {phase === 'result' && result && (
        <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden">
          <div className={`p-8 text-center ${result.isPassed ? 'bg-green-50' : 'bg-orange-50'}`}>
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
              result.isPassed ? 'bg-green-500/20' : 'bg-orange-500/20'
            }`}>
              <i className={`fas ${result.isPassed ? 'fa-trophy text-green-500' : 'fa-redo text-orange-500'} text-4xl`} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {result.isPassed ? '축하합니다!' : '아쉽네요!'}
            </h2>
            <p className="text-slate-600 mb-4">
              {result.isPassed
                ? '이 레벨을 통과했습니다. 다음 레벨이 해제됩니다!'
                : '80% 이상 정답해야 통과할 수 있습니다.'}
            </p>
            <div className="text-5xl font-bold text-primary-500 mb-2">
              {result.score}%
            </div>
            <p className="text-slate-500">
              {result.totalQuestions}문제 중 {result.correctCount}문제 정답
            </p>
          </div>

          <div className="p-6 border-t border-slate-200">
            <h3 className="font-semibold text-slate-700 mb-4">문제별 결과</h3>
            <div className="space-y-3">
              {result.answers.map((answer, idx) => (
                <div
                  key={answer.questionId}
                  className={`p-4 rounded-xl border ${
                    answer.isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      answer.isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      <i className={`fas ${answer.isCorrect ? 'fa-check' : 'fa-times'} text-white text-sm`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-700">문제 {idx + 1}</p>
                      <p className="text-sm text-slate-600 mt-1">{answer.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-center gap-4">
            <button
              onClick={() => navigate(`/assessment/${trackId}/levels`)}
              className="px-6 py-3 bg-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-300 transition-all"
            >
              레벨 목록으로
            </button>
            {!result.isPassed && (
              <button
                onClick={() => {
                  setPhase('learning');
                  setSelectedAnswers({});
                  setCurrentQuestionIndex(0);
                  setResult(null);
                }}
                className="px-6 py-3 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-400 transition-all shadow-lg"
              >
                다시 학습하기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductKnowledgeLevelPage;
