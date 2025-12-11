import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/apiClient';
import type { Product } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import SectionHeader from '../components/layout/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Headphones, 
  Layers, 
  BarChart3, 
  MessageSquare, 
  ArrowRight, 
  Box,
  Sparkles
} from 'lucide-react';

// 제품별 아이콘 및 스타일 매핑
const PRODUCT_STYLES: Record<string, { icon: React.ElementType; gradient: string; accent: string; shadow: string }> = {
  freshservice: {
    icon: Settings,
    gradient: 'from-blue-500 to-indigo-600',
    accent: 'text-blue-600',
    shadow: 'shadow-blue-500/20',
  },
  freshdesk: {
    icon: Headphones,
    gradient: 'from-emerald-400 to-teal-600',
    accent: 'text-emerald-600',
    shadow: 'shadow-emerald-500/20',
  },
  freshdesk_omni: {
    icon: Layers,
    gradient: 'from-cyan-400 to-blue-600',
    accent: 'text-cyan-600',
    shadow: 'shadow-cyan-500/20',
  },
  freshsales: {
    icon: BarChart3,
    gradient: 'from-violet-500 to-purple-600',
    accent: 'text-violet-600',
    shadow: 'shadow-violet-500/20',
  },
  freshchat: {
    icon: MessageSquare,
    gradient: 'from-orange-400 to-pink-500',
    accent: 'text-orange-600',
    shadow: 'shadow-orange-500/20',
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
            <i className="fas fa-exclamation-circle text-6xl text-destructive"></i>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">오류 발생</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button onClick={() => window.location.reload()} className="w-full">
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bundles = products.filter(p => p.product_type === 'bundle');
  const standalones = products.filter(p => p.product_type !== 'bundle');
  const allProducts = [...bundles, ...standalones];

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 ring-1 ring-primary/20">
          <Box className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          제품별 커리큘럼
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          학습하고 싶은 제품을 선택하여 전문가로 성장하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {allProducts.map((product) => {
          const style = PRODUCT_STYLES[product.id] || PRODUCT_STYLES.freshservice;
          const info = PRODUCT_DESCRIPTIONS[product.id];
          const Icon = style.icon;
          const isBundle = product.product_type === 'bundle';

          return (
            <Card
              key={product.id}
              className={`group relative overflow-hidden cursor-pointer border-border/50 hover:border-primary/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card h-full ${isBundle ? style.shadow : ''}`}
              onClick={() => handleProductSelect(product.id)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
              
              <CardContent className="p-5 flex flex-col h-full relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white shadow-md group-hover:shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isBundle && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-1.5 py-0.5 text-[10px]">
                      BUNDLE
                    </Badge>
                  )}
                </div>

                <div className="mb-2">
                  <h2 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors truncate">
                    {product.name}
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-1 font-medium">
                    {info?.tagline || product.description_ko}
                  </p>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-end text-muted-foreground group-hover:text-primary transition-colors">
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
