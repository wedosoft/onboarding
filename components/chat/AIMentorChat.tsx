import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, Send, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIMentorChatProps {
  /** 채팅 메시지 목록 */
  messages: ChatMessage[];
  /** 메시지 전송 핸들러 */
  onSendMessage: (message: string) => void;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 대화 초기화 핸들러 */
  onClearMessages?: () => void;
  /** 추천 질문 목록 */
  suggestedQuestions?: string[];
  /** 멘토 이름 */
  mentorName?: string;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 추가 className */
  className?: string;
}

/**
 * AI 멘토 채팅 컴포넌트
 * 
 * 학습 페이지, 지식 페이지 등에서 AI 멘토와 대화할 때 사용합니다.
 * ContentWithSidebar의 sidebar prop으로 전달하여 사용합니다.
 * 
 * @example
 * <AIMentorChat
 *   messages={chatMessages}
 *   onSendMessage={handleSendChat}
 *   isLoading={isChatLoading}
 *   onClearMessages={() => setChatMessages([])}
 *   suggestedQuestions={['이 기능의 핵심이 뭐예요?', '실무에서 어떻게 활용하나요?']}
 * />
 */
const AIMentorChat: React.FC<AIMentorChatProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  onClearMessages,
  suggestedQuestions = [],
  mentorName = '고복수 팀장',
  placeholder = '질문을 입력하세요...',
  className,
}) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 스크롤 자동 이동
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>
      {/* 채팅 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background flex-shrink-0">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{mentorName}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            실시간 답변 중
          </p>
        </div>
        {onClearMessages && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearMessages}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="대화 내용 지우기"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* 메시지 영역 - 고정 높이로 스크롤 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5 min-h-0">
        {/* 빈 상태 */}
        {messages.length === 0 && (
          <div className="text-center mt-8 px-4">
            <div className="inline-block p-4 bg-primary/5 rounded-2xl mb-4 ring-1 ring-primary/10">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h4 className="font-bold text-foreground mb-2">무엇이든 물어보세요!</h4>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              학습 내용에 대해 궁금한 점이 있으신가요?<br />
              AI 멘토가 즉시 답변해드립니다.
            </p>
            {suggestedQuestions.length > 0 && (
              <div className="space-y-2">
                {suggestedQuestions.map((q, idx) => (
                  <Button
                    key={idx}
                    onClick={() => onSendMessage(q)}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 text-sm bg-background hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all"
                  >
                    <span className="mr-2 opacity-50">Q.</span> {q}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 메시지 목록 - 빈 content인 assistant 메시지는 숨김 (로딩 중일 때) */}
        {messages.map((msg, idx) => {
          // 로딩 중일 때 마지막 빈 assistant 메시지는 숨김
          if (msg.role === 'assistant' && !msg.content && isLoading && idx === messages.length - 1) {
            return null;
          }
          return (
            <div
              key={idx}
              className={cn(
                'flex animate-fade-in',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-1 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-card text-foreground border border-border rounded-tl-none'
                )}
              >
                {msg.role === 'assistant' && msg.content ? (
                  <div className="prose prose-sm prose-slate max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          );
        })}

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="flex justify-start items-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-1 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-card rounded-2xl rounded-tl-none px-4 py-4 border border-border shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-4 border-t border-border bg-background flex-shrink-0">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 pl-4 pr-12 py-3 border border-input rounded-xl bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            disabled={isLoading}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2 opacity-70">
          AI 멘토는 실수를 할 수 있습니다. 중요한 정보는 확인이 필요합니다.
        </p>
      </div>
    </div>
  );
};

export default AIMentorChat;
