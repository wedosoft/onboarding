import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface TopBarProps {
  // title prop is no longer used since we have navigation
}

const navItems = [
  { path: '/', icon: 'fas fa-home', label: '대시보드' },
  { path: '/curriculum', icon: 'fas fa-graduation-cap', label: '핵심 기능 학습' },
  { path: '/scenarios', icon: 'fas fa-tasks', label: '시나리오 학습' },
  { path: '/knowledge', icon: 'fas fa-comments', label: '제품 지식 챗' },
  { path: '/documents', icon: 'fas fa-book', label: '지식 베이스' },
];

const adminItems = [
  { path: '/admin', icon: 'fas fa-cog', label: '관리자' },
];

const TopBar: React.FC<TopBarProps> = () => {
  const { user, signOut } = useAuth();

  // 관리자 체크
  const isAdmin = user?.email === 'alan@wedosoft.net';

  return (
    <header className="h-16 glass border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
      {/* Left: Logo + Navigation */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <NavLink to="/" className="flex items-center">
          <img
            src="/logo-light.png"
            alt="온보딩 나침반"
            className="h-8"
          />
        </NavLink>

        {/* Navigation - Desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${isActive
                  ? 'bg-primary-500/20 text-primary-600 font-medium'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-primary-600'
                }`
              }
            >
              <i className={`${item.icon} text-sm`} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          {/* Admin menu items */}
          {isAdmin && adminItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${isActive
                  ? 'bg-primary-500/20 text-primary-600 font-medium'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-primary-600'
                }`
              }
            >
              <i className={`${item.icon} text-sm`} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Right: User info + Logout */}
      <div className="flex items-center gap-3">
        {/* User info - Desktop */}
        {user && (
          <div className="hidden lg:flex items-center gap-2">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || ''}
                className="w-8 h-8 rounded-full border border-primary-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">
                {(user.name || user.email || '?')[0].toUpperCase()}
              </div>
            )}
            <div className="text-sm">
              <p className="font-medium text-slate-700">
                {user.name || user.email?.split('@')[0]}
              </p>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-primary-600 rounded-lg transition-colors"
        >
          <i className="fas fa-sign-out-alt" />
          <span className="hidden sm:inline">로그아웃</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
