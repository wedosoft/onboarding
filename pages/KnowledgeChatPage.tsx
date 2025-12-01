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
            content: 'AI 시니어 멘토입니다. 업무, 제품 지식, 인수인계 관련 무엇이든 물어보세요. 업로드된 문서를 기반으로 답변해드립니다.'
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
        updated[updated.length - 1].content = '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다.';
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
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto glass-card rounded-2xl shadow-xl border border-white/10">
        <div className="p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-md ${msg.role === 'user'
                    ? 'bg-primary-500 text-white font-medium'
                    : 'bg-dark-700/80 text-slate-200 border border-white/5'
                  }`}
              >
                {msg.role === 'model' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-slate-200 prose-headings:text-primary-200 prose-strong:text-primary-300 prose-a:text-primary-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content || '...'}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && messages[messages.length - 1]?.content === '' && (
            <div className="flex justify-start">
              <div className="bg-dark-700/80 rounded-2xl px-5 py-4 border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions (shown when no messages) */}
        {messages.length <= 1 && (
          <div className="p-6 border-t border-white/5 bg-dark-800/30">
            <p className="text-sm text-slate-400 mb-4 flex items-center gap-2">
              <i className="fas fa-lightbulb text-primary-400"></i>
              이런 것들을 물어보세요:
            </p>
            <div className="flex flex-wrap gap-3">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-4 py-2 text-sm bg-dark-700 hover:bg-primary-500/10 text-slate-300 hover:text-primary-300 rounded-xl transition-all border border-white/5 hover:border-primary-500/30"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="질문을 입력하세요..."
            disabled={isLoading}
            className="flex-1 px-5 py-4 bg-dark-800/50 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-200 placeholder-slate-500 disabled:opacity-50 glass"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-6 py-4 bg-primary-500 hover:bg-primary-400 disabled:bg-slate-700 text-white font-bold rounded-2xl transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-primary-500/30"
          >
            <i className="fas fa-paper-plane text-lg" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-3 text-center">
          AI 멘토는 업로드된 인수인계 문서와 제품 지식을 기반으로 답변합니다.
        </p>
      </form>
    </div>
  );
};

export default KnowledgeChatPage;
