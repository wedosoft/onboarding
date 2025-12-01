
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <div
        className="w-10 h-10 rounded-full animate-spin border-4 border-solid border-primary-500 border-t-transparent"
        role="status"
        aria-label="로딩 중"
      ></div>
      <p className="text-primary-400 font-semibold">AI 멘토가 분석 중입니다...</p>
    </div>
  );
};

export default LoadingSpinner;
