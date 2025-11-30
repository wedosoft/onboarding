import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES, SCENARIOS } from '../constants';
import { getProgress, getProducts, Product } from '../services/apiClient';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userName = user?.name || user?.email?.split('@')[0] || '신입사원';

  useEffect(() => {
    const loadData = async () => {
      try {
        // 제품 목록 로드
        const productsData = await getProducts();
        setProducts(productsData);

        // 세션 ID가 있으면 진행도 로드 (에러 시 무시)
        const sessionId = localStorage.getItem('onboarding_session_id');
        if (sessionId) {
          try {
            const data = await getProgress(sessionId);
            setProgress(data);
          } catch {
            // 진행도 로드 실패 시 무시 (새 세션이거나 형식 불일치)
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const completedCount = progress?.completedScenarios?.length || 0;
  const totalCount = SCENARIOS.length;
  const completionPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 text-white">
            안녕하세요, {userName}님!
          </h2>
          <p className="text-blue-100 font-medium text-lg">
            온보딩 나침반과 함께 Freshworks 제품을 마스터해보세요.
          </p>
        </div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>

      {/* Product Learning Section - Primary Focus */}
      <div className="bg-card rounded-2xl p-8 border border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full"></span>
            제품 학습
          </h3>
          <Link
            to="/products"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            전체 보기 <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        <p className="text-muted-foreground mb-6">
          Freshworks 제품군에 대한 체계적인 학습을 시작하세요. 각 제품별 4단계 커리큘럼과 퀴즈를 통해 전문가가 되어보세요.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              to="/products"
              className="p-5 rounded-xl bg-muted/50 border border-border hover:border-primary/30 transition-all group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ backgroundColor: `${product.color}20`, color: product.color }}
              >
                <i className={product.icon}></i>
              </div>
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                {product.name}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <i className="fas fa-layer-group"></i>
                <span>4단계 커리큘럼</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Work Sense Progress */}
        <div className="bg-card rounded-2xl p-6 relative group overflow-hidden border border-border">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-primary/20"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">업무 센스</h3>
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center border border-primary/30">
              <i className="fas fa-lightbulb text-primary" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">
            {completionPercent}%
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-3">
            <div
              className="bg-gradient-to-r from-primary to-blue-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {completedCount} / {totalCount} 시나리오
          </p>
          <Link
            to="/scenarios"
            className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
          >
            학습 계속하기 <i className="fas fa-arrow-right"></i>
          </Link>
        </div>

        {/* Mentor Chat */}
        <div className="bg-card rounded-2xl p-6 relative group overflow-hidden border border-border">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-purple-500/20"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">멘토 채팅</h3>
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center border border-purple-500/30">
              <i className="fas fa-comments text-purple-400" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            제품이나 업무에 대해 궁금한 점이 있으신가요?
          </p>
          <Link
            to="/knowledge"
            className="inline-flex w-full items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl transition-all font-medium text-sm"
          >
            <i className="fas fa-comments" />
            대화 시작하기
          </Link>
        </div>

        {/* Knowledge Base */}
        <div className="bg-card rounded-2xl p-6 relative group overflow-hidden border border-border">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-green-500/20"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">지식 베이스</h3>
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center border border-green-500/30">
              <i className="fas fa-book text-green-400" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            인수인계 문서와 회사 정보를 확인하세요.
          </p>
          <Link
            to="/documents"
            className="inline-flex w-full items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2.5 rounded-xl transition-all font-medium text-sm border border-border"
          >
            <i className="fas fa-folder-open" />
            문서 보기
          </Link>
        </div>
      </div>

      {/* Scenario Category Progress */}
      <div className="bg-card rounded-2xl p-8 border border-border">
        <h3 className="font-bold text-xl text-foreground mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full"></span>
          업무 센스 카테고리
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map(cat => {
            const categoryScenarios = SCENARIOS.filter(s => s.category === cat.id);
            const completedIds = new Set(progress?.completedScenarios?.map(c => c.scenarioId) || []);
            const completed = categoryScenarios.filter(s => completedIds.has(s.id)).length;
            const percent = Math.round((completed / categoryScenarios.length) * 100);

            return (
              <div
                key={cat.id}
                className="bg-muted/50 border border-border rounded-xl p-5 hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <i className={`${cat.icon} text-muted-foreground group-hover:text-primary text-xl transition-colors`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">{cat.name}</h4>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-3">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {completed} / {categoryScenarios.length} 완료
                  </span>
                  <span className="font-bold text-primary">
                    {percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning Tips */}
      <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="fas fa-lightbulb text-primary text-xl"></i>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">학습 팁</h4>
            <p className="text-muted-foreground text-sm">
              <strong>제품 학습</strong>을 먼저 완료하면 실무에서 고객 대응이 훨씬 수월해집니다.
              각 제품의 핵심 기능을 파악한 후 <strong>업무 센스</strong> 시나리오를 통해 실전 감각을 익혀보세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
