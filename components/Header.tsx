import React from 'react';

interface HeaderProps {
  userName?: string;
  onHomeClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, onHomeClick }) => {
  const logoElement = (
    <img
      src="/logo-light.svg"
      alt="Wedosoft Logo"
      className="mb-8 h-16 mx-auto block transition-transform duration-200 hover:scale-105"
    />
  );

  return (
    <header className="text-center mb-8 md:mb-12 mt-16 animate-fade-in">
      {userName ? (
        <button
          onClick={onHomeClick}
          className="group transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-900 rounded-lg"
          aria-label="처음으로 돌아가기"
        >
          {logoElement}
        </button>
      ) : (
        logoElement
      )}

      <h1 className="text-4xl sm:text-5xl font-bold text-sky-600 dark:text-sky-400 mb-2 flex items-center justify-center gap-3">
        온보딩 나침반
      </h1>
      {userName ? (
        <p className="text-lg text-slate-600 dark:text-slate-400">
          <strong>{userName}</strong>님, AI 시니어 멘토와 함께하는 회사 생활 길라잡이
        </p>
      ) : (
        <p className="text-lg text-slate-600 dark:text-slate-400">
          AI 시니어 멘토와 함께하는 회사 생활 길라잡이
        </p>
      )}
    </header>
  );
};

export default Header;