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
    className="glass-card bg-dark-900/90 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-out h-full border border-white/10"
    onClick={e => e.stopPropagation()}
  >
    {/* Header */}
    <header className="p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0 bg-white/5">
      <h2 className="text-lg font-bold text-primary-400 flex items-center gap-2">
        <i className="fa-solid fa-robot"></i>AI 멘토에게 질문하기
      </h2>
      <div className="flex items-center gap-2">
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-400 hover:text-primary-400 transition-colors" aria-label={isExpanded ? "챗봇 축소" : "챗봇 확장"}>
          <i className={`fa-solid ${isExpanded ? 'fa-compress' : 'fa-expand'} text-lg`}></i>
        </button>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-primary-400 transition-colors" aria-label="챗봇 닫기">
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
            {msg.role === 'model' && <div className="w-8 h-8 bg-primary-500/10 rounded-full flex items-center justify-center flex-shrink-0 border border-primary-500/20"><i className="fa-solid fa-robot text-primary-400"></i></div>}
            <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary-500 text-white font-medium rounded-br-lg shadow-md' : 'bg-dark-700 text-slate-200 rounded-bl-lg border border-white/5'}`}>
              {showBouncingDots ? (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-primary-400 rounded-full animate-bounce"></span>
                </div>
              ) : (
                <div className="prose prose-sm prose-invert max-w-none prose-p:text-inherit prose-headings:text-primary-200 prose-strong:text-primary-300 prose-a:text-primary-400">
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
    <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex-shrink-0 bg-white/5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePraise}
          disabled={isLoading}
          className="flex-shrink-0 w-10 h-10 bg-dark-700 text-slate-400 rounded-full flex items-center justify-center hover:bg-primary-500/10 hover:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-white/5"
          aria-label="칭찬하기"
        >
          <i className="fa-solid fa-thumbs-up"></i>
        </button>
        <div className="relative flex-grow">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="궁금한 점을 물어보세요..."
            disabled={isLoading}
            className="w-full py-2 pl-4 pr-12 bg-dark-800/50 rounded-full border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition text-slate-200 placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors shadow-sm"
            aria-label="메시지 보내기"
          >
            <i className="fa-solid fa-paper-plane text-sm"></i>
          </button>
        </div>
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

  // Scroll to bottom when new messages are added or loading state changes
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [history, isLoading, isOpen]);

  // Focus input when chat window opens
  useEffect(() => {
    if (isOpen) {
      // Use a timeout to allow the transition animation to complete
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // Matches the transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);


  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handlePraise = () => {
    if (!isLoading) {
      onSendMessage('오늘 정말 도움이 되었어요!');
    }
  };

  const chatWindowProps = {
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
    handlePraise
  };

  return (
    <>
      {/* Chat Window */}
      <div className={`fixed inset-0 z-40 transition-all duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {isExpanded ? (
          // Expanded Modal View
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsExpanded(false)}>
            <div className="w-full max-w-4xl h-[90vh]"><ChatWindow {...chatWindowProps} /></div>
          </div>
        ) : (
          // Floating Popup View
          <div className={`fixed bottom-24 right-4 sm:right-6 lg:right-8 w-[calc(100%-2rem)] max-w-md h-[70%] max-h-[600px] transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-10'}`}>
            <ChatWindow {...chatWindowProps} />
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 sm:right-6 lg:right-8 w-16 h-16 bg-primary-500 text-white rounded-full shadow-lg shadow-primary-500/30 flex items-center justify-center hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-slate-900 transition-all transform hover:scale-110 z-50 border border-primary-400/50"
        aria-label="AI 멘토와 대화 시작"
      >
        <i className={`fa-solid ${isOpen ? 'fa-times' : 'fa-comments'} text-2xl transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
    </>
  );
};

export default Chatbot;