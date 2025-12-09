import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FeedbackData } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbackData: FeedbackData;
  onNext: () => void;
  isLoading: boolean;
  onFollowUpQuestion: (question: string) => void;
  isFollowUpLoading: boolean;
  isStreaming: boolean;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  feedbackData,
  onNext,
  isLoading,
  onFollowUpQuestion,
  isFollowUpLoading,
  isStreaming,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center z-50 p-4 pt-20 sm:pt-24"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <div
        className="glass-card bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-muted/50">
          <h2 id="feedback-title" className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-3">
            <i className="fa-solid fa-graduation-cap text-primary"></i>
            AI 멘토 피드백
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="닫기"
          >
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </header>
        <div className="p-6 sm:p-8 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="prose max-w-none text-foreground prose-headings:text-primary prose-strong:text-primary prose-blockquote:border-primary prose-blockquote:bg-primary/10 prose-code:text-primary">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {feedbackData.feedback}
              </ReactMarkdown>
            </div>
          )}

          {!isLoading && !isStreaming && feedbackData.followUpQuestions.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <i className="fa-solid fa-circle-question text-primary"></i>
                더 알아보기
              </h4>
              <div className="flex flex-col space-y-3">
                {feedbackData.followUpQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => onFollowUpQuestion(q)}
                    disabled={isFollowUpLoading}
                    className="text-left p-4 rounded-xl bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border hover:border-primary/30 transition-all disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isFollowUpLoading && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-center gap-3 p-3 text-muted-foreground">
                <div
                  className="w-5 h-5 rounded-full animate-spin border-2 border-solid border-primary border-t-transparent"
                  role="status"
                ></div>
                <span>AI 멘토가 답변을 생각 중입니다...</span>
              </div>
            </div>
          )}

        </div>
        <footer className="p-4 sm:p-6 border-t border-border mt-auto flex justify-end bg-muted/50">
          <button
            onClick={onNext}
            disabled={isLoading || isStreaming || isFollowUpLoading}
            className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-xl hover:bg-primary/90 transition-all duration-200 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-primary/30"
          >
            다음 시나리오
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </footer>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FeedbackModal;
