import type { LucideIcon } from 'lucide-react';
import { Shield, Swords, Heart, Zap, Target, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type IconName = 'Shield' | 'Swords' | 'Heart' | 'Zap' | 'Target' | 'ShieldCheck';

const ICONS: Record<IconName, LucideIcon> = {
  Shield,
  Swords,
  Heart,
  Zap,
  Target,
  ShieldCheck,
};

const DEFAULT_COLORS: Record<IconName | string, string> = {
  Shield: 'text-energy-cyan',
  Swords: 'text-danger-red',
  Heart: 'text-life-green',
  Zap: 'text-danger-yellow',
  Target: 'text-energy-purple',
  ShieldCheck: 'text-life-teal',
};

interface StatBadgeProps {
  icon?: IconName | string;
  label: string;
  value: number | string;
  color?: string;
  className?: string;
}

export function StatBadge({
  icon,
  label,
  value,
  color,
  className,
}: StatBadgeProps) {
  const Icon = icon && icon in ICONS ? ICONS[icon as IconName] : null;
  const textColor = color ?? (icon ? DEFAULT_COLORS[icon] ?? 'text-ship-silver' : 'text-ship-silver');

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-md bg-space-800/80 border border-ship-dark/60',
        className
      )}
    >
      {Icon && <Icon className={cn('w-4 h-4', textColor)} />}
      <span className="text-xs text-ship-silver">{label}</span>
      <span className={cn('font-display font-bold text-sm', textColor)}>
        {value}
      </span>
    </div>
  );
}

export default StatBadge;
