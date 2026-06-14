import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'danger' | 'life' | 'energy' | string;
  showLabel?: boolean;
  label?: string;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

const heightClasses: Record<NonNullable<ProgressBarProps['height']>, string> = {
  sm: '!h-1',
  md: '',
  lg: '!h-3',
};

function getGradientClass(color?: string): string {
  switch (color) {
    case 'danger':
      return 'bg-gradient-danger';
    case 'life':
      return 'bg-gradient-life';
    case 'energy':
      return 'bg-gradient-energy';
    default:
      if (color && color.startsWith('bg-')) return color;
      if (color && color.startsWith('#')) return '';
      return 'bg-gradient-energy';
  }
}

export function ProgressBar({
  value,
  max,
  color,
  showLabel = false,
  label,
  height = 'md',
  className,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(value, max));
  const percentage = max > 0 ? (clampedValue / max) * 100 : 0;
  const gradientClass = getGradientClass(color);
  const customStyle =
    color && color.startsWith('#')
      ? { background: `linear-gradient(90deg, ${color}, ${color}aa)` }
      : undefined;

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('stat-bar', heightClasses[height])}>
        <div
          className={cn('stat-bar-fill', gradientClass)}
          style={{ width: `${percentage}%`, ...customStyle }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 flex justify-between text-xs text-ship-silver">
          <span>{label ?? `${Math.round(clampedValue)} / ${max}`}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}

export default ProgressBar;
