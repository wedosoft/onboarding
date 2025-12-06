import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SCENARIOS } from '../constants';
import { getProgress } from '../services/apiClient';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          대시보드
        </h1>
        <p className="text-sm text-gray-600">
          온보딩 진행 상황과 최근 활동을 확인하세요
        </p>
      </div>

      {/* 1. Bento Grid - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-80">

        {/* Welcome Card (Spans 2 columns) */}
        <div className="md:col-span-2 glass-card rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-indigo-700 opacity-90 transition-all duration-500 group-hover:opacity-100"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

          <div className="relative z-10 text-white">
            <h2 className="text-3xl font-display font-bold mb-2">
              반가워요, {userName}님! 👋
            </h2>
            <p className="text-primary-100 text-lg max-w-md">
              오늘도 성장을 위한 여정을 시작해볼까요? <br />
              현재 전체 온보딩 과정의 <strong className="text-white bg-white/20 px-2 py-0.5 rounded-lg">{completionPercent}%</strong>를 달성했습니다.
            </p>
          </div>

          <div className="relative z-10 mt-6">
            <div className="w-full bg-black/20 rounded-full h-3 backdrop-blur-sm overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)] relative overflow-hidden"
                style={{ width: `${completionPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
            <div className="flex justify-between text-sm text-primary-100 mt-2 font-medium">
              <span>시작 단계</span>
              <span>마스터</span>
            </div>
            {completionPercent < 100 && (
              <Link
                to="/curriculum"
                className="text-primary-500 hover:text-primary-600 hover:underline text-sm font-medium mt-4 block text-right"
              >
                첫 번째 시나리오 시작하기
              </Link>
            )}
          </div>

          {/* Decorative Circle */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
        </div>

        {/* Quick Review / Stats Card */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700">학습 현황</h3>
              <span className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <i className="fas fa-fire"></i>
              </span>
            </div>
            <div className="text-4xl font-display font-bold text-slate-800">
              {completedCount}
              <span className="text-lg text-slate-400 font-normal ml-1">/ {totalCount}</span>
            </div>
            <p className="text-slate-500 text-sm mt-1">완료한 시나리오</p>
          </div>

          <Link
            to="/curriculum"
            className="mt-6 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-center transition-all shadow-lg shadow-slate-200"
          >
            학습 이어하기
          </Link>
        </div>
      </div>

      {/* 2. Bento Grid - Lower Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Quick Actions - Mentor */}
        <Link to="/knowledge" className="glass-card p-6 rounded-3xl hover:border-primary-400/50 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fas fa-comments text-xl"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">AI 멘토 질문</h3>
          <p className="text-sm text-slate-500">
            업무 중 막히는 부분이 있나요? 실시간으로 물어보세요.
          </p>
        </Link>

        {/* Quick Actions - Docs */}
        <Link to="/documents" className="glass-card p-6 rounded-3xl hover:border-blue-400/50 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fas fa-folder-open text-xl"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">인수인계 문서</h3>
          <p className="text-sm text-slate-500">
            팀의 지식 저장소에서 필요한 문서를 찾아보세요.
          </p>
        </Link>

        {/* Recent Activity (Spans 2 columns) */}
        <div className="md:col-span-2 glass-card p-6 rounded-3xl">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fas fa-history text-slate-400"></i> 최근 활동
          </h3>

          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-check"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 truncate">
                      {activity.scenario?.title || '알 수 없는 시나리오'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {activity.completedAt ? new Date(activity.completedAt).toLocaleDateString() : ''} 완료
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded-lg">
                    {SCENARIOS.find(s => s.id === activity.scenarioId)?.category === 'productivity' ? '생산성' : '커뮤니케이션'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p>아직 활동 내역이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
