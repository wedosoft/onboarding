import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/', icon: 'fas fa-home', label: '대시보드' },
  { path: '/products', icon: 'fas fa-graduation-cap', label: '제품 학습' },
  { path: '/scenarios', icon: 'fas fa-tasks', label: '업무 센스' },
  { path: '/knowledge', icon: 'fas fa-comments', label: '멘토 채팅' },
  { path: '/documents', icon: 'fas fa-book', label: '지식 베이스' },
];

const adminItems = [
  { path: '/admin', icon: 'fas fa-cog', label: '관리자' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

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
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-border">
          <NavLink to="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 230.03 111.78"
              className="h-8"
            >
              <defs>
                <style>{`.cls-1{fill:#3284d6;}`}</style>
              </defs>
              <g>
                <path className="cls-1" d="M125.09,4.76c0-4.15-4.94-6.3-7.98-3.48l-32.96,30.59c-.97,.9-1.52,2.16-1.52,3.48v26.44c0,4.15,4.94,6.3,7.98,3.48l32.96-30.59c.97-.9,1.52-2.16,1.52-3.48V4.76Z" />
                <path className="cls-1" d="M159.57,1.28l-32.96,30.59c-.97,.9-1.52,2.16-1.52,3.48v26.44c0,4.15,4.94,6.3,7.98,3.48l32.96-30.59c.97-.9,1.52-2.16,1.52-3.48V4.76c0-4.15-4.94-6.3-7.98-3.48Z" />
                <circle className="cls-1" cx="74.99" cy="12.5" r="12.5" />
              </g>
            </svg>
            <span className="text-lg font-bold text-primary">온보딩 나침반</span>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            메뉴
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                  ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
              <div className="pt-4 mt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                  관리
                </p>
                {adminItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                        ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || ''}
                  className="w-10 h-10 rounded-full border border-primary/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  {(user.name || user.email || '?')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.name || user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
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
