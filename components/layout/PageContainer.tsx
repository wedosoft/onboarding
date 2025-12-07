import React from 'react';
import { cx } from './utils';

type PageContainerWidth = 'narrow' | 'default' | 'wide' | 'full';

type PageContainerProps = {
  children: React.ReactNode;
  width?: PageContainerWidth;
  bleedX?: boolean;
  paddingY?: boolean;
  className?: string;
};

const widthClassMap: Record<PageContainerWidth, string> = {
  narrow: 'max-w-4xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  full: 'max-w-[1920px]'
};

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  width = 'wide',
  bleedX = false,
  paddingY = false,
  className,
}) => {
  const horizontalPadding = bleedX ? '' : 'px-6 sm:px-8 lg:px-12';
  const verticalPadding = paddingY ? 'py-6 lg:py-10' : '';

  return (
    <div
      className={cx(
        'w-full mx-auto',
        widthClassMap[width],
        horizontalPadding,
        verticalPadding,
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageContainer;
