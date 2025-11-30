/**
 * 제품별 학습 페이지
 * 4개 제품(Freshdesk, Freshdesk Omni, Freshservice, Freshchat)에 대한
 * 커리큘럼 기반 학습 + 퀴즈 시스템
 */

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getProducts,
  getProductLevels,
  streamProductLearning,
  getProductQuiz,
  submitProductQuiz,
  Product,
  ProductLevel,
  ProductQuizQuestion,
  ProductQuizResult,
} from '../services/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

// 세션 ID 가져오기 (없으면 생성)
const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem('onboarding_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('onboarding_session_id', sessionId);
  }
  return sessionId;
};

type ViewState = 'products' | 'levels' | 'learning' | 'quiz' | 'result';

const ProductLearningPage: React.FC = () => {
  const sessionId = getOrCreateSessionId();

  // 상태 관리
  const [viewState, setViewState] = useState<ViewState>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [levels, setLevels] = useState<ProductLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<ProductLevel | null>(null);

  // 학습 상태
  const [learningContent, setLearningContent] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isContentComplete, setIsContentComplete] = useState(false);

  // 퀴즈 상태
  const [quizQuestions, setQuizQuestions] = useState<ProductQuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<ProductQuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // 제품 목록 로드
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  // 제품 선택
  const handleSelectProduct = async (product: Product) => {
    setSelectedProduct(product);
    setViewState('levels');

    try {
      const data = await getProductLevels(product.id, sessionId);
      setLevels(data);
    } catch (error) {
      console.error('Failed to load levels:', error);
    }
  };

  // 레벨 선택 및 학습 시작
  const handleSelectLevel = async (level: ProductLevel) => {
    if (!level.isUnlocked || !selectedProduct) return;

    setSelectedLevel(level);
    setViewState('learning');
    setLearningContent('');
    setIsLoadingContent(true);
    setIsContentComplete(false);

    try {
      const stream = streamProductLearning(selectedProduct.id, level.id, sessionId);

      for await (const event of stream) {
        if (event.event === 'chunk' && event.data.text) {
          setLearningContent((prev) => prev + event.data.text);
        } else if (event.event === 'result') {
          setIsContentComplete(true);
        } else if (event.event === 'error') {
          console.error('Learning content error:', event.data.message);
        }
      }
      // 스트리밍 완료 후 무조건 완료 상태로 설정
      setIsContentComplete(true);
    } catch (error) {
      console.error('Failed to load learning content:', error);
    } finally {
      setIsLoadingContent(false);
    }
  };

  // 퀴즈 시작
  const handleStartQuiz = async () => {
    if (!selectedProduct || !selectedLevel) return;

    setViewState('quiz');
    setIsLoadingQuiz(true);
    setSelectedAnswers({});
    setQuizResult(null);

    try {
      const questions = await getProductQuiz(selectedProduct.id, selectedLevel.id, sessionId);
      setQuizQuestions(questions);
    } catch (error) {
      console.error('Failed to load quiz:', error);
      alert('퀴즈를 불러오는 중 오류가 발생했습니다. 학습을 먼저 완료해주세요.');
      setViewState('learning');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // 답변 선택
  const handleSelectAnswer = (questionId: string, choiceId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }));
  };

  // 퀴즈 제출
  const handleSubmitQuiz = async () => {
    if (!selectedProduct || !selectedLevel) return;

    const answers = Object.entries(selectedAnswers).map(([questionId, choiceId]) => ({
      questionId,
      choiceId,
    }));

    if (answers.length < quizQuestions.length) {
      alert('모든 문제에 답변해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitProductQuiz(
        sessionId,
        selectedProduct.id,
        selectedLevel.id,
        answers
      );
      setQuizResult(result);
      setViewState('result');
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('퀴즈 제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 다음 레벨로 이동
  const handleNextLevel = async () => {
    if (!selectedProduct) return;

    // 레벨 목록 새로고침
    const data = await getProductLevels(selectedProduct.id, sessionId);
    setLevels(data);
    setViewState('levels');
    setSelectedLevel(null);
    setLearningContent('');
    setQuizQuestions([]);
    setQuizResult(null);
  };

  // 제품 목록으로 돌아가기
  const handleBackToProducts = () => {
    setViewState('products');
    setSelectedProduct(null);
    setLevels([]);
    setSelectedLevel(null);
    setLearningContent('');
    setQuizQuestions([]);
    setQuizResult(null);
  };

  // 렌더링: 제품 선택
  const renderProductSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">제품 학습</h1>
        <p className="text-muted-foreground">학습할 제품을 선택하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => handleSelectProduct(product)}
            className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: `${product.color}20`, color: product.color }}
              >
                <i className={product.icon}></i>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
              </div>
              <i className="fas fa-chevron-right text-muted-foreground group-hover:text-primary transition-colors mt-1"></i>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // 렌더링: 레벨 선택
  const renderLevelSelection = () => (
    <div className="space-y-6">
      <button
        onClick={handleBackToProducts}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <i className="fas fa-arrow-left"></i>
        <span>제품 목록으로</span>
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
          style={{
            backgroundColor: `${selectedProduct?.color}20`,
            color: selectedProduct?.color,
          }}
        >
          <i className={selectedProduct?.icon}></i>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{selectedProduct?.name}</h1>
          <p className="text-muted-foreground">학습 커리큘럼</p>
        </div>
      </div>

      <div className="space-y-3">
        {levels.map((level, index) => (
          <button
            key={level.id}
            onClick={() => handleSelectLevel(level)}
            disabled={!level.isUnlocked}
            className={`w-full p-4 rounded-xl border transition-all text-left ${
              level.isUnlocked
                ? level.isCompleted
                  ? 'bg-green-900/20 border-green-500/50 hover:border-green-500'
                  : 'bg-card border-border hover:border-primary/50'
                : 'bg-muted border-border opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  level.isCompleted
                    ? 'bg-green-500 text-white'
                    : level.isUnlocked
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {level.isCompleted ? <i className="fas fa-check"></i> : index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{level.name}</h3>
                  {level.isCompleted && (
                    <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                      {level.score}점
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{level.description}</p>
              </div>
              {level.isUnlocked && !level.isCompleted && (
                <i className="fas fa-play text-primary"></i>
              )}
              {!level.isUnlocked && <i className="fas fa-lock text-muted-foreground"></i>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // 렌더링: 학습 콘텐츠
  const renderLearning = () => (
    <div className="space-y-6">
      <button
        onClick={() => setViewState('levels')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <i className="fas fa-arrow-left"></i>
        <span>레벨 목록으로</span>
      </button>

      <div>
        <h1 className="text-xl font-bold text-foreground">
          {selectedProduct?.name} - {selectedLevel?.name}
        </h1>
        <p className="text-muted-foreground text-sm">{selectedLevel?.description}</p>
      </div>

      {isLoadingContent && !learningContent && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-3 text-muted-foreground">콘텐츠를 불러오는 중...</span>
        </div>
      )}

      <div ref={contentRef} className="prose prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{learningContent}</ReactMarkdown>
      </div>

      {isLoadingContent && learningContent && (
        <div className="mt-4 flex items-center gap-2 text-primary">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-sm">분석 중...</span>
        </div>
      )}

      {isContentComplete && (
        <div className="mt-8 bg-primary/10 border border-primary/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <i className="fas fa-check-circle text-primary text-2xl"></i>
              </div>
              <div>
                <p className="text-foreground font-semibold text-lg">학습 완료!</p>
                <p className="text-muted-foreground text-sm">
                  퀴즈를 통해 학습 내용을 확인해보세요. 80점 이상이면 다음 레벨이 열립니다.
                </p>
              </div>
            </div>
            <button
              onClick={handleStartQuiz}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 text-lg"
            >
              <i className="fas fa-clipboard-check"></i>
              퀴즈 시작하기
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // 렌더링: 퀴즈
  const renderQuiz = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {selectedProduct?.name} - {selectedLevel?.name} 퀴즈
          </h1>
          <p className="text-muted-foreground text-sm">
            {quizQuestions.length}문제 / 통과 기준: {selectedLevel?.passingScore}점
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {Object.keys(selectedAnswers).length} / {quizQuestions.length} 답변 완료
        </div>
      </div>

      {isLoadingQuiz ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-3 text-muted-foreground">퀴즈를 불러오는 중...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {quizQuestions.map((question, qIndex) => (
            <div
              key={question.id}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {qIndex + 1}
                </span>
                <p className="text-foreground flex-1">{question.question}</p>
              </div>

              <div className="space-y-2 ml-11">
                {question.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleSelectAnswer(question.id, choice.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedAnswers[question.id] === choice.id
                        ? 'bg-primary/20 border-primary text-foreground'
                        : 'bg-muted border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                          selectedAnswers[question.id] === choice.id
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground'
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
          ))}

          <div className="flex justify-end">
            <button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting || Object.keys(selectedAnswers).length < quizQuestions.length}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner />
                  제출 중...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  답안 제출
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // 렌더링: 결과
  const renderResult = () => {
    if (!quizResult) return null;

    const isPassed = quizResult.isPassed;

    return (
      <div className="space-y-6">
        <div
          className={`text-center py-8 rounded-xl ${
            isPassed ? 'bg-green-900/20' : 'bg-red-900/20'
          }`}
        >
          <div
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl mb-4 ${
              isPassed ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            <i className={`fas ${isPassed ? 'fa-check' : 'fa-times'}`}></i>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {isPassed ? '축하합니다!' : '아쉽네요'}
          </h2>
          <p className="text-muted-foreground">
            {quizResult.correctCount} / {quizResult.totalQuestions} 정답 ({quizResult.score}점)
          </p>
          {isPassed ? (
            <p className="text-green-400 mt-2">다음 레벨이 열렸습니다!</p>
          ) : (
            <p className="text-muted-foreground mt-2">
              {selectedLevel?.passingScore}점 이상이면 통과입니다. 다시 도전해보세요!
            </p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">정답 확인</h3>
          {quizResult.answers.map((answer, index) => {
            const question = quizQuestions.find((q) => q.id === answer.questionId);
            if (!question) return null;

            return (
              <div
                key={answer.questionId}
                className={`p-4 rounded-xl border ${
                  answer.isCorrect
                    ? 'bg-green-900/10 border-green-500/30'
                    : 'bg-red-900/10 border-red-500/30'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                      answer.isCorrect ? 'bg-green-500' : 'bg-red-500'
                    } text-white`}
                  >
                    {answer.isCorrect ? (
                      <i className="fas fa-check text-xs"></i>
                    ) : (
                      <i className="fas fa-times text-xs"></i>
                    )}
                  </span>
                  <p className="text-foreground flex-1">
                    {index + 1}. {question.question}
                  </p>
                </div>

                <div className="ml-9 space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">내 답변: </span>
                    <span className={answer.isCorrect ? 'text-green-400' : 'text-red-400'}>
                      {question.choices.find((c) => c.id === answer.choiceId)?.text}
                    </span>
                  </p>
                  {!answer.isCorrect && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">정답: </span>
                      <span className="text-green-400">
                        {question.choices.find((c) => c.id === answer.correctChoiceId)?.text}
                      </span>
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2 p-3 bg-muted rounded-lg">
                    <i className="fas fa-lightbulb text-primary mr-2"></i>
                    {answer.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-4">
          {!isPassed && (
            <button
              onClick={() => {
                setSelectedAnswers({});
                setQuizResult(null);
                setViewState('quiz');
              }}
              className="px-6 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-colors"
            >
              <i className="fas fa-redo mr-2"></i>
              다시 도전
            </button>
          )}
          <button
            onClick={handleNextLevel}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            {isPassed ? (
              <>
                <i className="fas fa-arrow-right mr-2"></i>
                다음 레벨
              </>
            ) : (
              <>
                <i className="fas fa-list mr-2"></i>
                레벨 목록
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {viewState === 'products' && renderProductSelection()}
      {viewState === 'levels' && renderLevelSelection()}
      {viewState === 'learning' && renderLearning()}
      {viewState === 'quiz' && renderQuiz()}
      {viewState === 'result' && renderResult()}
    </div>
  );
};

export default ProductLearningPage;
