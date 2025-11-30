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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto relative">
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-banana-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>

        {/* Logo */}
        <div className="text-center mb-8 relative z-10">
          <div className="flex justify-center items-center mb-4">
            <div className="w-20 h-20 bg-banana-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,192,0,0.5)] transform rotate-3 hover:rotate-6 transition-transform">
              <i className="fas fa-compass text-4xl text-dark-900"></i>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            온보딩 나침반
          </h1>
          <p className="text-slate-300">
            AI 시니어 멘토와 함께하는 회사 생활 길라잡이
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-8 relative z-10">
          <h2 className="text-xl font-bold text-center text-white mb-2">
            시작하기
          </h2>
          <p className="text-center text-slate-400 mb-6">
            회사 Google 계정으로 로그인해주세요.
          </p>

          <button
            onClick={signIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-slate-50 border border-transparent rounded-xl shadow-lg hover:shadow-xl transition-all group"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" className="flex-shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-lg font-medium text-slate-700 group-hover:text-slate-900">
              Google 계정으로 로그인
            </span>
          </button>

          <p className="text-xs text-center text-slate-500 mt-6">
            회사 내부 시스템입니다. 회사 계정으로 로그인해주세요.
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center relative z-10">
          <div className="p-4 glass rounded-xl border border-white/5">
            <div className="w-10 h-10 bg-banana-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-tasks text-banana-400" />
            </div>
            <p className="text-sm text-slate-300">시나리오 학습</p>
          </div>
          <div className="p-4 glass rounded-xl border border-white/5">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-comments text-purple-400" />
            </div>
            <p className="text-sm text-slate-300">AI 멘토 채팅</p>
          </div>
          <div className="p-4 glass rounded-xl border border-white/5">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-folder-open text-green-400" />
            </div>
            <p className="text-sm text-slate-300">인수인계 문서</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
