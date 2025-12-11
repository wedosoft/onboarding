import React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

interface TabNavProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  /** 탭 스타일 */
  variant?: 'underline' | 'pills' | 'cards';
  /** 크기 */
  size?: 'sm' | 'md';
  /** 추가 className */
  className?: string;
}

/**
 * 탭 네비게이션 컴포넌트
 * 
 * 페이지 헤더 하단이나 콘텐츠 영역에서 탭 전환에 사용합니다.
 * 
 * @example
 * <TabNav
 *   tabs={[
 *     { id: 'basic', label: '기초', icon: <Sprout /> },
 *     { id: 'intermediate', label: '중급', icon: <Leaf /> },
 *     { id: 'advanced', label: '고급', icon: <TreeDeciduous /> },
 *   ]}
 *   activeTab={currentLevel}
 *   onTabChange={setCurrentLevel}
 *   variant="pills"
 * />
 */
const TabNav: React.FC<TabNavProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'underline',
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
  };

  if (variant === 'pills') {
    return (
      <div className={cn('flex gap-1 bg-muted/50 p-1 rounded-lg w-fit', className)}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                'flex items-center rounded-md font-medium transition-all duration-200',
                sizeClasses[size],
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
                tab.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className={cn('flex gap-2', className)}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                'flex items-center rounded-xl border-2 font-medium transition-all duration-200',
                sizeClasses[size],
                isActive
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-transparent bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted',
                tab.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge}
            </button>
          );
        })}
      </div>
    );
  }

  // Default: underline style
  return (
    <div className={cn('flex border-b border-border', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              'flex items-center font-medium transition-all duration-200 border-b-2 -mb-[2px]',
              sizeClasses[size],
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted',
              tab.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge}
          </button>
        );
      })}
    </div>
  );
};

export default TabNav;
