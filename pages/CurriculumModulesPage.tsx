import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCurriculumModules, getModuleProgress } from '../services/apiClient';
import { CurriculumModule, ModuleProgress } from '../types';

// 모듈 아이콘 매핑
const moduleIcons: Record<string, string> = {
  'ticket-management': 'fas fa-ticket-alt',
  'service-catalog': 'fas fa-book-open',
  'sla-management': 'fas fa-clock',
  'change-management': 'fas fa-random',
  'asset-management': 'fas fa-laptop',
  'problem-management': 'fas fa-bug',
  'release-management': 'fas fa-rocket',
  'project-management': 'fas fa-project-diagram',
};

interface ModuleWithProgress extends CurriculumModule {
  progress?: ModuleProgress;
}

export default function CurriculumModulesPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const sessionId = localStorage.getItem('onboarding_session_id') || '';

  const [modules, setModules] = useState<ModuleWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      setError(null);

      // 모듈 목록 조회
      const modulesData = await getCurriculumModules(productId || 'freshservice');
      
      // 각 모듈의 진행률 조회
      const modulesWithProgress = await Promise.all(
        modulesData.map(async (mod) => {
          try {
            const progress = await getModuleProgress(mod.id, sessionId);
            return { ...mod, progress };
          } catch {
            // 진행 기록이 없으면 undefined
            return { ...mod, progress: undefined };
          }
        })
      );

      setModules(modulesWithProgress);
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
    navigate(`/curriculum/modules/${moduleId}`);
  };

  const getProgressStatus = (progress?: ModuleProgress) => {
    if (!progress) return { status: 'not-started', label: '미시작', color: 'text-slate-400' };
    
    // 기초+심화 모두 통과
    if (progress.basicQuizPassed && progress.advancedQuizPassed) {
      return { status: 'completed', label: '완료', color: 'text-green-600' };
    }
    
    // 기초만 통과
    if (progress.basicQuizPassed && !progress.advancedQuizPassed) {
      return { status: 'advanced-pending', label: '심화 퀴즈 대기', color: 'text-blue-600' };
    }
    
    // 학습 완료, 퀴즈 대기
    if (progress.learningCompletedAt) {
      return { status: 'quiz-pending', label: '기초 퀴즈 대기', color: 'text-yellow-600' };
    }
    
    // 학습 중
    if (progress.learningStartedAt) {
      return { status: 'in-progress', label: '학습 중', color: 'text-yellow-600' };
    }
    
    return { status: 'not-started', label: '미시작', color: 'text-slate-400' };
  };

  const getCompletedCount = () => {
    return modules.filter(
      (m) => m.progress?.basicQuizPassed && m.progress?.advancedQuizPassed
    ).length;
  };

  const getQuizScore = (progress?: ModuleProgress): number | null => {
    if (!progress) return null;
    // 기초+심화 평균 점수
    const basic = progress.basicQuizScore;
    const advanced = progress.advancedQuizScore;
    if (basic !== undefined && advanced !== undefined) {
      return Math.round((basic + advanced) / 2);
    }
    if (basic !== undefined) return basic;
    if (advanced !== undefined) return advanced;
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p className="text-slate-600">{error}</p>
          <button
            onClick={fetchModules}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="text-slate-500 hover:text-slate-700"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <h1 className="text-2xl font-bold text-slate-800">
              Freshservice 핵심 기능 학습
            </h1>
          </div>
          <p className="text-slate-600">
            Freshservice의 핵심 기능을 단계별로 학습하고 퀴즈를 통해 이해도를 확인하세요.
          </p>
        </div>

        {/* 진행 현황 요약 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-1">
                <i className="fas fa-chart-line mr-2 text-blue-600"></i>
                학습 진행 현황
              </h2>
              <p className="text-sm text-slate-600">
                {getCompletedCount()}개 모듈 완료 / 총 {modules.length}개 모듈
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {modules.length > 0 ? Math.round((getCompletedCount() / modules.length) * 100) : 0}%
              </div>
              <div className="text-xs text-slate-500">전체 진행률</div>
            </div>
          </div>
          
          {/* 프로그레스 바 */}
          <div className="mt-4 h-2 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
              style={{
                width: `${modules.length > 0 ? (getCompletedCount() / modules.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* 모듈 목록 */}
        <div className="space-y-4">
          {modules.map((mod, index) => {
            const icon = moduleIcons[mod.slug] || 'fas fa-book';
            const progressInfo = getProgressStatus(mod.progress);
            const isCompleted = progressInfo.status === 'completed';
            const quizScore = getQuizScore(mod.progress);

            return (
              <button
                key={mod.id}
                onClick={() => handleModuleSelect(mod.id)}
                className={`w-full p-6 rounded-xl border transition-all duration-200 text-left group
                  ${isCompleted 
                    ? 'bg-green-50 border-green-200 hover:border-green-300' 
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  {/* 순서 표시 */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                      ${isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <i className="fas fa-check"></i>
                    ) : (
                      <span className="font-semibold">{index + 1}</span>
                    )}
                  </div>

                  {/* 모듈 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <i className={`${icon} text-slate-400 group-hover:text-blue-500 transition-colors`}></i>
                      <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {mod.nameKo}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {mod.description}
                    </p>

                    {/* 진행 상태 */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`font-medium ${progressInfo.color}`}>
                        <i className={`fas ${
                          progressInfo.status === 'completed' ? 'fa-check-circle' :
                          progressInfo.status === 'advanced-pending' ? 'fa-arrow-up' :
                          progressInfo.status === 'quiz-pending' ? 'fa-clipboard-list' :
                          progressInfo.status === 'in-progress' ? 'fa-spinner' :
                          'fa-circle'
                        } mr-1`}></i>
                        {progressInfo.label}
                      </span>
                      
                      {quizScore !== null && (
                        <span className="text-slate-500">
                          <i className="fas fa-star mr-1 text-yellow-500"></i>
                          퀴즈 점수: {quizScore}점
                        </span>
                      )}
                      
                      {mod.estimatedMinutes && (
                        <span className="text-slate-400">
                          <i className="far fa-clock mr-1"></i>
                          약 {mod.estimatedMinutes}분
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 화살표 */}
                  <div className="flex-shrink-0 self-center">
                    <i className={`fas fa-chevron-right transition-colors
                      ${isCompleted ? 'text-green-400' : 'text-slate-300 group-hover:text-blue-500'}
                    `}></i>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 학습 안내 */}
        <div className="mt-10 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold text-amber-800 mb-3">
            <i className="fas fa-lightbulb mr-2"></i>
            학습 안내
          </h3>
          <ul className="text-sm text-amber-700 space-y-2">
            <li className="flex items-start gap-2">
              <i className="fas fa-check mt-1"></i>
              <span>각 모듈은 <strong>학습 → 질문(선택) → 퀴즈</strong> 순서로 진행됩니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fas fa-check mt-1"></i>
              <span>학습 중 궁금한 내용은 우측 사이드바에서 AI 멘토에게 질문할 수 있습니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fas fa-check mt-1"></i>
              <span>퀴즈는 기초 10문제 + 심화 10문제로 구성되며, <strong>80점 이상</strong> 시 통과입니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fas fa-check mt-1"></i>
              <span>통과하지 못한 모듈은 언제든 다시 학습하고 재시험을 볼 수 있습니다.</span>
            </li>
          </ul>
        </div>

        {/* 빠른 팁 */}
        {getCompletedCount() === 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-800 mb-2">
              <i className="fas fa-play-circle mr-2"></i>
              처음이시네요!
            </h3>
            <p className="text-sm text-blue-700">
              <strong>티켓 관리</strong> 모듈부터 시작하는 것을 권장합니다. 
              Freshservice의 가장 핵심적인 기능으로, 이후 모듈 학습에 도움이 됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
