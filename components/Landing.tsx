import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LandingProps {
  onStart: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const { isLoading, signIn } = useAuth();

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-slate-500 dark:text-slate-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="h-20 flex justify-center items-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 230.03 111.78"
              className="h-full"
            >
              <defs>
                <style>{`.cls-1{fill:#3284d6;}.cls-2{fill:#383838;}`}</style>
              </defs>
              <g>
                <g>
                  <polygon className="cls-2" points="26.1 100.07 19.71 85.6 18.59 85.6 12.25 100.07 7.25 85.6 0 85.6 10.37 110.98 11.78 110.98 19.14 97.17 26.54 110.98 27.95 110.98 38.32 85.6 31.04 85.6 26.1 100.07" />
                  <polygon className="cls-2" points="45.21 85.6 41.15 85.6 41.15 110.98 45.21 110.98 47.02 110.98 58.01 110.98 58.01 105.94 47.02 105.94 47.02 100.1 57.28 100.1 57.28 95.17 47.02 95.17 47.02 90.64 58.01 90.64 58.01 85.6 47.02 85.6 45.21 85.6" />
                  <path className="cls-2" d="M90.16,87.16c-2.03-1.04-4.44-1.56-7.21-1.56h-9.06v25.38h9.06c2.78,0,5.18-.52,7.21-1.56,2.03-1.04,3.6-2.51,4.71-4.4,1.11-1.9,1.67-4.14,1.67-6.72s-.56-4.86-1.67-6.74c-1.11-1.89-2.68-3.35-4.71-4.39Zm-.58,14.59c-.41,.93-.96,1.67-1.65,2.23-.69,.56-1.49,.95-2.39,1.2-.91,.24-1.84,.36-2.81,.36h-2.54v-14.5h2.54c.97,0,1.9,.12,2.81,.36,.91,.24,1.7,.64,2.39,1.2,.69,.56,1.24,1.3,1.65,2.23,.41,.93,.62,2.08,.62,3.46s-.21,2.53-.62,3.46Z" />
                </g>
                <g>
                  <path className="cls-1" d="M125.09,4.76c0-4.15-4.94-6.3-7.98-3.48l-32.96,30.59c-.97,.9-1.52,2.16-1.52,3.48v26.44c0,4.15,4.94,6.3,7.98,3.48l32.96-30.59c.97-.9,1.52-2.16,1.52-3.48V4.76Z" />
                  <path className="cls-1" d="M159.57,1.28l-32.96,30.59c-.97,.9-1.52,2.16-1.52,3.48v26.44c0,4.15,4.94,6.3,7.98,3.48l32.96-30.59c.97-.9,1.52-2.16,1.52-3.48V4.76c0-4.15-4.94-6.3-7.98-3.48Z" />
                  <circle className="cls-1" cx="74.99" cy="12.5" r="12.5" />
                </g>
              </g>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-2">
            온보딩 나침반
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            AI 시니어 멘토와 함께하는 회사 생활 길라잡이
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-center text-slate-700 dark:text-slate-200 mb-2">
            시작하기
          </h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-6">
            회사 Google 계정으로 로그인해주세요.
          </p>

          <button
            onClick={signIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-sky-500 transition-all"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" className="flex-shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-lg font-medium text-slate-700 dark:text-slate-200">
              Google 계정으로 로그인
            </span>
          </button>

          <p className="text-xs text-center text-slate-400 mt-6">
            회사 내부 시스템입니다. 회사 계정으로 로그인해주세요.
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-tasks text-sky-600 dark:text-sky-400" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">시나리오 학습</p>
          </div>
          <div className="p-4">
            <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-comments text-sky-600 dark:text-sky-400" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">AI 멘토 채팅</p>
          </div>
          <div className="p-4">
            <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-folder-open text-sky-600 dark:text-sky-400" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">인수인계 문서</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
