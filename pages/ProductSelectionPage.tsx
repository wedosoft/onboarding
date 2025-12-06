import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/apiClient';
import type { Product } from '../types';

// 제품별 아이콘 및 스타일 매핑
const PRODUCT_STYLES: Record<string, { icon: string; gradient: string; accent: string }> = {
  freshservice: {
    icon: 'fas fa-cog',
    gradient: 'from-blue-500 to-indigo-600',
    accent: 'bg-blue-500',
  },
  freshdesk: {
    icon: 'fas fa-headset',
    gradient: 'from-emerald-400 to-teal-600',
    accent: 'bg-emerald-500',
  },
  freshdesk_omni: {
    icon: 'fas fa-layer-group',
    gradient: 'from-cyan-400 to-blue-600',
    accent: 'bg-cyan-500',
  },
  freshsales: {
    icon: 'fas fa-chart-line',
    gradient: 'from-violet-500 to-purple-600',
    accent: 'bg-violet-500',
  },
  freshchat: {
    icon: 'fas fa-comments',
    gradient: 'from-orange-400 to-pink-500',
    accent: 'bg-orange-500',
  },
};

// 제품별 설명 보강
const PRODUCT_DESCRIPTIONS: Record<string, { tagline: string; features: string[] }> = {
  freshservice: {
    tagline: 'IT 서비스 관리의 시작',
    features: ['티켓 관리', 'IT 자산', '서비스 카탈로그', '워크플로우'],
  },
  freshdesk: {
    tagline: '고객 지원의 핵심',
    features: ['티켓 시스템', '지식 베이스', '자동화', '리포팅'],
  },
  freshdesk_omni: {
    tagline: '통합 고객 경험',
    features: ['통합 인박스', '채널 전환', '고객 360', '옴니채널 라우팅'],
  },
  freshsales: {
    tagline: 'CRM과 영업 자동화',
    features: ['파이프라인', '리드 스코어링', '이메일 추적', '영업 자동화'],
  },
  freshchat: {
    tagline: '실시간 고객 소통',
    features: ['채팅 위젯', '챗봇', '메시징 채널', '캠페인'],
  },
};

interface ProductWithType extends Product {
  product_type?: 'standalone' | 'bundle';
  display_order?: number;
}

export default function ProductSelectionPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductWithType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        const productList = await getProducts();
        setProducts(productList as ProductWithType[]);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('제품 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  const handleProductSelect = (productId: string) => {
    navigate(`/curriculum/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium animate-pulse">제품 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass-card p-8 max-w-md mx-auto">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">오류 발생</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition shadow-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const bundles = products.filter(p => p.product_type === 'bundle');
  const standalones = products.filter(p => p.product_type !== 'bundle');

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="text-center space-y-4 pt-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight">
          학습할 제품을 선택하세요
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Freshworks의 다양한 제품군 중 학습하고 싶은 과정을 선택해주세요.<br />
          AI 멘토가 여러분의 맞춤형 학습을 도와드립니다.
        </p>
      </div>

      {/* Bundles Section */}
      {bundles.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200"></span>
            <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold tracking-wider rounded-full uppercase">
              Integrated Solution
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200"></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bundles.map((product) => {
              const style = PRODUCT_STYLES[product.id] || PRODUCT_STYLES.freshdesk_omni;
              const info = PRODUCT_DESCRIPTIONS[product.id];

              return (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product.id)}
                  className="group relative text-left h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                  <div className="relative h-full glass-card p-8 rounded-3xl border border-white/50 hover:border-white transition-all duration-300 group-hover:-translate-y-1 overflow-hidden">
                    {/* Background decoration */}
                    <div className={`absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br ${style.gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`}></div>

                    <div className="flex items-start gap-6 relative z-10">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white text-3xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300`}>
                        <i className={style.icon}></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-slate-900">{product.name}</h2>
                          <span className="px-2 py-0.5 bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 text-[10px] font-bold rounded uppercase tracking-wide">
                            Premium
                          </span>
                        </div>
                        <p className="text-slate-500 font-medium mb-4">{info?.tagline || product.description_ko}</p>

                        <div className="flex flex-wrap gap-2">
                          {info?.features?.map((feature, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="self-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        <i className="fas fa-arrow-right text-slate-400 text-xl"></i>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Standalones Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200"></span>
          <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold tracking-wider rounded-full uppercase">
            Individual Products
          </span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200"></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {standalones.map((product) => {
            const style = PRODUCT_STYLES[product.id] || PRODUCT_STYLES.freshservice;
            const info = PRODUCT_DESCRIPTIONS[product.id];

            return (
              <button
                key={product.id}
                onClick={() => handleProductSelect(product.id)}
                className="group relative text-left h-full"
              >
                <div className="absolute inset-0 bg-white rounded-3xl transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 border border-slate-200 hover:border-primary-200">
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white text-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        <i className={style.icon}></i>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
                        <i className="fas fa-arrow-right text-sm"></i>
                      </div>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h2>
                    <p className="text-sm text-slate-500 mb-4 flex-1 line-clamp-2">
                      {info?.tagline || product.description_ko}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {info?.features?.slice(0, 3).map((feature, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-medium rounded border border-slate-100">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
