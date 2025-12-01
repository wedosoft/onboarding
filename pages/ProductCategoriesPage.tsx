import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProduct, getProductCategories } from '../services/apiClient';
import type { Product, ProductCategory } from '../types';

// 카테고리별 아이콘 매핑 (slug 기반)
const CATEGORY_ICONS: Record<string, string> = {
  'quick-start-guides': 'fas fa-rocket',
  'getting-started-with-freshservice': 'fas fa-play-circle',
  'support-guide-it-service-management': 'fas fa-ticket-alt',
  'support-guide-it-asset-management': 'fas fa-server',
  'it-operations-management': 'fas fa-network-wired',
  'enterprise-service-management': 'fas fa-building',
  'user-guide---admin': 'fas fa-user-shield',
  'user-guide---agent': 'fas fa-user-tie',
  'end-user-guide': 'fas fa-users',
  'platform': 'fas fa-layer-group',
  'how-to-setup-apps-and-integrations': 'fas fa-puzzle-piece',
  'security-and-policies': 'fas fa-shield-alt',
  'policies-and-data-protection': 'fas fa-lock',
  'managed-service-provider': 'fas fa-handshake',
  'freshservice-faqs': 'fas fa-question-circle',
  'project--workload-management': 'fas fa-tasks',
  'orchestration--saas-management-apps': 'fas fa-sitemap',
  'freshservice-l2': 'fas fa-tools',
  'contact-support': 'fas fa-phone-alt',
  'freshservice-mobile': 'fas fa-mobile-alt',
};

export default function ProductCategoriesPage() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!productId) return;

      try {
        setIsLoading(true);
        const [productData, categoriesData] = await Promise.all([
          getProduct(productId),
          getProductCategories(productId),
        ]);
        setProduct(productData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('카테고리 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [productId]);

  const handleCategorySelect = (categorySlug: string) => {
    navigate(`/assessment/products/${productId}/${categorySlug}`);
  };

  const handleChatClick = () => {
    navigate(`/assessment/products/${productId}/chat`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">카테고리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <p className="text-slate-600">{error || '제품을 찾을 수 없습니다.'}</p>
          <button
            onClick={() => navigate('/assessment/products')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            제품 목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/assessment/products')}
            className="text-slate-500 hover:text-slate-700 text-sm mb-4 inline-block"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            제품 목록으로
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                {product.name}
              </h1>
              <p className="text-slate-600">
                {product.description_ko}
              </p>
            </div>

            {/* AI 채팅 버튼 */}
            <button
              onClick={handleChatClick}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              <i className="fas fa-robot"></i>
              <span>AI 멘토에게 질문</span>
            </button>
          </div>
        </div>

        {/* 카테고리 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category, index) => {
            const icon = CATEGORY_ICONS[category.slug] || 'fas fa-folder';

            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.slug)}
                className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* 순서 번호 */}
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-medium group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    {index + 1}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <i className={`${icon} text-slate-400 group-hover:text-blue-500 transition-colors`}></i>
                      <h3 className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                    </div>
                    {category.nameEn !== category.name && (
                      <p className="text-xs text-slate-400 truncate">
                        {category.nameEn}
                      </p>
                    )}
                  </div>

                  {/* 화살표 */}
                  <i className="fas fa-chevron-right text-slate-300 group-hover:text-blue-500 transition-colors self-center"></i>
                </div>
              </button>
            );
          })}
        </div>

        {/* 학습 안내 */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-2">
            <i className="fas fa-lightbulb mr-2"></i>
            학습 가이드
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>
              <i className="fas fa-check mr-2"></i>
              각 카테고리를 선택하면 AI가 생성한 학습 콘텐츠를 확인할 수 있습니다.
            </li>
            <li>
              <i className="fas fa-check mr-2"></i>
              학습 중 궁금한 내용은 AI 멘토에게 바로 질문할 수 있습니다.
            </li>
            <li>
              <i className="fas fa-check mr-2"></i>
              "Quick Start Guides"부터 시작하는 것을 권장합니다.
            </li>
          </ul>
        </div>

        {/* 통계 */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <span>
            <i className="fas fa-folder mr-1"></i>
            총 {categories.length}개 카테고리
          </span>
        </div>
      </div>
    </div>
  );
}
