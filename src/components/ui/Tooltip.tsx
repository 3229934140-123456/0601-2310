import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  className,
}: TooltipProps) {
  return (
    <div className={cn('group relative inline-flex', className)}>
      {children}
      <div
        className={cn(
          'absolute left-1/2 z-50 -translate-x-1/2 px-3 py-2 text-xs text-white whitespace-nowrap rounded-md bg-space-900/95 border border-energy-cyan/30 shadow-glow opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none',
          position === 'top'
            ? 'bottom-full mb-2 -translate-y-1 group-hover:translate-y-0'
            : 'top-full mt-2 translate-y-1 group-hover:translate-y-0'
        )}
      >
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-space-900/95 border border-energy-cyan/30 rotate-45',
            position === 'top'
              ? 'bottom-0 translate-y-1/2 border-l-0 border-t-0'
              : 'top-0 -translate-y-1/2 border-r-0 border-b-0'
          )}
        />
        {content}
      </div>
    </div>
  );
}

export default Tooltip;
