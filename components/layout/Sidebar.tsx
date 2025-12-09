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
    <aside className="w-20 lg:w-64 h-screen flex flex-col fixed left-0 top-0 z-50 glass-dark border-r border-border bg-background transition-all duration-300">
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
          <i className="fas fa-compass text-primary-foreground text-xl"></i>
        </div>
        <span className="hidden lg:block ml-3 font-display font-bold text-xl text-foreground tracking-tight">
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
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }
            `}
          >
            <div className={`w-8 flex items-center justify-center text-lg ${isActive(item.path) ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
              <i className={item.icon}></i>
            </div>
            <span className="hidden lg:block ml-3 font-medium text-sm tracking-wide">
              {item.label}
            </span>
            {isActive(item.path) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full lg:hidden"></div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile (Compact) */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
          {user?.avatar ? (
            <img src={user.avatar} alt="User" className="w-10 h-10 rounded-lg object-cover ring-2 ring-border" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground font-bold ring-2 ring-border">
              {(user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </div>
          )}
          <div className="hidden lg:block overflow-hidden">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-muted-foreground truncate">신입 사원</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
