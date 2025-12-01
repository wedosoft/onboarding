import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/', icon: 'fas fa-home', label: '대시보드' },
  { path: '/scenarios', icon: 'fas fa-tasks', label: '시나리오 학습' },
  { path: '/assessment', icon: 'fas fa-clipboard-check', label: '학습 평가' },
  { path: '/knowledge', icon: 'fas fa-comments', label: '제품 지식 챗' },
  { path: '/documents', icon: 'fas fa-book', label: '지식 베이스' },
];

const adminItems = [
  { path: '/admin', icon: 'fas fa-cog', label: '관리자' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();

  // 관리자 체크
  const isAdmin = user?.email === 'alan@wedosoft.net';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 glass-card border-r border-white/5 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-white/5">
          <NavLink to="/" className="flex items-center">
            <img
              src={resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
              alt="온보딩 나침반"
              className="h-10"
            />
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
            메뉴
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                  ? 'bg-primary-500/20 text-primary-400 font-medium border border-primary-500/20 shadow-[0_0_10px_rgba(90,142,192,0.1)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-primary-200'
                }`
              }
            >
              <i className={`${item.icon} w-5 text-center`} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="pt-4 mt-4 border-t border-white/5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                  관리
                </p>
                {adminItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                        ? 'bg-primary-500/20 text-primary-400 font-medium border border-primary-500/20'
                        : 'text-slate-400 hover:bg-white/5 hover:text-primary-200'
                      }`
                    }
                  >
                    <i className={`${item.icon} w-5 text-center`} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* User info */}
        {user && (
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || ''}
                  className="w-10 h-10 rounded-full border border-primary-500/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                  {(user.name || user.email || '?')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {user.name || user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
