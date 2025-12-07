import React, { ElementType, ComponentPropsWithoutRef } from 'react';
import { cx } from './utils';

type SurfaceVariant = 'solid' | 'muted' | 'contrast';
type SurfaceTone = 'default' | 'brand' | 'accent';

type SurfaceCardOwnProps = {
  variant?: SurfaceVariant;
  tone?: SurfaceTone;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md';
  className?: string;
};

export type SurfaceCardProps<T extends ElementType> = {
  as?: T;
} & SurfaceCardOwnProps & ComponentPropsWithoutRef<T>;

const variantClassMap: Record<SurfaceVariant, string> = {
  solid: 'bg-white border border-slate-100',
  muted: 'bg-white/70 border border-white/40 backdrop-blur',
  contrast: 'bg-slate-900 text-white border border-slate-800',
};

const toneClassMap: Record<SurfaceTone, string> = {
  default: '',
  brand: 'bg-gradient-to-br from-primary-500 to-primary-700 text-white border-none',
  accent: 'bg-gradient-to-br from-accent-500/90 to-primary-500/90 text-white border-none',
};

const paddingClassMap = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const shadowClassMap = {
  none: '',
  sm: 'shadow-lg/40',
  md: 'shadow-xl shadow-slate-200/60',
};

const SurfaceCard = <T extends ElementType = 'section'>(
  {
    as,
    children,
    variant = 'solid',
    tone = 'default',
    padding = 'md',
    shadow = 'sm',
    className,
    ...rest
  }: SurfaceCardProps<T>
) => {
  const Component = as || 'section';
  return (
    <Component
      className={cx(
        'rounded-3xl transition-all duration-300',
        variantClassMap[variant],
        tone !== 'default' ? toneClassMap[tone] : '',
        paddingClassMap[padding],
        shadowClassMap[shadow],
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default SurfaceCard;
