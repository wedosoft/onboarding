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
import LoadingSpinner from '../components/LoadingSpinner';
import SectionHeader from '../components/layout/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="layout-stack pb-12">
      <SectionHeader
        title={category.name}
        subtitle={`${product.name} 학습 콘텐츠`}
        icon={<i className="fas fa-book-open"></i>}
        action={(
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/assessment/products/${productId}`)}
          >
            <i className="fas fa-arrow-left mr-2"></i>카테고리 목록
          </Button>
        )}
      />

      <Tabs value={phase} onValueChange={(value) => setPhase(value as Phase)} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="learning">
            <i className="fas fa-book mr-2"></i>학습
          </TabsTrigger>
          <TabsTrigger value="chat">
            <i className="fas fa-comments mr-2"></i>질문하기
          </TabsTrigger>
        </TabsList>

        <TabsContent value="learning" className="mt-6">
          <Card>
            <CardContent className="p-8">
              {contentError ? (
                <div className="text-center py-12 space-y-6">
                  <i className="fas fa-exclamation-circle text-6xl text-destructive"></i>
                  <p className="text-muted-foreground">{contentError}</p>
                  <Button onClick={() => window.location.reload()}>
                    다시 시도
                  </Button>
                </div>
              ) : isLoadingContent && !learningContent ? (
                <div className="text-center py-12 space-y-4">
                  <LoadingSpinner />
                  <div>
                    <p className="text-foreground font-medium">학습 콘텐츠를 생성 중입니다...</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      AI가 문서를 분석하여 맞춤형 학습 자료를 준비하고 있습니다.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="prose prose-slate prose-lg max-w-none
                  prose-headings:font-bold prose-headings:text-foreground
                  prose-h3:text-primary prose-h3:text-xl
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-strong:text-foreground prose-strong:font-bold
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-medium
                  prose-pre:bg-foreground prose-pre:text-background prose-pre:rounded-xl prose-pre:shadow-lg
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                  prose-img:rounded-xl prose-img:shadow-md
                ">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {learningContent}
                  </ReactMarkdown>
                  {isLoadingContent && (
                    <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1"></span>
                  )}
                </div>
              )}

              {/* 학습 완료 후 액션 */}
              {!isLoadingContent && learningContent && (
                <div className="mt-8 pt-8 border-t border-border">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground flex items-center gap-2">
                      <i className="fas fa-check-circle text-emerald-500"></i>
                      학습 콘텐츠를 모두 읽으셨나요?
                    </p>
                    <Button onClick={() => setPhase('chat')} size="lg">
                      <i className="fas fa-comments mr-2"></i>
                      AI 멘토에게 질문하기
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <Card className="flex flex-col h-[calc(100vh-300px)]">
            {/* 채팅 메시지 */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0"
            >
              {chatMessages.length === 0 ? (
                <div className="text-center py-12 space-y-6">
                  <i className="fas fa-robot text-6xl text-primary"></i>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {category.name}에 대해 질문해보세요
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      학습 내용과 관련된 질문을 자유롭게 해보세요.
                    </p>
                  </div>

                  {/* 제안 질문 */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => setChatInput(question)}
                        className="text-sm"
                      >
                        {question}
                      </Button>
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
                  placeholder="질문을 입력하세요..."
                  className="flex-1 px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={isSendingChat}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
