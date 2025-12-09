import React from 'react';
import { cx } from './utils';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  action?: React.ReactNode;
  className?: string;
};

const alignmentMap = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
};

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  align = 'left',
  action,
  className,
}) => {
  return (
    <div className={cx('flex flex-col gap-3', className)}>
      <div className={cx('flex w-full gap-4', action ? 'justify-between items-start' : alignmentMap[align])}>
        <div className={cx('flex flex-col gap-2', alignmentMap[align])}>
          <div className="flex items-center gap-3">
            {icon && <span className="text-primary text-xl">{icon}</span>}
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
};

export default SectionHeader;
