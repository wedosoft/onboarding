import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
            <i className="fas fa-exclamation-triangle text-4xl text-amber-500"></i>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchModules}>
              다시 시도
            </Button>
          </CardContent>
        </Card>
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/curriculum')}
          >
            <i className="fas fa-arrow-left mr-2" />제품 선택으로 돌아가기
          </Button>
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6 flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <span className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <i className="fas fa-bullseye" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">총 모듈</p>
                  <p className="text-xl font-bold text-foreground">{modules.length}개</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <span className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <i className="fas fa-check" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">완료</p>
                  <p className="text-xl font-bold text-foreground">{completedCount}개</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">진행률</p>
                <p className="text-3xl font-semibold text-foreground">{Math.round(completionRate)}%</p>
              </div>
              <Progress value={completionRate} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">세션 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted border border-border p-4 text-sm text-muted-foreground break-all">
              <p className="font-mono text-xs">세션 ID</p>
              <p className="text-foreground font-medium">{displaySessionId || '세션을 확인할 수 없습니다'}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              세션은 자동 저장됩니다. 다른 기기에서도 동일 계정으로 계속 학습할 수 있어요.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {modules.map((mod, index) => {
          const style = getModuleStyle(mod.slug);
          const isCompleted = mod.status === 'completed';
          const isStarted = mod.status === 'learning';

          return (
            <Card
              key={mod.id}
              className="text-left group h-full p-0 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => handleModuleSelect(mod.id)}
            >
              <div className={`h-28 bg-gradient-to-br ${style.gradient} p-4 flex items-center justify-between relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/10 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-4">
                  <span className="w-10 h-10 rounded-lg bg-white/20 text-white font-semibold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <i className={`${style.icon} text-white text-2xl`}></i>
                </div>
                {isCompleted && (
                  <Badge className="relative z-10 bg-white/90 text-emerald-600 hover:bg-white/90">
                    <i className="fas fa-check-circle mr-1"></i> 완료
                  </Badge>
                )}
              </div>

              <CardContent className="p-5 flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground line-clamp-1">{mod.nameKo}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{mod.description}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <i className="far fa-clock"></i>
                    {mod.estimatedMinutes || 15}분 예상
                  </span>
                  <Badge
                    variant={isCompleted ? "default" : isStarted ? "secondary" : "outline"}
                    className={`${!isCompleted && !isStarted ? 'group-hover:bg-primary group-hover:text-primary-foreground' : ''}`}
                  >
                    {isCompleted ? '복습하기' : isStarted ? '이어하기' : '시작하기'}
                  </Badge>
                </div>
              </CardContent>

              {isStarted && !isCompleted && (
                <div className="h-1 bg-blue-100">
                  <div className="h-full bg-blue-500 w-1/3"></div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {modules.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">아직 등록된 학습 모듈이 없습니다. 관리자에게 문의해주세요.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CurriculumModulesPage;
