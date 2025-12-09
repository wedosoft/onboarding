import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


interface ChatbotProps {
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

interface ChatWindowProps {
  isExpanded: boolean;
  history: ChatMessage[];
  isLoading: boolean;
  input: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  setIsOpen: (isOpen: boolean) => void;
  setIsExpanded: (isExpanded: boolean) => void;
  setInput: (input: string) => void;
  handleSend: (e: React.FormEvent) => void;
  handlePraise: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  isExpanded,
  history,
  isLoading,
  input,
  messagesEndRef,
  inputRef,
  setIsOpen,
  setIsExpanded,
  setInput,
  handleSend,
  handlePraise,
}) => (
  <div
    className="glass-card bg-card/90 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-out h-full border border-border"
    onClick={e => e.stopPropagation()}
  >
    {/* Header */}
    <header className="p-4 border-b border-border flex justify-between items-center flex-shrink-0 bg-muted/50">
      <h2 className="text-lg font-bold text-primary flex items-center gap-2">
        <i className="fa-solid fa-robot"></i>AI 멘토에게 질문하기
      </h2>
      <div className="flex items-center gap-2">
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-muted-foreground hover:text-primary transition-colors" aria-label={isExpanded ? "챗봇 축소" : "챗봇 확장"}>
          <i className={`fa-solid ${isExpanded ? 'fa-compress' : 'fa-expand'} text-lg`}></i>
        </button>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-primary transition-colors" aria-label="챗봇 닫기">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>
    </header>

    {/* Messages */}
    <div className="flex-1 p-4 overflow-y-auto space-y-4">
      {history.map((msg, index) => {
        const isLastModelMessage = msg.role === 'model' && index === history.length - 1;
        const showBouncingDots = isLastModelMessage && msg.content === '' && isLoading;

        return (
          <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 border border-primary/20"><i className="fa-solid fa-robot text-primary"></i></div>}
            <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground font-medium rounded-br-lg shadow-md' : 'bg-muted text-foreground rounded-bl-lg border border-border'}`}>
              {showBouncingDots ? (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-primary rounded-full animate-bounce"></span>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none prose-p:text-inherit prose-headings:text-primary prose-strong:text-primary prose-a:text-primary">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
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
        <button
          type="button"
          onClick={handlePraise}
          disabled={isLoading}
          className="flex-shrink-0 w-10 h-10 bg-muted text-muted-foreground rounded-full flex items-center justify-center hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-border"
          aria-label="칭찬하기"
        >
          <i className="fa-solid fa-thumbs-up"></i>
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="궁금한 점을 물어보세요..."
          className="flex-1 bg-background text-foreground placeholder-muted-foreground border border-input rounded-full px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-primary/25"
          aria-label="전송"
        >
          {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
        </button>
      </div>
    </form>
  </div>
);

const Chatbot: React.FC<ChatbotProps> = ({ history, onSendMessage, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, history]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const handlePraise = () => {
    onSendMessage("설명이 정말 이해하기 쉬워요! 감사합니다.");
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-2xl hover:bg-primary/90 hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center group animate-bounce-subtle"
          aria-label="AI 멘토 열기"
        >
          <i className="fa-solid fa-robot text-2xl group-hover:rotate-12 transition-transform"></i>
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-background"></span>
        </button>
      )}

      {/* Chat Window Overlay */}
      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 ease-out
          ${isExpanded
            ? 'inset-4 md:inset-10'
            : 'bottom-6 right-6 w-[90vw] h-[600px] max-w-[400px] max-h-[80vh]'
          }`}
        >
          <ChatWindow
            isExpanded={isExpanded}
            history={history}
            isLoading={isLoading}
            input={input}
            messagesEndRef={messagesEndRef}
            inputRef={inputRef}
            setIsOpen={setIsOpen}
            setIsExpanded={setIsExpanded}
            setInput={setInput}
            handleSend={handleSend}
            handlePraise={handlePraise}
          />
        </div>
      )}
    </>
  );
};

export default Chatbot;
