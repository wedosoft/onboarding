import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getProduct, streamProductChat } from '../services/apiClient';
import type { Product, ChatMessage } from '../types';

export default function ProductChatPage() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 제품 정보 로드
  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;

      try {
        setIsLoading(true);
        const productData = await getProduct(productId);
        setProduct(productData);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

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

      const stream = streamProductChat(productId, userMessage);

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

  // 제품별 추천 질문
  const getSuggestedQuestions = (productId: string): string[] => {
    const questions: Record<string, string[]> = {
      freshservice: [
        'Freshservice의 티켓 관리 시스템은 어떻게 작동하나요?',
        'ITIL 프레임워크와 어떻게 연동되나요?',
        '자산 관리 기능의 주요 특징은 무엇인가요?',
        '변경 관리 프로세스를 설명해주세요.',
      ],
      freshdesk: [
        'Freshdesk의 멀티채널 지원 기능은 무엇인가요?',
        '자동화 규칙은 어떻게 설정하나요?',
        '고객 만족도 조사는 어떻게 진행하나요?',
        'SLA 관리 방법을 알려주세요.',
      ],
      freshsales: [
        '리드 스코어링은 어떻게 설정하나요?',
        '영업 파이프라인 관리 기능을 설명해주세요.',
        '이메일 시퀀스는 어떻게 만드나요?',
        'AI 기반 추천 기능은 무엇인가요?',
      ],
      freshchat: [
        '챗봇 설정 방법을 알려주세요.',
        '실시간 채팅의 주요 기능은 무엇인가요?',
        '캠페인 메시지는 어떻게 보내나요?',
        '채팅 위젯 커스터마이징 방법은?',
      ],
    };

    return questions[productId] || questions.freshservice;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <p className="text-slate-600 mb-4">제품을 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/assessment/products')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            제품 목록으로
          </button>
        </div>
      </div>
    );
  }

  const suggestedQuestions = getSuggestedQuestions(productId || 'freshservice');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/assessment/products/${productId}`)}
                className="text-slate-500 hover:text-slate-700"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  {product.name} AI 멘토
                </h1>
                <p className="text-sm text-slate-500">
                  {product.name_ko} 전문가에게 질문하세요
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setChatMessages([]);
                setChatInput('');
              }}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <i className="fas fa-redo mr-2"></i>
              대화 초기화
            </button>
          </div>
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col flex-1">
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
                  {product.name} 전문가에게 무엇이든 질문하세요
                </h3>
                <p className="text-slate-500 text-sm mb-8">
                  제품의 기능, 설정, 사용법 등에 대해 자유롭게 질문해보세요.
                </p>

                {/* 제안 질문 */}
                <div className="max-w-2xl mx-auto">
                  <p className="text-sm text-slate-400 mb-4">추천 질문</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setChatInput(question)}
                        className="px-4 py-3 bg-slate-50 text-slate-600 rounded-lg text-sm text-left hover:bg-slate-100 transition-colors border border-slate-200"
                      >
                        <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                        {question}
                      </button>
                    ))}
                  </div>
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
                placeholder={`${product.name}에 대해 질문하세요...`}
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
      </div>
    </div>
  );
}
