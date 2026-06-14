import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  bordered?: boolean;
}

export function Card({
  title,
  children,
  footer,
  className,
  onClick,
  selected = false,
  bordered = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'hud-panel',
        onClick && 'cursor-pointer transition-all hover:border-energy-cyan/40',
        selected && 'border-energy-cyan shadow-glow',
        bordered && 'border-2',
        className
      )}
    >
      {title && (
        <div className="relative px-4 py-3 border-b border-energy-cyan/20">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-energy-cyan/60 to-transparent" />
          <h3 className="font-display font-semibold text-sm tracking-wider text-energy-cyan text-glow">
            {title}
          </h3>
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-3 border-t border-energy-cyan/20 bg-space-900/50">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;
