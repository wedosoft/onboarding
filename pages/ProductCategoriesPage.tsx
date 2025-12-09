import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProduct, getProductCategories } from '../services/apiClient';
import type { Product, ProductCategory } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import SectionHeader from '../components/layout/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
            <i className="fas fa-exclamation-triangle text-6xl text-destructive"></i>
            <p className="text-muted-foreground">{error || '제품을 찾을 수 없습니다.'}</p>
            <Button onClick={() => navigate('/assessment/products')} className="w-full">
              제품 목록으로
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="layout-stack pb-12">
      <SectionHeader
        title={product.name}
        subtitle={product.description_ko}
        icon={<i className="fas fa-layer-group"></i>}
        action={(
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/assessment/products')}
            >
              <i className="fas fa-arrow-left mr-2"></i>제품 목록으로
            </Button>
            <Button
              onClick={handleChatClick}
              size="lg"
              className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500"
            >
              <i className="fas fa-robot mr-2"></i>AI 멘토에게 질문
            </Button>
          </div>
        )}
      />

      {/* 카테고리 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => {
          const icon = CATEGORY_ICONS[category.slug] || 'fas fa-folder';

          return (
            <Card
              key={category.id}
              className="cursor-pointer hover:border-primary/50 transition-colors group"
              onClick={() => handleCategorySelect(category.slug)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* 순서 번호 */}
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {index + 1}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <i className={`${icon} text-muted-foreground group-hover:text-primary transition-colors`}></i>
                      <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                    </div>
                    {category.nameEn !== category.name && (
                      <p className="text-xs text-muted-foreground truncate">
                        {category.nameEn}
                      </p>
                    )}
                  </div>

                  {/* 화살표 */}
                  <i className="fas fa-chevron-right text-muted-foreground group-hover:text-primary transition-colors self-center"></i>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 학습 안내 */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <i className="fas fa-lightbulb text-primary"></i>
            학습 가이드
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <i className="fas fa-check text-primary mt-0.5"></i>
              <span>각 카테고리를 선택하면 AI가 생성한 학습 콘텐츠를 확인할 수 있습니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fas fa-check text-primary mt-0.5"></i>
              <span>학습 중 궁금한 내용은 AI 멘토에게 바로 질문할 수 있습니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fas fa-check text-primary mt-0.5"></i>
              <span>"Quick Start Guides"부터 시작하는 것을 권장합니다.</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* 통계 */}
      <div className="text-center">
        <Badge variant="secondary" className="px-4 py-2">
          <i className="fas fa-folder mr-2"></i>
          총 {categories.length}개 카테고리
        </Badge>
      </div>
    </div>
  );
}
