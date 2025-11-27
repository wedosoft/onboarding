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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          안녕하세요, {userName}님!
        </h2>
        <p className="text-sky-100">
          온보딩 나침반과 함께 성장하는 여정을 시작해보세요.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">전체 진행률</h3>
            <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-pie text-sky-600 dark:text-sky-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {completionPercent}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-sky-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {completedCount} / {totalCount} 시나리오 완료
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">빠른 시작</h3>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <i className="fas fa-play text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="space-y-2">
            <Link
              to="/scenarios"
              className="flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:underline"
            >
              <i className="fas fa-arrow-right text-sm" />
              시나리오 학습 계속하기
            </Link>
            <Link
              to="/knowledge"
              className="flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:underline"
            >
              <i className="fas fa-arrow-right text-sm" />
              AI 멘토에게 질문하기
            </Link>
            <Link
              to="/documents"
              className="flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:underline"
            >
              <i className="fas fa-arrow-right text-sm" />
              인수인계 문서 보기
            </Link>
          </div>
        </div>

        {/* Mentor Chat */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">AI 멘토</h3>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <i className="fas fa-robot text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
            업무 관련 질문이나 고민이 있으신가요? AI 멘토가 도와드릴게요.
          </p>
          <Link
            to="/knowledge"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <i className="fas fa-comments" />
            대화 시작하기
          </Link>
        </div>
      </div>

      {/* Category Progress */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">
          카테고리별 학습 현황
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryProgress.map(cat => (
            <div
              key={cat.id}
              className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <i className={`${cat.icon} text-sky-600 dark:text-sky-400`} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 dark:text-slate-200">{cat.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{cat.description}</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                <div
                  className="bg-sky-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${cat.percent}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  {cat.completed} / {cat.total} 완료
                </span>
                <span className="font-medium text-sky-600 dark:text-sky-400">
                  {cat.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">
          최근 학습 활동
        </h3>
        {progress?.completedScenarios && progress.completedScenarios.length > 0 ? (
          <div className="space-y-3">
            {progress.completedScenarios.slice(-5).reverse().map((item, idx) => {
              const scenario = SCENARIOS.find(s => s.id === item.scenarioId);
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <i className="fas fa-check text-green-600 dark:text-green-400 text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {scenario?.title || item.scenarioId}
                    </p>
                    {item.completedAt && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(item.completedAt).toLocaleDateString('ko-KR')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <i className="fas fa-inbox text-3xl mb-2" />
            <p>아직 학습 기록이 없습니다.</p>
            <Link
              to="/scenarios"
              className="text-sky-600 dark:text-sky-400 hover:underline text-sm"
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
