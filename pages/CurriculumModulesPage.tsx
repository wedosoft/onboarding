import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  BookOpen, Bot, Database, FileText, Globe, Layout, 
  Server, Settings, Ticket, CheckCircle, Clock, 
  PlayCircle, RotateCcw, ArrowRight, Sparkles, Trophy,
  GraduationCap, BarChart3, AlertTriangle, LogOut
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/layout/PageHeader';
import { getProgressSummary, getProducts } from '../services/apiClient';
import { CurriculumModule, ProgressSummary } from '../types';
import { useAuth } from '../contexts/AuthContext';

// 모듈 아이콘 및 그라데이션 매핑
const MODULE_STYLES: Record<string, { icon: React.ElementType; gradient: string; color: string }> = {
  'ticket-basics': { icon: Ticket, gradient: 'from-blue-500 to-indigo-600', color: 'text-blue-500' },
  'service-catalog': { icon: BookOpen, gradient: 'from-purple-500 to-fuchsia-600', color: 'text-purple-500' },
  'automation': { icon: Bot, gradient: 'from-amber-500 to-orange-600', color: 'text-amber-500' },
  'asset-management': { icon: Server, gradient: 'from-slate-600 to-slate-800', color: 'text-slate-600' },
  'reporting': { icon: BarChart3, gradient: 'from-emerald-500 to-teal-600', color: 'text-emerald-500' },
  'omnichannel': { icon: Globe, gradient: 'from-cyan-500 to-blue-600', color: 'text-cyan-500' },
  'knowledge-base': { icon: Database, gradient: 'from-pink-500 to-rose-600', color: 'text-pink-500' },
  'chatbot': { icon: Bot, gradient: 'from-violet-500 to-purple-600', color: 'text-violet-500' },
  default: { icon: Layout, gradient: 'from-slate-500 to-slate-700', color: 'text-slate-500' },
};

const getModuleStyle = (slug: string) => MODULE_STYLES[slug] || MODULE_STYLES.default;

const CurriculumModulesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams<{ productId: string }>();
  const { signOut, sessionId, isSessionReady } = useAuth();

  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [productName, setProductName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    // 세션이 준비되지 않았으면 로딩 상태만 유지하고 대기
    if (!isSessionReady) {
      setIsLoading(true);
      setError(null);
      return;
    }

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
      const [summary, products] = await Promise.all([
        getProgressSummary(sessionId, productId),
        getProducts()
      ]);
      
      setProgressSummary(summary);
      
      const product = products.find(p => p.id === productId);
      if (product) {
        setProductName(product.name);
      }
    } catch (err) {
      console.error('Failed to load curriculum modules:', err);
      setError(err instanceof Error ? err.message : '모듈 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [productId, sessionId, isSessionReady]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // 모듈 학습/자가점검 완료 후 목록으로 돌아올 때 즉시 진행률 새로고침
  useEffect(() => {
    const refresh = (location.state as { refresh?: number } | null)?.refresh;
    if (!refresh) return;
    fetchModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

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
        <Card className="max-w-md border-destructive/50 shadow-lg">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">오류가 발생했습니다</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={fetchModules} variant="default">
                다시 시도
              </Button>
              <Button 
                variant="outline" 
                onClick={async () => {
                  await signOut();
                  localStorage.removeItem('onboarding_session_id');
                  navigate('/');
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* 통합 페이지 헤더 */}
      <PageHeader
        title={productName ? `${productName} 커리큘럼` : '학습 커리큘럼'}
        description="단계별로 구성된 학습 모듈을 통해 전문가로 성장하세요."
        icon={<GraduationCap className="w-6 h-6" />}
        breadcrumbs={[
          { label: '커리큘럼', href: '/curriculum' },
          { label: productName || '제품' }
        ]}
        actions={
          <Badge variant="outline" className="text-sm px-3 py-1">
            <Trophy className="w-4 h-4 mr-1.5 text-primary" />
            {Math.round(completionRate)}% 완료
          </Badge>
        }
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">전체 진행률</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-foreground">{Math.round(completionRate)}%</h3>
                <span className="text-xs text-muted-foreground">달성</span>
              </div>
            </div>
            <div className="ml-auto w-24">
              <Progress value={completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">완료한 모듈</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-foreground">{completedCount}</h3>
                <span className="text-xs text-muted-foreground">/ {modules.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">학습 예정</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-foreground">{modules.length - completedCount}</h3>
                <span className="text-xs text-muted-foreground">모듈</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {modules.map((mod, index) => {
          const style = getModuleStyle(mod.slug);
          const Icon = style.icon;
          const isCompleted = mod.status === 'completed';
          const isStarted = mod.status === 'learning';

          return (
            <Card
              key={mod.id}
              className={`group relative overflow-hidden cursor-pointer border-border/50 hover:border-primary/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card h-full`}
              onClick={() => handleModuleSelect(mod.id)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
              
              <CardContent className="p-6 flex flex-col h-full relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white shadow-md group-hover:shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs font-mono text-muted-foreground/50">#{String(index + 1).padStart(2, '0')}</span>
                    {isCompleted && (
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
                        <CheckCircle className="w-3 h-3 mr-1" /> 완료
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mb-4 flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {mod.nameKo}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {mod.estimatedMinutes || 15}분
                  </span>
                  
                  <div className={`text-sm font-medium flex items-center transition-colors ${
                    isCompleted ? 'text-emerald-500' : 
                    isStarted ? 'text-primary' : 
                    'text-muted-foreground group-hover:text-primary'
                  }`}>
                    {isCompleted ? '복습하기' : isStarted ? '이어하기' : '시작하기'}
                    <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {modules.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Layout className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">등록된 모듈이 없습니다</h3>
            <p className="text-muted-foreground">관리자에게 문의해주세요.</p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
};

export default CurriculumModulesPage;
