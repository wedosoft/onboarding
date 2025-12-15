
import React from 'react';

interface LoadingSpinnerProps {
  /** 기본값: "로딩 중..." */
  message?: string | null;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = '로딩 중...' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <div
        className="w-10 h-10 rounded-full animate-spin border-4 border-solid border-primary-500 border-t-transparent"
        role="status"
        aria-label="로딩 중"
      ></div>
      {message ? <p className="text-primary-400 font-semibold">{message}</p> : null}
    </div>
  );
};

export default LoadingSpinner;
