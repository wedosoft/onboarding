import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssessmentTracks, AssessmentTrack } from '../services/apiClient';

const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<AssessmentTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const data = await getAssessmentTracks();
        setTracks(data);
      } catch (err) {
        console.error('Failed to fetch tracks:', err);
        setError('트랙 정보를 불러오는데 실패했습니다.');
        // 기본 트랙 데이터 사용 (API 미구현 시)
        setTracks([
          {
            id: 'work_sense',
            name: '업무 센스 체크',
            description: '고객 응대, 업무 우선순위, 팀 협업 등 기본적인 업무 역량을 평가합니다.',
            icon: 'fas fa-lightbulb',
            type: 'work_sense',
          },
          {
            id: 'product_knowledge',
            name: '제품 지식',
            description: '시장 포지셔닝부터 세부 기능까지, 제품에 대한 체계적인 학습과 평가를 진행합니다.',
            icon: 'fas fa-graduation-cap',
            type: 'product_knowledge',
            totalLevels: 4,
          },
        ]);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  const handleTrackSelect = (track: AssessmentTrack) => {
    if (track.type === 'product_knowledge') {
      navigate(`/assessment/${track.id}/levels`);
    } else {
      navigate(`/assessment/${track.id}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-700 mb-2">
          학습 평가
        </h1>
        <p className="text-slate-500">
          온보딩 과정에서 배운 내용을 점검하고, 업무에 필요한 역량을 평가합니다.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Product Learning Card - New Feature */}
      <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:border-blue-400 transition-all cursor-pointer group"
        onClick={() => navigate('/assessment/products')}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center">
            <i className="fas fa-book-open text-2xl text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                제품별 지식 학습
              </h2>
              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">NEW</span>
            </div>
            <p className="text-sm text-slate-500">
              Freshservice, Freshdesk, Freshsales, Freshchat 제품별 기능과 사용법을 AI 멘토와 함께 학습합니다.
            </p>
          </div>
          <span className="text-blue-500 text-sm font-medium group-hover:translate-x-1 transition-transform">
            시작하기 <i className="fas fa-arrow-right ml-1" />
          </span>
        </div>
      </div>

      {/* Track Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {tracks.map((track) => (
          <div
            key={track.id}
            onClick={() => handleTrackSelect(track)}
            className="glass-card rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-lg hover:border-primary-500/30 transition-all group"
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-primary-500/10 transition-colors">
              <i className={`${track.icon} text-2xl text-slate-500 group-hover:text-primary-500 transition-colors`} />
            </div>

            {/* Content */}
            <h2 className="text-lg font-semibold text-slate-700 group-hover:text-primary-600 transition-colors mb-2">
              {track.name}
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              {track.description}
            </p>

            {/* Meta */}
            <div className="flex items-center justify-between">
              {track.type === 'product_knowledge' && track.totalLevels && (
                <span className="text-xs text-slate-500">
                  {track.totalLevels}개 레벨
                </span>
              )}
              {track.type === 'work_sense' && (
                <span className="text-xs text-slate-500">
                  시나리오 기반 평가
                </span>
              )}
              <span className="text-primary-500 text-sm font-medium group-hover:translate-x-1 transition-transform">
                시작하기 <i className="fas fa-arrow-right ml-1" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-8 p-6 glass rounded-xl border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-600 mb-3">
          학습 평가 안내
        </h3>
        <ul className="space-y-2 text-sm text-slate-500">
          <li className="flex items-start gap-2">
            <i className="fas fa-check-circle text-green-500 mt-0.5" />
            <span><strong>업무 센스 체크</strong>: 실제 업무 상황을 시뮬레이션한 시나리오 기반 문제로 업무 판단력을 평가합니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="fas fa-check-circle text-green-500 mt-0.5" />
            <span><strong>제품 지식</strong>: 시장 포지셔닝 → 설계 철학 → 핵심 기능 → 세부 기능 순으로 체계적으로 학습합니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="fas fa-check-circle text-green-500 mt-0.5" />
            <span>각 레벨은 학습 콘텐츠 + AI 멘토 채팅 + 퀴즈로 구성되어 있습니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="fas fa-check-circle text-green-500 mt-0.5" />
            <span>80% 이상 정답 시 다음 레벨이 언락됩니다.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AssessmentPage;
