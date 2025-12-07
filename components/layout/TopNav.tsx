import { Link, useLocation } from 'react-router-dom';
import PageContainer from './PageContainer';

export default function TopNav() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <PageContainer width="wide" className="h-16 flex items-center justify-between">
        {/* 로고 & 메인 네비게이션 */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <i className="fas fa-compass text-white"></i>
            </div>
            <span className="font-bold text-lg text-gray-900">고복수 팀장의 온보딩</span>
          </Link>
          
          <div className="flex items-center gap-1">
            <Link 
              to="/" 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                isActive('/') 
                  ? 'text-white bg-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <i className="fas fa-home mr-2"></i>대시보드
            </Link>
            <Link 
              to="/curriculum" 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                isActive('/curriculum') 
                  ? 'text-white bg-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <i className="fas fa-layer-group mr-2"></i>학습 시나리오
            </Link>
            <Link 
              to="/documents" 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                isActive('/documents') 
                  ? 'text-white bg-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <i className="fas fa-folder-open mr-2"></i>자료실
            </Link>
            <Link 
              to="/knowledge" 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                isActive('/knowledge') 
                  ? 'text-white bg-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <i className="fas fa-comments mr-2"></i>멘토 채팅
            </Link>
          </div>
        </div>
        
        {/* 사용자 프로필 */}
        <div className="flex items-center gap-3">
          <img 
            src="https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff" 
            alt="User" 
            className="w-8 h-8 rounded-full"
          />
          <div className="text-sm">
            <p className="font-semibold text-gray-900">사용자</p>
            <p className="text-xs text-gray-500">신입 사원</p>
          </div>
        </div>
      </PageContainer>
    </nav>
  );
}
