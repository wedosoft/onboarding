import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, Compass, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import PageContainer from './PageContainer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <PageContainer width="wide" className="h-16 flex items-center justify-between">
        {/* 로고 & 메인 네비게이션 */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">고복수 팀장의 온보딩</span>
          </Link>
          
          <div className="flex items-center gap-1">
            <Link 
              to="/" 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                isActive('/') 
                  ? 'text-primary-foreground bg-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              대시보드
            </Link>
            <Link 
              to="/curriculum" 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                isActive('/curriculum') 
                  ? 'text-primary-foreground bg-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              학습 시나리오
            </Link>
            <Link 
              to="/documents" 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                isActive('/documents') 
                  ? 'text-primary-foreground bg-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              자료실
            </Link>
            <Link 
              to="/knowledge" 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                isActive('/knowledge') 
                  ? 'text-primary-foreground bg-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              멘토 채팅
            </Link>
          </div>
        </div>
        
        {/* 테마 토글 & 사용자 프로필 */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-lg"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">테마 전환</span>
          </Button>
          
          {user && (
            <div className="flex items-center gap-3 pl-2 border-l border-border">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name || 'User'} 
                  className="w-8 h-8 rounded-full border border-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {(user.name || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="text-sm hidden sm:block">
                <p className="font-semibold text-foreground leading-none">{user.name || user.email?.split('@')[0]}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  await signOut();
                  navigate('/login');
                }}
                className="text-muted-foreground hover:text-destructive ml-1"
                title="로그아웃"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </PageContainer>
    </nav>
  );
}
