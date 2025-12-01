import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAssessmentLevels, AssessmentLevel } from '../services/apiClient';

const LEVEL_ICONS: Record<number, string> = {
  1: 'fas fa-chart-pie',
  2: 'fas fa-lightbulb',
  3: 'fas fa-cogs',
  4: 'fas fa-puzzle-piece',
};

const ProductKnowledgeLevelsPage: React.FC = () => {
  const navigate = useNavigate();
  const { trackId } = useParams<{ trackId: string }>();
  const [levels, setLevels] = useState<AssessmentLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = localStorage.getItem('onboarding_session_id') || '';

  useEffect(() => {
    const loadLevels = async () => {
      if (!trackId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await getAssessmentLevels(trackId, sessionId);
        setLevels(data);
      } catch (err) {
        console.error('Failed to load levels:', err);
        setError('레벨 정보를 불러오는데 실패했습니다.');
        // 기본 레벨 데이터 사용 (API 미구현 시)
        setLevels([
          {
            id: '1',
            trackId: trackId,
            order: 1,
            name: '시장 포지셔닝',
            description: '제품이 시장에서 어떤 위치를 차지하고 있는지, 경쟁사와 어떻게 차별화되는지 학습합니다.',
            passingScore: 80,
            isUnlocked: true,
            isCompleted: false,
          },
          {
            id: '2',
            trackId: trackId,
            order: 2,
            name: '설계 철학',
            description: '제품이 왜 이렇게 만들어졌는지, 어떤 원칙과 가치를 기반으로 설계되었는지 이해합니다.',
            passingScore: 80,
            isUnlocked: false,
            isCompleted: false,
          },
          {
            id: '3',
            trackId: trackId,
            order: 3,
            name: '핵심 기능',
            description: '제품의 주요 기능과 사용 방법을 깊이 있게 학습합니다.',
            passingScore: 80,
            isUnlocked: false,
            isCompleted: false,
          },
          {
            id: '4',
            trackId: trackId,
            order: 4,
            name: '세부 기능',
            description: '고급 기능과 세부 설정, 활용 팁을 익힙니다.',
            passingScore: 80,
            isUnlocked: false,
            isCompleted: false,
          },
        ]);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadLevels();
  }, [trackId, sessionId]);

  const handleLevelSelect = (level: AssessmentLevel) => {
    if (!level.isUnlocked) {
      return;
    }
    navigate(`/assessment/${trackId}/level/${level.id}`);
  };

  const completedCount = levels.filter(l => l.isCompleted).length;
  const progressPercent = levels.length > 0 ? Math.round((completedCount / levels.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500">레벨 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/assessment')}
          className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors mb-4"
        >
          <i className="fas fa-arrow-left" />
          <span>평가 목록</span>
        </button>
        <h1 className="text-2xl font-bold text-slate-700 mb-2">제품 지식</h1>
        <p className="text-slate-500">
          단계별로 제품에 대한 체계적인 지식을 쌓아가세요.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-600 text-sm flex items-center gap-2">
            <i className="fas fa-exclamation-triangle" />
            {error} (기본 데이터를 표시합니다)
          </p>
        </div>
      )}

      {/* Overall Progress */}
      <div className="glass-card rounded-xl p-6 mb-8 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-700">전체 진행률</h2>
          <span className="text-2xl font-bold text-primary-500">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className="bg-primary-500 h-3 rounded-full transition-all shadow-[0_0_10px_rgba(90,142,192,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-sm text-slate-500 mt-2">
          {completedCount} / {levels.length} 레벨 완료
        </p>
      </div>

      {/* Level Cards */}
      <div className="space-y-4">
        {levels.map((level, index) => (
          <div
            key={level.id}
            onClick={() => handleLevelSelect(level)}
            className={`glass-card rounded-xl p-6 border transition-all ${
              level.isUnlocked
                ? 'border-slate-200 hover:border-primary-500/30 hover:shadow-lg cursor-pointer group'
                : 'border-slate-200 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-6">
              {/* Level Number */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                level.isCompleted
                  ? 'bg-green-500/10 border border-green-500/30'
                  : level.isUnlocked
                  ? 'bg-primary-500/10 border border-primary-500/30 group-hover:bg-primary-500/20'
                  : 'bg-slate-100 border border-slate-200'
              }`}>
                {level.isCompleted ? (
                  <i className="fas fa-check text-2xl text-green-500" />
                ) : level.isUnlocked ? (
                  <span className="text-2xl font-bold text-primary-500">{level.order}</span>
                ) : (
                  <i className="fas fa-lock text-xl text-slate-400" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <i className={`${LEVEL_ICONS[level.order] || 'fas fa-book'} ${level.isUnlocked ? 'text-primary-500' : 'text-slate-400'}`} />
                  <h3 className={`text-lg font-semibold ${
                    level.isUnlocked ? 'text-slate-700 group-hover:text-primary-600' : 'text-slate-500'
                  }`}>
                    {level.name}
                  </h3>
                  {level.isCompleted && level.score !== undefined && (
                    <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-600 rounded-full border border-green-500/30">
                      {level.score}%
                    </span>
                  )}
                </div>
                <p className={`text-sm ${level.isUnlocked ? 'text-slate-500' : 'text-slate-400'}`}>
                  {level.description}
                </p>
              </div>

              {/* Arrow */}
              {level.isUnlocked && (
                <div className="text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                  <i className="fas fa-chevron-right text-xl" />
                </div>
              )}
            </div>

            {/* Unlock hint */}
            {!level.isUnlocked && index > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <i className="fas fa-info-circle" />
                  이전 레벨을 {level.passingScore}% 이상 완료하면 잠금 해제됩니다.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="mt-8 p-6 glass rounded-xl border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-600 mb-3">학습 방법</h3>
        <ul className="space-y-2 text-sm text-slate-500">
          <li className="flex items-start gap-2">
            <i className="fas fa-book-open text-primary-500 mt-0.5" />
            <span>각 레벨은 <strong>AI가 생성한 맞춤형 학습 콘텐츠</strong>로 시작합니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="fas fa-comments text-primary-500 mt-0.5" />
            <span><strong>AI 멘토</strong>에게 궁금한 점을 자유롭게 질문할 수 있습니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="fas fa-clipboard-check text-primary-500 mt-0.5" />
            <span><strong>퀴즈</strong>로 학습 내용을 점검합니다. 80% 이상 정답 시 다음 레벨이 열립니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="fas fa-redo text-primary-500 mt-0.5" />
            <span>통과하지 못해도 <strong>다시 학습하고 재도전</strong>할 수 있습니다.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProductKnowledgeLevelsPage;
