import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ title, onMenuClick }) => {
  const { signOut } = useAuth();

  return (
    <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
      {/* Left: Menu button (mobile) + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:bg-white/5 hover:text-banana-400 rounded-lg transition-colors"
        >
          <i className="fas fa-bars text-xl" />
        </button>
        <h1 className="text-xl font-bold text-slate-200">
          {title}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-banana-400 rounded-lg transition-colors"
        >
          <i className="fas fa-sign-out-alt" />
          <span className="hidden sm:inline">로그아웃</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
