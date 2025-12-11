import React, { useState } from 'react';
import { PanelRightClose, PanelRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ContentWithSidebarProps {
  /** 메인 콘텐츠 영역 */
  children: React.ReactNode;
  /** 사이드바 콘텐츠 */
  sidebar: React.ReactNode;
  /** 사이드바 제목 */
  sidebarTitle?: string;
  /** 사이드바 헤더 커스텀 */
  sidebarHeader?: React.ReactNode;
  /** 사이드바 너비 (기본: 384px = w-96) */
  sidebarWidth?: 'sm' | 'md' | 'lg' | 'xl';
  /** 사이드바 기본 표시 여부 */
  defaultOpen?: boolean;
  /** 사이드바 접기 가능 여부 */
  collapsible?: boolean;
  /** 추가 className */
  className?: string;
}

const sidebarWidthMap = {
  sm: 'w-80', // 320px
  md: 'w-96', // 384px
  lg: 'w-[420px]',
  xl: 'w-[480px]',
};

/**
 * 콘텐츠 + 사이드바 레이아웃 컴포넌트
 * 
 * 학습 페이지, 채팅 페이지 등에서 메인 콘텐츠와 보조 패널(AI 멘토 등)을
 * 나란히 배치할 때 사용합니다.
 * 
 * @example
 * <ContentWithSidebar
 *   sidebar={<AIMentorChat />}
 *   sidebarTitle="AI 멘토"
 *   collapsible
 * >
 *   <LearningContent />
 * </ContentWithSidebar>
 */
const ContentWithSidebar: React.FC<ContentWithSidebarProps> = ({
  children,
  sidebar,
  sidebarTitle,
  sidebarHeader,
  sidebarWidth = 'md',
  defaultOpen = true,
  collapsible = true,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('flex h-full overflow-hidden', className)}>
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {children}
      </div>

      {/* 사이드바 토글 버튼 (닫혀있을 때) */}
      {collapsible && !isOpen && (
        <div className="flex-shrink-0 border-l border-border bg-muted/30 flex flex-col items-center py-4 px-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            title={sidebarTitle || '사이드바 열기'}
          >
            <PanelRight className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* 사이드바 */}
      {isOpen && (
        <aside
          className={cn(
            'flex-shrink-0 border-l border-border bg-background flex flex-col overflow-hidden',
            'shadow-xl shadow-black/5',
            sidebarWidthMap[sidebarWidth]
          )}
        >
          {/* 사이드바 헤더 - collapsible일 때만 또는 별도 헤더가 있을 때만 표시 */}
          {(sidebarHeader || sidebarTitle) && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              {sidebarHeader || (
                <h3 className="font-semibold text-foreground">{sidebarTitle}</h3>
              )}
              {collapsible && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="사이드바 닫기"
                >
                  <PanelRightClose className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          {/* 사이드바 콘텐츠 */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {sidebar}
          </div>
        </aside>
      )}
    </div>
  );
};

export default ContentWithSidebar;
