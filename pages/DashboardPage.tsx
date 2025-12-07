import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SCENARIOS } from '../constants';
import { getProgress } from '../services/apiClient';
import SurfaceCard from '../components/layout/SurfaceCard';
import SectionHeader from '../components/layout/SectionHeader';

interface ProgressData {
  completedScenarios: Array<{
    scenarioId: string;
    choiceId: string;
    completedAt: string | null;
  }>;
  totalScenarios: number;
  completionRate: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userName = user?.name || user?.email?.split('@')[0] || '신입사원';

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const sessionId = localStorage.getItem('onboarding_session_id');
        if (sessionId) {
          const data = await getProgress(sessionId);
          setProgress(data);
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, []);

  const completedCount = progress?.completedScenarios?.length || 0;
  const totalCount = SCENARIOS.length;
  const completionPercent = Math.round((completedCount / totalCount) * 100);

  // Recent 3 activities
  const recentActivities = progress?.completedScenarios
    ? [...progress.completedScenarios].reverse().slice(0, 3).map(item => {
      const scenario = SCENARIOS.find(s => s.id === item.scenarioId);
      return { ...item, scenario };
    })
    : [];

  const quickLinks = [
    {
      title: 'AI 멘토 질문',
      description: '업무 중 막히는 부분은 실시간으로 멘토에게!',
      icon: 'fas fa-comments',
      to: '/knowledge',
      iconBg: 'bg-violet-100 text-violet-600',
    },
    {
      title: '인수인계 문서',
      description: '팀 지식 저장소에서 필요한 자료를 찾아보세요.',
      icon: 'fas fa-folder-open',
      to: '/documents',
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      title: '커리큘럼 실습',
      description: '시나리오 기반 학습으로 현업 감각을 익혀요.',
      icon: 'fas fa-layer-group',
      to: '/curriculum',
      iconBg: 'bg-amber-100 text-amber-600',
    },
    {
      title: '제품 지식 평가',
      description: 'Freshservice AI 멘토와 실습을 진행해보세요.',
      icon: 'fas fa-rocket',
      to: '/assessment/products',
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
  ];

  const renderHero = () => (
    <SurfaceCard
      tone="brand"
      padding="lg"
      className="relative overflow-hidden h-full flex flex-col justify-between"
    >
      <div className="relative z-10 space-y-4">
        <p className="text-sm uppercase tracking-widest text-white/70">Onboarding Journey</p>
        <h2 className="text-3xl lg:text-4xl font-bold">
          반가워요, {userName}님! 👋
        </h2>
        <p className="text-white/80 max-w-2xl text-lg">
          오늘도 성장 여정을 이어가 볼까요? 현재 전체 온보딩의{' '}
          <strong className="text-white px-2 py-1 rounded-xl bg-white/20">{completionPercent}%</strong>
          를 달성했어요.
        </p>
      </div>

      <div className="relative z-10 mt-6 space-y-3">
        <div className="w-full bg-white/20 rounded-full h-3">
          <div
            className="h-full rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm text-white/80">
          <span>시작 단계</span>
          <span>마스터</span>
        </div>
        {completionPercent < 100 && (
          <Link
            to="/curriculum"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white"
          >
            첫 번째 시나리오 시작하기
            <i className="fas fa-arrow-right"></i>
          </Link>
        )}
      </div>

      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_70%)]" />
    </SurfaceCard>
  );

  return (
    <div className="layout-stack">
      <SectionHeader
        title="대시보드"
        subtitle="온보딩 진행 상황과 최근 활동을 한눈에 확인하세요"
        icon={<i className="fas fa-compass"></i>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-h-[18rem]">
          {renderHero()}
        </div>

        <SurfaceCard className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">완료한 시나리오</p>
              <p className="text-4xl font-bold text-slate-900 mt-1">
                {completedCount}
                <span className="text-lg text-slate-400 ml-1">/ {totalCount}</span>
              </p>
            </div>
            <span className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <i className="fas fa-fire"></i>
            </span>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-sm text-slate-500">진행률</p>
            <p className="text-2xl font-semibold text-slate-900">{completionPercent}%</p>
          </div>
          <Link
            to="/curriculum"
            className="w-full py-3 rounded-2xl bg-slate-900 text-white text-center font-medium hover:bg-slate-800 transition"
          >
            학습 이어하기
          </Link>
        </SurfaceCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickLinks.map(link => (
          <SurfaceCard key={link.title} variant="solid" padding="md" className="hover:-translate-y-1 transition">
            <Link to={link.to} className="flex flex-col gap-3 h-full">
              <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${link.iconBg}`}>
                <i className={`${link.icon} text-lg`}></i>
              </span>
              <div>
                <p className="text-base font-semibold text-slate-900">{link.title}</p>
                <p className="text-sm text-slate-500">{link.description}</p>
              </div>
              <span className="text-sm font-medium text-primary-600 inline-flex items-center gap-1">
                바로가기 <i className="fas fa-arrow-right"></i>
              </span>
            </Link>
          </SurfaceCard>
        ))}
      </div>

      <SurfaceCard padding="lg" className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-slate-800">
          <i className="fas fa-history text-slate-400"></i>
          <h3 className="text-xl font-semibold">최근 활동</h3>
        </div>

        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, idx) => (
              <div
                key={`${activity.scenarioId}-${idx}`}
                className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-primary-100 transition"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <i className="fas fa-check"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">
                    {activity.scenario?.title || '알 수 없는 시나리오'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {activity.completedAt ? new Date(activity.completedAt).toLocaleDateString() : '날짜 정보 없음'} 완료
                  </p>
                </div>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                  {SCENARIOS.find(s => s.id === activity.scenarioId)?.category === 'productivity' ? '생산성' : '커뮤니케이션'}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-400">
              <p>아직 활동 내역이 없습니다. 첫 학습을 시작해보세요!</p>
            </div>
          )}
        </div>
      </SurfaceCard>
    </div>
  );
};

export default DashboardPage;
