import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, getProductStats } from '../services/apiClient';
import type { Product, ProductStats } from '../types';

// 제품별 아이콘 매핑 (Font Awesome)
const PRODUCT_ICONS: Record<string, string> = {
  freshservice: 'fas fa-cog',
  freshdesk: 'fas fa-headset',
  freshsales: 'fas fa-chart-line',
  freshchat: 'fas fa-comments',
};

// 제품별 색상 매핑
const PRODUCT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  freshservice: {
    bg: 'bg-blue-50',
    border: 'border-blue-200 hover:border-blue-400',
    text: 'text-blue-600',
  },
  freshdesk: {
    bg: 'bg-green-50',
    border: 'border-green-200 hover:border-green-400',
    text: 'text-green-600',
  },
  freshsales: {
    bg: 'bg-purple-50',
    border: 'border-purple-200 hover:border-purple-400',
    text: 'text-purple-600',
  },
  freshchat: {
    bg: 'bg-orange-50',
    border: 'border-orange-200 hover:border-orange-400',
    text: 'text-orange-600',
  },
};

export default function ProductSelectionPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Record<string, ProductStats>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        const productList = await getProducts();
        setProducts(productList);

        // 각 제품의 통계 로드
        const statsPromises = productList.map(async (product) => {
          try {
            const productStats = await getProductStats(product.id);
            return { id: product.id, stats: productStats };
          } catch {
            return { id: product.id, stats: null };
          }
        });

        const statsResults = await Promise.all(statsPromises);
        const statsMap: Record<string, ProductStats> = {};
        statsResults.forEach(({ id, stats: s }) => {
          if (s) {
            statsMap[id] = s;
          }
        });
        setStats(statsMap);
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
    navigate(`/assessment/products/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">제품 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            제품 지식 학습
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            학습할 제품을 선택하세요. 각 제품의 핵심 기능과 사용법을
            AI 멘토와 함께 체계적으로 학습할 수 있습니다.
          </p>
        </div>

        {/* 제품 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => {
            const colors = PRODUCT_COLORS[product.id] || PRODUCT_COLORS.freshservice;
            const icon = PRODUCT_ICONS[product.id] || 'fas fa-cube';
            const productStats = stats[product.id];

            return (
              <button
                key={product.id}
                onClick={() => handleProductSelect(product.id)}
                className={`
                  ${colors.bg} ${colors.border}
                  border-2 rounded-xl p-6 text-left
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
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-800 mb-1">
                      {product.name}
                    </h2>
                    <p className="text-sm text-slate-500 mb-3">
                      {product.name_ko}
                    </p>
                    <p className="text-slate-600 text-sm mb-4">
                      {product.description_ko}
                    </p>

                    {/* 통계 */}
                    {productStats && (
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span>
                          <i className="fas fa-folder mr-1"></i>
                          {productStats.category_count}개 카테고리
                        </span>
                        <span>
                          <i className="fas fa-file-alt mr-1"></i>
                          {productStats.document_count}개 문서
                        </span>
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

        {/* 하단 안내 */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            <i className="fas fa-info-circle mr-2"></i>
            각 제품의 카테고리별로 학습 콘텐츠가 제공되며, AI 멘토에게 질문할 수 있습니다.
          </p>
        </div>

        {/* 뒤로가기 버튼 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/assessment')}
            className="text-slate-500 hover:text-slate-700 text-sm"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            학습 평가 메인으로
          </button>
        </div>
      </div>
    </div>
  );
}
