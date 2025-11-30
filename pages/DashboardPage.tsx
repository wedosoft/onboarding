import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES, SCENARIOS } from '../constants';
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
        // 세션 ID가 있으면 진행도 로드
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

  // 카테고리별 진행률 계산
  const categoryProgress = CATEGORIES.map(cat => {
    const categoryScenarios = SCENARIOS.filter(s => s.category === cat.id);
    const completedIds = new Set(progress?.completedScenarios?.map(c => c.scenarioId) || []);
    const completed = categoryScenarios.filter(s => completedIds.has(s.id)).length;
    return {
      ...cat,
      completed,
      total: categoryScenarios.length,
      percent: Math.round((completed / categoryScenarios.length) * 100),
    };
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Card - Nano Banana Style */}
      <div className="relative overflow-hidden rounded-3xl p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-banana-400 to-banana-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 text-dark-900">
            안녕하세요, {userName}님! 🍌
          </h2>
          <p className="text-dark-800 font-medium text-lg">
            온보딩 나침반과 함께 성장하는 여정을 시작해보세요.
          </p>
        </div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Progress */}
        <div className="glass-card rounded-2xl p-6 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-banana-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-banana-500/20"></div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-200 text-lg">전체 진행률</h3>
            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center border border-banana-500/30">
              <i className="fas fa-chart-pie text-banana-400 text-xl" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-4">
            {completionPercent}%
          </div>
          <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-banana-400 to-banana-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,192,0,0.5)]"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <p className="text-sm text-slate-400 mt-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-banana-500"></span>
            {completedCount} / {totalCount} 시나리오 완료
          </p>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-2xl p-6 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-green-500/20"></div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-200 text-lg">빠른 시작</h3>
            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center border border-green-500/30">
              <i className="fas fa-play text-green-400 text-xl" />
            </div>
          </div>
          <div className="space-y-3">
            <Link
              to="/scenarios"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group/link border border-transparent hover:border-white/10"
            >
              <span className="text-slate-300 group-hover/link:text-banana-300 transition-colors">시나리오 학습 계속하기</span>
              <i className="fas fa-arrow-right text-slate-500 group-hover/link:text-banana-400 transition-colors" />
            </Link>
            <Link
              to="/knowledge"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group/link border border-transparent hover:border-white/10"
            >
              <span className="text-slate-300 group-hover/link:text-banana-300 transition-colors">AI 멘토에게 질문하기</span>
              <i className="fas fa-arrow-right text-slate-500 group-hover/link:text-banana-400 transition-colors" />
            </Link>
            <Link
              to="/documents"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group/link border border-transparent hover:border-white/10"
            >
              <span className="text-slate-300 group-hover/link:text-banana-300 transition-colors">인수인계 문서 보기</span>
              <i className="fas fa-arrow-right text-slate-500 group-hover/link:text-banana-400 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Mentor Chat */}
        <div className="glass-card rounded-2xl p-6 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-purple-500/20"></div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-200 text-lg">AI 멘토</h3>
            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center border border-purple-500/30">
              <i className="fas fa-robot text-purple-400 text-xl" />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            업무 관련 질문이나 고민이 있으신가요?<br />
            AI 멘토가 실시간으로 도와드릴게요.
          </p>
          <Link
            to="/knowledge"
            className="inline-flex w-full items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-3 rounded-xl transition-all shadow-lg hover:shadow-purple-500/25 font-medium"
          >
            <i className="fas fa-comments" />
            대화 시작하기
          </Link>
        </div>
      </div>

      {/* Category Progress */}
      <div className="glass-card rounded-2xl p-8">
        <h3 className="font-bold text-xl text-slate-200 mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-banana-500 rounded-full"></span>
          카테고리별 학습 현황
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryProgress.map(cat => (
            <div
              key={cat.id}
              className="bg-dark-800/50 border border-white/5 rounded-xl p-5 hover:border-banana-500/30 transition-colors group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-dark-700 rounded-xl flex items-center justify-center group-hover:bg-banana-500/10 transition-colors">
                  <i className={`${cat.icon} text-slate-400 group-hover:text-banana-400 text-xl transition-colors`} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-200 group-hover:text-banana-200 transition-colors">{cat.name}</h4>
                  <p className="text-xs text-slate-500">{cat.description}</p>
                </div>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2 mb-3">
                <div
                  className="bg-banana-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_5px_rgba(255,192,0,0.3)]"
                  style={{ width: `${cat.percent}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  {cat.completed} / {cat.total} 완료
                </span>
                <span className="font-bold text-banana-400">
                  {cat.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-2xl p-8">
        <h3 className="font-bold text-xl text-slate-200 mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-banana-500 rounded-full"></span>
          최근 학습 활동
        </h3>
        {progress?.completedScenarios && progress.completedScenarios.length > 0 ? (
          <div className="space-y-3">
            {progress.completedScenarios.slice(-5).reverse().map((item, idx) => {
              const scenario = SCENARIOS.find(s => s.id === item.scenarioId);
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-dark-800/30 border border-white/5 rounded-xl hover:bg-dark-800/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                    <i className="fas fa-check text-green-400 text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-medium text-slate-200">
                      {scenario?.title || item.scenarioId}
                    </p>
                    {item.completedAt && (
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(item.completedAt).toLocaleDateString('ko-KR')}
                      </p>
                    )}
                  </div>
                  <div className="text-banana-400 text-sm font-medium px-3 py-1 bg-banana-500/10 rounded-full border border-banana-500/20">
                    완료됨
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
              <i className="fas fa-inbox text-2xl text-slate-600" />
            </div>
            <p className="mb-4">아직 학습 기록이 없습니다.</p>
            <Link
              to="/scenarios"
              className="text-banana-400 hover:text-banana-300 hover:underline text-sm font-medium"
            >
              첫 번째 시나리오 시작하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
