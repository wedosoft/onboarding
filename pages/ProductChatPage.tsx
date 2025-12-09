import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getProduct, streamProductChat } from '../services/apiClient';
import type { Product, ChatMessage } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
            <i className="fas fa-exclamation-triangle text-6xl text-destructive"></i>
            <p className="text-muted-foreground">제품을 찾을 수 없습니다.</p>
            <Button onClick={() => navigate('/assessment/products')} className="w-full">
              제품 목록으로
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const suggestedQuestions = getSuggestedQuestions(productId || 'freshservice');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/assessment/products/${productId}`)}
              >
                <i className="fas fa-arrow-left"></i>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {product.name} AI 멘토
                </h1>
                <p className="text-sm text-muted-foreground">
                  {product.name_ko} 전문가에게 질문하세요
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setChatMessages([]);
                setChatInput('');
              }}
            >
              <i className="fas fa-redo mr-2"></i>
              대화 초기화
            </Button>
          </div>
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col">
        <Card className="flex flex-col flex-1">
          {/* 채팅 메시지 */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            {chatMessages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">
                  <i className="fas fa-robot text-primary"></i>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {product.name} 전문가에게 무엇이든 질문하세요
                </h3>
                <p className="text-muted-foreground text-sm mb-8">
                  제품의 기능, 설정, 사용법 등에 대해 자유롭게 질문해보세요.
                </p>

                {/* 제안 질문 */}
                <div className="max-w-2xl mx-auto">
                  <p className="text-sm text-muted-foreground mb-4">추천 질문</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => setChatInput(question)}
                        className="h-auto py-3 text-left justify-start"
                      >
                        <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                        {question}
                      </Button>
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
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {msg.role === 'model' ? (
                      <div className="prose prose-sm prose-slate max-w-none
                        prose-p:text-foreground
                        prose-strong:text-foreground
                        prose-a:text-primary
                        prose-code:text-pink-600 prose-code:bg-pink-50
                      ">
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
          <CardContent className="border-t border-border p-4">
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
                className="flex-1 px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isSendingChat}
                data-testid="product-chat-input"
              />
              <Button
                onClick={handleSendChat}
                disabled={isSendingChat || !chatInput.trim()}
                size="icon"
                className="h-auto px-6 py-3"
              >
                {isSendingChat ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
