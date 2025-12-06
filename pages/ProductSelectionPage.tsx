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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          고복수 팀장의 온보딩 가이드
        </h1>
        <p className="text-sm text-gray-600">
          학습하고 싶은 제품을 선택해주세요
        </p>
      </div>

      {/* Bundles Section */}
      {bundles.length > 0 && (
        <div className="space-y-4">
          <div className="max-w-4xl mx-auto">
            {bundles.map((product) => {
              const style = PRODUCT_STYLES[product.id] || PRODUCT_STYLES.freshdesk_omni;
              const info = PRODUCT_DESCRIPTIONS[product.id];

              return (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product.id)}
                  className="group relative text-left bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white text-xl`}>
                      <i className={style.icon}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-bold text-gray-900">{product.name}</h2>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wide">
                          BUNDLE
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{info?.tagline || product.description_ko}</p>
                      <div className="flex flex-wrap gap-2">
                        {info?.features?.map((feature, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-200">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="self-center text-gray-400 group-hover:text-blue-600 transition-colors">
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Standalones Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-2">개별 제품</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {standalones.map((product) => {
            const style = PRODUCT_STYLES[product.id] || PRODUCT_STYLES.freshservice;
            const info = PRODUCT_DESCRIPTIONS[product.id];

            return (
              <button
                key={product.id}
                onClick={() => handleProductSelect(product.id)}
                className="group text-left bg-white p-5 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all h-full flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white text-lg`}>
                    <i className={style.icon}></i>
                  </div>
                  <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                    <i className="fas fa-arrow-right text-sm"></i>
                  </div>
                </div>
                <h2 className="text-base font-bold text-gray-900 mb-1">
                  {product.name}
                </h2>
                <p className="text-sm text-gray-600 mb-4 flex-1">
                  {info?.tagline || product.description_ko}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {info?.features?.slice(0, 3).map((feature, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-200">
                      {feature}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
