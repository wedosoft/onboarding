import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  /** 페이지 제목 */
  title: string;
  /** 페이지 설명 (선택) */
  description?: string;
  /** 브레드크럼 네비게이션 */
  breadcrumbs?: Breadcrumb[];
  /** 우측 액션 버튼 영역 */
  actions?: React.ReactNode;
  /** 제목 앞에 표시할 아이콘 */
  icon?: React.ReactNode;
  /** 제목 옆에 표시할 뱃지 */
  badge?: React.ReactNode;
  /** 추가 className */
  className?: string;
  /** 컴팩트 모드 (높이 축소) */
  compact?: boolean;
  /** 하단 탭 또는 필터 영역 */
  tabs?: React.ReactNode;
}

/**
 * 통합 페이지 헤더 컴포넌트
 * 
 * 모든 페이지에서 일관된 헤더 스타일을 제공합니다.
 * 
 * @example
 * <PageHeader
 *   title="Freshdesk 커리큘럼"
 *   description="고객 지원의 핵심 기능을 학습합니다"
 *   breadcrumbs={[
 *     { label: '커리큘럼', href: '/curriculum' },
 *     { label: 'Freshdesk' }
 *   ]}
 *   actions={<Button>자가 점검</Button>}
 * />
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  icon,
  badge,
  className,
  compact = false,
  tabs,
}) => {
  return (
    <header
      className={cn(
        'bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60',
        'border-b border-border',
        compact ? 'py-4' : 'py-6',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* 브레드크럼 */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="w-3.5 h-3.5" />}
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* 메인 헤더 영역 */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            {/* 제목 행 */}
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  {icon}
                </div>
              )}
              <div className="flex items-center gap-3 min-w-0">
                <h1 className="text-2xl font-bold text-foreground truncate">
                  {title}
                </h1>
                {badge}
              </div>
            </div>

            {/* 설명 */}
            {description && (
              <p className={cn(
                'text-muted-foreground mt-1.5 max-w-2xl',
                icon ? 'ml-[52px]' : ''
              )}>
                {description}
              </p>
            )}
          </div>

          {/* 액션 버튼 영역 */}
          {actions && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>

        {/* 탭/필터 영역 */}
        {tabs && (
          <div className="mt-4 -mb-[1px]">
            {tabs}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
