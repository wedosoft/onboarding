import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProgressSummary } from '../services/apiClient';
import { CurriculumModule, ProgressSummary } from '../types';

// 모듈 아이콘 및 그라데이션 매핑
const MODULE_STYLES: Record<string, { icon: string; gradient: string }> = {
  'ticket-basics': { icon: 'fas fa-ticket-alt', gradient: 'from-blue-400 to-indigo-500' },
  'service-catalog': { icon: 'fas fa-book-open', gradient: 'from-purple-400 to-fuchsia-500' },
  'automation': { icon: 'fas fa-robot', gradient: 'from-amber-400 to-orange-500' },
  'asset-management': { icon: 'fas fa-server', gradient: 'from-slate-700 to-slate-900' },
  'reporting': { icon: 'fas fa-chart-bar', gradient: 'from-emerald-400 to-teal-500' },
  'omnichannel': { icon: 'fas fa-globe', gradient: 'from-cyan-400 to-blue-500' },
  'knowledge-base': { icon: 'fas fa-book', gradient: 'from-pink-400 to-rose-500' },
  'chatbot': { icon: 'fas fa-robot', gradient: 'from-violet-400 to-purple-500' },
  // Default fallback
  'default': { icon: 'fas fa-cube', gradient: 'from-slate-400 to-slate-600' }
};

const getModuleStyle = (slug: string) => MODULE_STYLES[slug] || MODULE_STYLES['default'];

export default function CurriculumModulesPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const getOrCreateSessionId = () => {
    let sessionId = localStorage.getItem('onboarding_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('onboarding_session_id', sessionId);
    }
    return sessionId;
  };

  const sessionId = getOrCreateSessionId();
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null);
      const summary = await getProgressSummary(sessionId, productId || 'freshservice');
      setProgressSummary(summary);
    } catch (err) {
      console.error('Failed to fetch curriculum modules:', err);
      setError('커리큘럼 모듈을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [productId, sessionId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleModuleSelect = (moduleId: string) => {
    navigate(`/curriculum/${productId}/${moduleId}`);
  };

  const modules = progressSummary?.modules || [];
  const completedCount = progressSummary?.completedModules || 0;
  const completionRate = progressSummary?.completionRate || 0;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <i className="fas fa-exclamation-triangle text-4xl text-amber-500 mb-4"></i>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={fetchModules}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <button
          onClick={() => navigate('/curriculum')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-3 text-sm"
        >
          <i className="fas fa-arrow-left"></i>
          <span>제품 선택으로 돌아가기</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              학습 시나리오
            </h1>
            <p className="text-sm text-gray-600">
              단계별 미션을 통해 실무 역량을 키우세요.
            </p>
          </div>
          
          {/* Progress Summary */}
          <div className="bg-gray-50 rounded-lg p-4 min-w-[240px] border border-gray-200">
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">진행률</span>
                <p className="text-xl font-bold text-gray-900">{Math.round(completionRate)}%</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-blue-600">
                  {completedCount} / {modules.length}
                </span>
                <p className="text-xs text-gray-500">모듈 완료</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod, index) => {
          const style = getModuleStyle(mod.slug);
          const isCompleted = mod.status === 'completed';
          const isStarted = mod.status === 'learning';

          return (
            <button
              key={mod.id}
              onClick={() => handleModuleSelect(mod.id)}
              className="text-left group bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              {/* Visual Header */}
              <div className={`h-24 bg-gradient-to-br ${style.gradient} p-4 flex items-center justify-between relative overflow-hidden rounded-t-lg`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                
                <div className="relative z-10 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm text-white text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="text-white text-2xl">
                    <i className={style.icon}></i>
                  </div>
                </div>
                
                {isCompleted && (
                  <span className="relative z-10 bg-white/90 text-green-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <i className="fas fa-check-circle"></i> 완료
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                  {mod.nameKo}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {mod.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <i className="far fa-clock"></i>
                    <span>{mod.estimatedMinutes || 15}분</span>
                  </div>

                  <div className={`px-3 py-1 rounded text-xs font-semibold ${
                    isCompleted
                      ? 'bg-green-100 text-green-700'
                      : isStarted
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-blue-600 group-hover:text-white'
                  }`}>
                    {isCompleted ? '복습하기' : isStarted ? '이어하기' : '시작하기'}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {isStarted && !isCompleted && (
                <div className="h-1 bg-blue-100 rounded-b-lg overflow-hidden">
                  <div className="h-full bg-blue-500 w-1/3"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
