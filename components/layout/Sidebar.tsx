import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: 'fas fa-home', label: '대시보드' },
    { path: '/curriculum', icon: 'fas fa-layer-group', label: '학습 시나리오' }, // Renamed from Curriculum to Learning Scenarios as requested
    { path: '/documents', icon: 'fas fa-folder-open', label: '자료실' },
    { path: '/knowledge', icon: 'fas fa-comments', label: 'AI 멘토' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-20 lg:w-64 h-screen flex flex-col fixed left-0 top-0 z-50 glass-dark border-r border-white/5 bg-slate-900 transition-all duration-300">
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-glow">
          <i className="fas fa-compass text-white text-xl"></i>
        </div>
        <span className="hidden lg:block ml-3 font-display font-bold text-xl text-white tracking-tight">
          Onboarding
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`
              flex items-center px-3 lg:px-4 py-3 rounded-xl transition-all duration-200 group relative
              ${isActive(item.path)
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <div className={`w-8 flex items-center justify-center text-lg ${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
              <i className={item.icon}></i>
            </div>
            <span className="hidden lg:block ml-3 font-medium text-sm tracking-wide">
              {item.label}
            </span>
            {isActive(item.path) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full lg:hidden"></div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile (Compact) */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
          {user?.avatar ? (
            <img src={user.avatar} alt="User" className="w-10 h-10 rounded-lg object-cover ring-2 ring-white/10" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-white font-bold ring-2 ring-white/10">
              {(user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </div>
          )}
          <div className="hidden lg:block overflow-hidden">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-slate-400 truncate">신입 사원</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
