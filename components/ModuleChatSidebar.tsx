import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, CurriculumModule } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { streamModuleChat } from '../services/apiClient';

interface ModuleChatSidebarProps {
  module: CurriculumModule;
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ModuleChatSidebar: React.FC<ModuleChatSidebarProps> = ({
  module,
  sessionId,
  isOpen,
  onClose,
}) => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 스크롤 자동 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isLoading]);

  // 사이드바 열릴 때 인풋 포커스
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 모듈 변경 시 히스토리 초기화
  useEffect(() => {
    setHistory([]);
  }, [module.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // 사용자 메시지 추가
    setHistory((prev) => [...prev, { role: 'user', content: userMessage }]);

    // AI 응답 플레이스홀더 추가
    setHistory((prev) => [...prev, { role: 'model', content: '' }]);
    setIsLoading(true);

    try {
      let fullResponse = '';
      for await (const event of streamModuleChat(module.id, sessionId, userMessage)) {
        if (event.data?.text) {
          fullResponse += event.data.text;
          setHistory((prev) => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = { role: 'model', content: fullResponse };
            return newHistory;
          });
        }
      }
    } catch (error) {
      console.error('Module chat error:', error);
      setHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          role: 'model',
          content: '죄송합니다. 응답 중 오류가 발생했습니다. 다시 시도해주세요.',
        };
        return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 추천 질문
  const suggestedQuestions = [
    `${module.nameKo}의 핵심 기능이 뭐예요?`,
    `실무에서 어떻게 활용하나요?`,
    `자주 하는 실수가 있나요?`,
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <aside
      className={`fixed right-0 top-0 h-full bg-background/95 border-l border-border shadow-2xl z-40 
        transition-all duration-300 ease-out flex flex-col
        ${isOpen ? 'w-96 translate-x-0' : 'w-0 translate-x-full overflow-hidden'}`}
    >
      {/* Header */}
      <header className="p-4 border-b border-border flex justify-between items-center flex-shrink-0 bg-muted/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
            <i className="fa-solid fa-robot text-primary"></i>
          </div>
          <div>
            <h2 className="text-sm font-bold text-primary">AI 멘토</h2>
            <p className="text-xs text-muted-foreground">{module.nameKo} 학습 도우미</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-primary transition-colors p-2"
          aria-label="사이드바 닫기"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {history.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <i className="fa-solid fa-lightbulb text-2xl text-primary"></i>
            </div>
            <h3 className="text-foreground font-medium mb-2">무엇이든 물어보세요!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {module.nameKo}에 대해 궁금한 점이 있으면<br />편하게 질문해주세요.
            </p>
            
            {/* 추천 질문 */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-2">추천 질문</p>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestion(q)}
                  className="block w-full text-left text-sm px-4 py-2 bg-muted/50 rounded-lg border border-border text-muted-foreground hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-colors"
                >
                  <i className="fa-solid fa-arrow-right text-primary mr-2 text-xs"></i>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((msg, index) => {
          const isLastModelMessage = msg.role === 'model' && index === history.length - 1;
          const showBouncingDots = isLastModelMessage && msg.content === '' && isLoading;

          return (
            <div
              key={index}
              className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 border border-primary/20">
                  <i className="fa-solid fa-robot text-primary text-xs"></i>
                </div>
              )}
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground font-medium rounded-br-lg shadow-md'
                    : 'bg-muted text-foreground rounded-bl-lg border border-border'
                }`}
              >
                {showBouncingDots ? (
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-primary rounded-full animate-bounce"></span>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none prose-p:text-inherit prose-headings:text-primary prose-strong:text-primary prose-a:text-primary">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-border flex-shrink-0 bg-muted/50">
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="질문을 입력하세요..."
              disabled={isLoading}
              className="w-full py-2.5 pl-4 pr-12 bg-background rounded-full border border-input focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition text-foreground placeholder-muted-foreground text-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors shadow-sm"
              aria-label="메시지 보내기"
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </div>
        </div>
      </form>
    </aside>
  );
};

export default ModuleChatSidebar;
