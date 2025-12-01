import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getProduct,
  getProductCategory,
  streamCategoryLearning,
  streamProductChat,
} from '../services/apiClient';
import type { Product, ProductCategory, ChatMessage } from '../types';

type Phase = 'learning' | 'chat';

export default function CategoryLearningPage() {
  const navigate = useNavigate();
  const { productId, categorySlug } = useParams<{
    productId: string;
    categorySlug: string;
  }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [phase, setPhase] = useState<Phase>('learning');

  // 학습 콘텐츠 상태
  const [learningContent, setLearningContent] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [contentError, setContentError] = useState<string | null>(null);

  // 채팅 상태
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 초기 데이터 로드
  useEffect(() => {
    async function loadData() {
      if (!productId || !categorySlug) return;

      try {
        const [productData, categoryData] = await Promise.all([
          getProduct(productId),
          getProductCategory(productId, categorySlug),
        ]);
        setProduct(productData);
        setCategory(categoryData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setContentError('데이터를 불러오는데 실패했습니다.');
      }
    }

    loadData();
  }, [productId, categorySlug]);

  // 학습 콘텐츠 로드
  useEffect(() => {
    async function loadLearningContent() {
      if (!productId || !categorySlug) return;

      try {
        setIsLoadingContent(true);
        setLearningContent('');
        setContentError(null);

        const stream = streamCategoryLearning(productId, categorySlug);
        for await (const event of stream) {
          if (event.data?.text) {
            setLearningContent((prev) => prev + event.data.text);
          }
        }
      } catch (err) {
        console.error('Failed to load learning content:', err);
        setContentError('학습 콘텐츠를 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingContent(false);
      }
    }

    loadLearningContent();
  }, [productId, categorySlug]);

  // 채팅 스크롤
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendChat = async () => {
    if (!chatInput.trim() || isSendingChat || !productId) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsSendingChat(true);

    try {
      let assistantMessage = '';
      setChatMessages((prev) => [...prev, { role: 'model', content: '' }]);

      const stream = streamProductChat(productId, userMessage, {
        categorySlug: categorySlug,
      });

      for await (const event of stream) {
        if (event.data?.text) {
          assistantMessage += event.data.text;
          setChatMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: 'model',
              content: assistantMessage,
            };
            return newMessages;
          });
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'model', content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.' },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const suggestedQuestions = [
    '이 기능의 핵심 용어를 설명해주세요.',
    '실무에서 자주 사용하는 설정은 무엇인가요?',
    '초보자가 흔히 하는 실수가 있나요?',
  ];

  if (!product || !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(`/assessment/products/${productId}`)}
                className="text-slate-500 hover:text-slate-700 text-sm mb-1"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                {product.name} 카테고리 목록
              </button>
              <h1 className="text-xl font-bold text-slate-800">
                {category.name}
              </h1>
            </div>

            {/* 탭 전환 */}
            <div className="flex gap-2">
              <button
                onClick={() => setPhase('learning')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  phase === 'learning'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <i className="fas fa-book mr-2"></i>
                학습
              </button>
              <button
                onClick={() => setPhase('chat')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  phase === 'chat'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <i className="fas fa-comments mr-2"></i>
                질문하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {phase === 'learning' ? (
          // 학습 콘텐츠
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            {contentError ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-4xl mb-4">
                  <i className="fas fa-exclamation-circle"></i>
                </div>
                <p className="text-slate-600 mb-4">{contentError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  다시 시도
                </button>
              </div>
            ) : isLoadingContent && !learningContent ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">학습 콘텐츠를 생성 중입니다...</p>
                <p className="text-sm text-slate-400 mt-2">
                  AI가 문서를 분석하여 맞춤형 학습 자료를 준비하고 있습니다.
                </p>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {learningContent}
                </ReactMarkdown>
                {isLoadingContent && (
                  <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1"></span>
                )}
              </div>
            )}

            {/* 학습 완료 후 액션 */}
            {!isLoadingContent && learningContent && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    학습 콘텐츠를 모두 읽으셨나요?
                  </p>
                  <button
                    onClick={() => setPhase('chat')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <i className="fas fa-comments mr-2"></i>
                    AI 멘토에게 질문하기
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // 채팅
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-200px)]">
            {/* 채팅 메시지 */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              {chatMessages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">
                    <i className="fas fa-robot text-blue-500"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    {category.name}에 대해 질문해보세요
                  </h3>
                  <p className="text-slate-500 text-sm mb-6">
                    학습 내용과 관련된 질문을 자유롭게 해보세요.
                  </p>

                  {/* 제안 질문 */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setChatInput(question);
                        }}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm hover:bg-slate-200 transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {msg.role === 'model' ? (
                        <div className="prose prose-sm prose-slate max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content || '...'}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 입력창 */}
            <div className="border-t border-slate-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  placeholder="질문을 입력하세요..."
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSendingChat}
                />
                <button
                  onClick={handleSendChat}
                  disabled={isSendingChat || !chatInput.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSendingChat ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-paper-plane"></i>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
