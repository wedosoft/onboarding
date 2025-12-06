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
    <div className="space-y-8 pb-12">
      {/* Header with Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
        <div>
          <button
            onClick={() => navigate('/curriculum')}
            className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 mb-2 text-sm font-medium"
          >
            <i className="fas fa-arrow-left"></i> 제품 선택으로 돌아가기
          </button>
          <h1 className="text-3xl font-display font-bold text-slate-900">
            학습 시나리오 <span className="text-slate-400 font-light">| Modules</span>
          </h1>
        </div>

        {/* Progress Card */}
        <div className="glass-card p-4 rounded-2xl flex items-center gap-6 min-w-[280px]">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600 font-medium">전체 진행률</span>
              <span className="text-primary-600 font-bold">{Math.round(completionRate)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
          <div className="text-right border-l pl-6 border-slate-200">
            <div className="text-2xl font-bold text-slate-800">{completedCount}</div>
            <div className="text-xs text-slate-500">완료한 모듈</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod, index) => {
          const style = getModuleStyle(mod.slug);
          const isCompleted = mod.status === 'completed';
          const isStarted = mod.status === 'learning';

          return (
            <button
              key={mod.id}
              onClick={() => handleModuleSelect(mod.id)}
              className="group relative text-left h-full"
            >
              <div
                className={`
                  h-full glass-card overflow-hidden transition-all duration-300
                  hover:-translate-y-1 hover:shadow-xl
                  ${isCompleted ? 'border-green-200 bg-green-50/30' : 'hover:border-primary-200'}
                `}
              >
                {/* Card Top: Visual Header */}
                <div className={`h-32 bg-gradient-to-br ${style.gradient} relative p-6 flex flex-col justify-between overflow-hidden`}>

                  {/* Abstract shapes in background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-10 rounded-full blur-xl -ml-8 -mb-8"></div>

                  <div className="relative z-10 flex justify-between items-start">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md text-white text-sm font-bold border border-white/20">
                      {index + 1}
                    </span>
                    {isCompleted && (
                      <span className="bg-white/90 text-green-600 text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <i className="fas fa-check-circle"></i> 완료됨
                      </span>
                    )}
                  </div>

                  <div className="relative z-10 text-white text-4xl opacity-90 group-hover:scale-110 transition-transform duration-500 origin-bottom-left">
                    <i className={style.icon}></i>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {mod.nameKo}
                  </h3>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10">
                    {mod.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <i className="far fa-clock"></i>
                      <span>{mod.estimatedMinutes || 15}분</span>
                    </div>

                    <div className={`
                       px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                       ${isCompleted
                        ? 'bg-green-100 text-green-700'
                        : isStarted
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white'
                      }
                     `}>
                      {isCompleted ? '복습하기' : isStarted ? '이어하기' : '시작하기'}
                    </div>
                  </div>
                </div>

                {/* Progress Bar (Bottom) */}
                {isStarted && !isCompleted && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-100">
                    <div className="h-full bg-blue-500 w-1/3"></div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
