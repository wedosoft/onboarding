import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import SurfaceCard from '../components/layout/SurfaceCard';
import SectionHeader from '../components/layout/SectionHeader';
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
  default: { icon: 'fas fa-layer-group', gradient: 'from-slate-500 to-slate-700' },
};

const getModuleStyle = (slug: string) => MODULE_STYLES[slug] || MODULE_STYLES.default;

const CurriculumModulesPage: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const sessionId = localStorage.getItem('onboarding_session_id') || '';

  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    if (!sessionId) {
      setError('세션 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      setIsLoading(false);
      return;
    }

    if (!productId) {
      setError('선택된 제품을 찾을 수 없습니다. 이전 화면으로 돌아가 다시 선택해주세요.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const summary = await getProgressSummary(sessionId, productId);
      setProgressSummary(summary);
    } catch (err) {
      console.error('Failed to load curriculum modules:', err);
      setError(err instanceof Error ? err.message : '모듈 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [productId, sessionId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleModuleSelect = (moduleId: string) => {
    if (!productId) return;
    navigate(`/curriculum/${productId}/${moduleId}`);
  };

  const modules: CurriculumModule[] = progressSummary?.modules || [];
  const completedCount = progressSummary?.completedModules || 0;
  const completionRate = progressSummary?.completionRate || 0;
  const displaySessionId = progressSummary?.sessionId || sessionId;

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
        <SurfaceCard className="max-w-md text-center" padding="lg">
          <div className="space-y-6">
            <i className="fas fa-exclamation-triangle text-4xl text-amber-500"></i>
            <p className="text-slate-600">{error}</p>
            <button
              onClick={fetchModules}
              className="px-6 py-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              다시 시도
            </button>
          </div>
        </SurfaceCard>
      </div>
    );
  }

  return (
    <div className="layout-stack pb-12">
      <SectionHeader
        title="학습 시나리오"
        subtitle="단계별 미션을 통해 실무 역량을 키우세요"
        icon={<i className="fas fa-graduation-cap"></i>}
        action={(
          <button
            onClick={() => navigate('/curriculum')}
            className="px-4 py-2 rounded-2xl border border-slate-200 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <i className="fas fa-arrow-left mr-2" />제품 선택으로 돌아가기
          </button>
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SurfaceCard padding="lg" className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <span className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <i className="fas fa-bullseye" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">총 모듈</p>
                <p className="text-xl font-bold text-slate-900">{modules.length}개</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <i className="fas fa-check" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">완료</p>
                <p className="text-xl font-bold text-slate-900">{completedCount}개</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">진행률</p>
              <p className="text-3xl font-semibold text-slate-900">{Math.round(completionRate)}%</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-indigo-600 transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard padding="lg" className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-slate-900">세션 정보</h3>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-500 break-all">
            <p className="font-mono text-xs">세션 ID</p>
            <p className="text-slate-800 font-medium">{displaySessionId || '세션을 확인할 수 없습니다'}</p>
          </div>
          <p className="text-xs text-slate-400">
            세션은 자동 저장됩니다. 다른 기기에서도 동일 계정으로 계속 학습할 수 있어요.
          </p>
        </SurfaceCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {modules.map((mod, index) => {
          const style = getModuleStyle(mod.slug);
          const isCompleted = mod.status === 'completed';
          const isStarted = mod.status === 'learning';

          return (
            <SurfaceCard
              key={mod.id}
              as="button"
              type="button"
              onClick={() => handleModuleSelect(mod.id)}
              className="text-left group h-full p-0 overflow-hidden border border-slate-100 hover:border-primary-200"
            >
              <div className={`h-28 bg-gradient-to-br ${style.gradient} p-4 flex items-center justify-between relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/10 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-4">
                  <span className="w-10 h-10 rounded-2xl bg-white/20 text-white font-semibold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <i className={`${style.icon} text-white text-2xl`}></i>
                </div>
                {isCompleted && (
                  <span className="relative z-10 bg-white/90 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <i className="fas fa-check-circle"></i> 완료
                  </span>
                )}
              </div>

              <div className="p-5 flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">{mod.nameKo}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{mod.description}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 text-slate-500">
                    <i className="far fa-clock"></i>
                    {mod.estimatedMinutes || 15}분 예상
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-600'
                        : isStarted
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-primary-600 group-hover:text-white'
                    }`}
                  >
                    {isCompleted ? '복습하기' : isStarted ? '이어하기' : '시작하기'}
                  </span>
                </div>
              </div>

              {isStarted && !isCompleted && (
                <div className="h-1 bg-blue-50">
                  <div className="h-full bg-blue-500 w-1/3"></div>
                </div>
              )}
            </SurfaceCard>
          );
        })}
      </div>

      {modules.length === 0 && (
        <SurfaceCard className="text-center" padding="lg">
          <p className="text-slate-500">아직 등록된 학습 모듈이 없습니다. 관리자에게 문의해주세요.</p>
        </SurfaceCard>
      )}
    </div>
  );
};

export default CurriculumModulesPage;
