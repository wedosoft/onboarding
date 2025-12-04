import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/apiClient';
import type { Product } from '../types';

// 제품별 아이콘 매핑 (Font Awesome)
const PRODUCT_ICONS: Record<string, string> = {
  freshservice: 'fas fa-cog',
  freshdesk: 'fas fa-headset',
  freshdesk_omni: 'fas fa-layer-group',
  freshsales: 'fas fa-chart-line',
  freshchat: 'fas fa-comments',
};

// 제품별 색상 매핑
const PRODUCT_COLORS: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  freshservice: {
    bg: 'bg-blue-50',
    border: 'border-blue-200 hover:border-blue-400',
    text: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
  },
  freshdesk: {
    bg: 'bg-green-50',
    border: 'border-green-200 hover:border-green-400',
    text: 'text-green-600',
    gradient: 'from-green-500 to-green-600',
  },
  freshdesk_omni: {
    bg: 'bg-teal-50',
    border: 'border-teal-200 hover:border-teal-400',
    text: 'text-teal-600',
    gradient: 'from-teal-500 to-cyan-600',
  },
  freshsales: {
    bg: 'bg-purple-50',
    border: 'border-purple-200 hover:border-purple-400',
    text: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-600',
  },
  freshchat: {
    bg: 'bg-orange-50',
    border: 'border-orange-200 hover:border-orange-400',
    text: 'text-orange-600',
    gradient: 'from-orange-500 to-orange-600',
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
    // 커리큘럼 모듈 페이지로 이동
    navigate(`/curriculum/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">제품 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <p className="text-slate-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 번들과 단독 제품 분리
  const bundles = products.filter(p => p.product_type === 'bundle');
  const standalones = products.filter(p => p.product_type !== 'bundle');

  return (
    <div className="py-8 px-4 max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">
          제품 학습 선택
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          학습할 Freshworks 제품을 선택하세요.
          각 제품의 핵심 기능을 AI 멘토와 함께 체계적으로 학습할 수 있습니다.
        </p>
      </div>

      {/* 번들 제품 (있는 경우) */}
      {bundles.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-semibold rounded-full">
              BUNDLE
            </span>
            <h2 className="text-lg font-semibold text-slate-700">통합 솔루션</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {bundles.map((product) => {
              const colors = PRODUCT_COLORS[product.id] || PRODUCT_COLORS.freshdesk_omni;
              const icon = PRODUCT_ICONS[product.id] || 'fas fa-layer-group';
              const info = PRODUCT_DESCRIPTIONS[product.id];

              return (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product.id)}
                  className={`
                    ${colors.bg} ${colors.border}
                    border-2 rounded-xl p-6 text-left
                    transition-all duration-200
                    hover:shadow-lg hover:scale-[1.01]
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500
                    relative overflow-hidden
                  `}
                >
                  {/* 번들 배지 */}
                  <div className="absolute top-0 right-0">
                    <div className={`bg-gradient-to-r ${colors.gradient} text-white text-xs px-3 py-1 rounded-bl-lg`}>
                      통합
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    {/* 아이콘 */}
                    <div className={`${colors.text} text-4xl`}>
                      <i className={icon}></i>
                    </div>

                    {/* 내용 */}
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-slate-800 mb-1">
                        {product.name}
                      </h2>
                      <p className="text-sm text-slate-500 mb-2">
                        {info?.tagline || product.description_ko}
                      </p>
                      
                      {/* 기능 태그 */}
                      {info?.features && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {info.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className={`${colors.bg} ${colors.text} text-xs px-2 py-1 rounded-full border ${colors.border.split(' ')[0]}`}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 화살표 */}
                    <div className={`${colors.text} text-xl self-center`}>
                      <i className="fas fa-chevron-right"></i>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 단독 제품 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-semibold rounded-full">
            STANDALONE
          </span>
          <h2 className="text-lg font-semibold text-slate-700">개별 제품</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {standalones.map((product) => {
            const colors = PRODUCT_COLORS[product.id] || PRODUCT_COLORS.freshservice;
            const icon = PRODUCT_ICONS[product.id] || 'fas fa-cube';
            const info = PRODUCT_DESCRIPTIONS[product.id];

            return (
              <button
                key={product.id}
                onClick={() => handleProductSelect(product.id)}
                className={`
                  ${colors.bg} ${colors.border}
                  border-2 rounded-xl p-5 text-left
                  transition-all duration-200
                  hover:shadow-lg hover:scale-[1.02]
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                `}
              >
                <div className="flex items-start gap-4">
                  {/* 아이콘 */}
                  <div className={`${colors.text} text-3xl`}>
                    <i className={icon}></i>
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-slate-800 mb-1">
                      {product.name}
                    </h2>
                    <p className="text-sm text-slate-500 mb-2">
                      {info?.tagline || product.description_ko}
                    </p>

                    {/* 기능 태그 (처음 3개만) */}
                    {info?.features && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {info.features.slice(0, 3).map((feature, idx) => (
                          <span
                            key={idx}
                            className="text-xs text-slate-500 bg-white/50 px-2 py-0.5 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                        {info.features.length > 3 && (
                          <span className="text-xs text-slate-400">
                            +{info.features.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 화살표 */}
                  <div className={`${colors.text} text-lg self-center`}>
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 하단 안내 */}
      <div className="mt-10 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
          <i className="fas fa-graduation-cap"></i>
          <span>각 제품별 5개 모듈, 총 25개 학습 과정 제공</span>
        </div>
      </div>
    </div>
  );
}
