import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../contexts/AuthContext';
import { getChatResponseStream, initializeMentorSession } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, ArrowUp, ArrowRight, RotateCcw, Loader2, Sparkles } from 'lucide-react';

const suggestedQuestions = [
  'Freshdesk Omni의 주요 기능은 무엇인가요?',
  'Freshservice에서 티켓을 생성하는 방법은?',
  'Freshdesk와 Freshchat의 차이점은 무엇인가요?',
  'SLA 정책을 설정하는 방법이 궁금해요.',
  '자동화 규칙(Automation Rule)은 어떻게 동작하나요?',
  '고객 포털을 커스터마이징 할 수 있나요?',
];

const KnowledgeChatPage: React.FC = () => {
  const { user } = useAuth();
  const userName = user?.name || user?.email?.split('@')[0] || '신입사원';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (hasStarted) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, hasStarted]);

  // Initialize session
  useEffect(() => {
    const init = async () => {
      if (!isInitialized) {
        await initializeMentorSession(userName);
        // 초기 메시지는 hasStarted가 false일 때는 보여주지 않음 (또는 별도 처리)
        // 여기서는 messages에 추가하되, UI에서 hasStarted 여부에 따라 다르게 렌더링
        setMessages([
          {
            role: 'model',
            content: `만나서 반가워요, **${userName}**님! 👋\n\n저는 ${userName}님의 온보딩을 도와줄 **AI 시니어 멘토**입니다. \n업무 프로세스, 팀 문화, 또는 사용하는 제품에 대해 궁금한 점이 있다면 언제든 물어보세요.`
          }
        ]);
        setIsInitialized(true);
      }
    };
    init();
  }, [userName, isInitialized]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    setHasStarted(true); // 첫 메시지 전송 시 UI 전환

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: message },
      { role: 'model', content: '' }
    ];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const stream = await getChatResponseStream(message);
      let fullResponse = '';

      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = fullResponse;
          return updated;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content = '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
        return updated;
      });
    } finally {
      setIsLoading(false);
      // inputRef.current?.focus(); // 모바일에서 키보드 올라오는 것 방지하려면 조건부 포커스
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  // 초기 화면 (중앙 정렬)
  if (!hasStarted) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 max-w-3xl mx-auto animate-fade-in">
        <div className="text-center mb-10 space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-primary/20 mb-6">
            <span className="text-4xl">🐢</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            제품 관련 질문을 해보세요
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            AI 시니어 멘토가 {userName}님의 제품 학습을 도와드립니다.<br/>
            Freshdesk, Freshservice 등 우리 제품에 대해 궁금한 점을 자유롭게 질문하세요.
          </p>
        </div>

        <div className="w-full max-w-2xl space-y-6">
          <form onSubmit={handleSubmit} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="질문을 입력하세요..."
              className="w-full pl-6 pr-14 py-5 text-lg bg-card border border-border rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              autoFocus
            />
            <Button
              type="submit"
              disabled={!inputValue.trim()}
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-left px-4 py-3 rounded-xl bg-card border border-border hover:bg-muted/50 hover:border-primary/30 transition-all text-sm text-muted-foreground hover:text-foreground flex items-center justify-between group"
              >
                <span>{q}</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 대화 화면 (하단 입력)
  return (
    <div className="h-full flex flex-col overflow-hidden max-w-[1400px] mx-auto px-4 py-4">
      {/* Header (Compact) */}
      <div className="flex-none mb-4 flex items-center justify-between px-2">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-2xl">🐢</span> 멘토 채팅
          </h1>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            setHasStarted(false);
            setMessages([]);
            initializeMentorSession(userName); // 세션 초기화
          }}
          className="text-muted-foreground hover:text-destructive"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          새 대화 시작
        </Button>
      </div>

      <Card className="flex-1 min-h-0 flex flex-col relative overflow-hidden border-border/50 shadow-xl">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-background/80 to-transparent pointer-events-none z-10"></div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth z-0">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group animate-fade-in`}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-1
                ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground'
                  : 'bg-background border border-border text-primary'
                }`}
              >
                <span className="text-lg">{msg.role === 'user' ? '🧑‍💻' : '🐢'}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-sm md:text-base leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground rounded-tr-none'
                    : 'bg-card/80 backdrop-blur-sm border border-border text-foreground rounded-tl-none'
                  }`}
              >
                {msg.role === 'model' ? (
                  <div className="prose prose-sm max-w-none
                    prose-p:text-foreground prose-headings:text-foreground prose-strong:text-primary prose-a:text-primary
                    prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1 prose-code:rounded
                    prose-ul:list-disc prose-ul:pl-4 prose-ol:list-decimal prose-ol:pl-4">
                    {!msg.content && isLoading && idx === messages.length - 1 ? (
                      <div className="flex items-center gap-1 h-6 px-1">
                        <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" />
                      </div>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area (Sticky Bottom) */}
        <div className="p-4 bg-background/80 backdrop-blur-xl border-t border-border z-20">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="AI 멘토에게 무엇이든 물어보세요..."
                disabled={isLoading}
                className="w-full pl-5 pr-12 py-3.5 bg-background border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground transition-all shadow-sm"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              size="icon"
              className="w-12 h-12 bg-gradient-to-br from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 rounded-2xl shadow-lg shadow-primary/30 disabled:shadow-none flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-muted-foreground">
              AI는 실수할 수 있습니다. 중요한 정보는 문서를 확인하세요.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default KnowledgeChatPage;
