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
  setIsOpen,
  setIsExpanded,
  setInput,
  handleSend,
  handlePraise,
}) => (
  <div
    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-out h-full"
    onClick={e => e.stopPropagation()}
  >
    {/* Header */}
    <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
      <h2 className="text-lg font-bold text-sky-600 dark:text-sky-400">
        <i className="fa-solid fa-robot mr-2"></i>AI 멘토에게 질문하기
      </h2>
      <div className="flex items-center gap-2">
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors" aria-label={isExpanded ? "챗봇 축소" : "챗봇 확장"}>
          <i className={`fa-solid ${isExpanded ? 'fa-compress' : 'fa-expand'} text-lg`}></i>
        </button>
        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors" aria-label="챗봇 닫기">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>
    </header>

    {/* Messages */}
    <div className="flex-1 p-4 overflow-y-auto space-y-4">
      {history.map((msg, index) => (
        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.role === 'model' && <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-robot text-sky-600 dark:text-sky-400"></i></div>}
          <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-sky-600 text-white rounded-br-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-lg'}`}>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex items-end gap-2 justify-start">
          <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-robot text-sky-600 dark:text-sky-400"></i></div>
          <div className="max-w-[80%] p-3 rounded-2xl bg-slate-200 dark:bg-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>

    {/* Input */}
    <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePraise}
          disabled={isLoading}
          className="flex-shrink-0 w-10 h-10 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="칭찬하기"
        >
          <i className="fa-solid fa-thumbs-up text-amber-500"></i>
        </button>
        <div className="relative flex-grow">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="궁금한 점을 물어보세요..."
            disabled={isLoading}
            className="w-full py-2 pl-4 pr-12 bg-slate-100 dark:bg-slate-900 rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-sky-600 text-white rounded-full flex items-center justify-center hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            aria-label="메시지 보내기"
          >
            <i className="fa-solid fa-paper-plane"></i>
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [history, isOpen, isLoading]);

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
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4" onClick={() => setIsExpanded(false)}>
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
        className="fixed bottom-6 right-4 sm:right-6 lg:right-8 w-16 h-16 bg-sky-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-900 transition-all transform hover:scale-110 z-50"
        aria-label="AI 멘토와 대화 시작"
      >
        <i className={`fa-solid ${isOpen ? 'fa-times' : 'fa-comments'} text-2xl transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
    </>
  );
};

export default Chatbot;