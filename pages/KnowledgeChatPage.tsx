import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../contexts/AuthContext';
import { getChatResponseStream, initializeMentorSession } from '../services/geminiService';
import { ChatMessage } from '../types';

const suggestedQuestions = [
  '신입 사원으로서 첫 주에 집중해야 할 것은?',
  '효과적인 1:1 미팅 준비 방법은?',
  '업무 우선순위를 정하는 좋은 방법은?',
  '팀 내 커뮤니케이션을 잘하려면?',
  '우리 회사의 핵심 가치는 무엇인가요?',
  '연차 사용 규정이 어떻게 되나요?',
];

const KnowledgeChatPage: React.FC = () => {
  const { user } = useAuth();
  const userName = user?.name || user?.email?.split('@')[0] || '신입사원';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize session
  useEffect(() => {
    const init = async () => {
      if (!isInitialized) {
        await initializeMentorSession(userName);
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
      inputRef.current?.focus();
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden max-w-[1400px] mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex-none mb-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            멘토 채팅
          </h1>
          <p className="text-sm text-gray-600">
            실시간으로 궁금한 점을 해소하고 피드백을 받아보세요
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col relative glass-card rounded-3xl overflow-hidden border border-white/40 shadow-xl shadow-slate-200/50">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/80 to-transparent pointer-events-none z-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-40 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100 rounded-full blur-3xl -ml-16 -mb-16 opacity-40 pointer-events-none"></div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth z-0">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group animate-fade-in`}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
                ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white'
                  : 'bg-white border border-slate-100 text-violet-600'
                }`}
              >
                <i className={`fas ${msg.role === 'user' ? 'fa-user' : 'fa-robot'}`}></i>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-sm md:text-base leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-none'
                    : 'bg-white/80 backdrop-blur-sm border border-white/50 text-slate-700 rounded-tl-none'
                  }`}
              >
                {msg.role === 'model' ? (
                  <div className="prose prose-sm max-w-none 
                    prose-p:text-slate-700 prose-headings:text-slate-800 prose-strong:text-violet-700 prose-a:text-violet-600
                    prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1 prose-code:rounded
                    prose-ul:list-disc prose-ul:pl-4 prose-ol:list-decimal prose-ol:pl-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content || '...'}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>

              {/* Time (Hidden by default, shown on hover, simple implementation) */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 self-end pb-1">
                지금
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && messages[messages.length - 1]?.content === '' && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-100 text-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <i className="fas fa-robot"></i>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area (Sticky Bottom) */}
        <div className="p-4 bg-white/60 backdrop-blur-xl border-t border-white/50 z-20">

          {/* Suggestions */}
          {messages.length <= 1 && !isLoading && (
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="whitespace-nowrap px-3 py-1.5 text-xs font-medium bg-white/50 hover:bg-white text-violet-600 hover:text-violet-700 border border-violet-100 hover:border-violet-200 rounded-full transition-all shadow-sm hover:shadow"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="AI 멘토에게 무엇이든 물어보세요..."
                disabled={isLoading}
                data-testid="mentor-chat-input"
                className="w-full pl-5 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 text-slate-700 placeholder-slate-400 transition-all shadow-inner"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                {/* Optional: Add voice or attach icons here */}
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-2xl shadow-lg shadow-violet-500/30 disabled:shadow-none transition-all transform active:scale-95"
            >
              <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400">
              AI는 실수할 수 있습니다. 중요한 정보는 문서를 확인하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeChatPage;
