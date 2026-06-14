import { Crown, Crosshair, Wrench, Plane, Heart } from 'lucide-react';
import type { Crew, CrewRole } from '../types';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import { StatBadge } from './ui/StatBadge';
import { RarityStars } from './ui/RarityStars';
import { cn } from '../lib/utils';

interface CrewCardProps {
  crew: Crew;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
  showTalents?: boolean;
}

const ROLE_CONFIG: Record<CrewRole, { icon: typeof Crown; label: string; color: string; bg: string; glow: string }> = {
  captain: {
    icon: Crown,
    label: '舰长',
    color: 'text-danger-yellow',
    bg: 'from-danger-yellow/30 to-danger-orange/20',
    glow: 'shadow-[0_0_16px_rgba(255,201,60,0.5)]',
  },
  gunner: {
    icon: Crosshair,
    label: '炮手',
    color: 'text-danger-red',
    bg: 'from-danger-red/30 to-danger-orange/20',
    glow: 'shadow-[0_0_16px_rgba(255,46,99,0.5)]',
  },
  engineer: {
    icon: Wrench,
    label: '工程师',
    color: 'text-energy-cyan',
    bg: 'from-energy-cyan/30 to-energy-blue/20',
    glow: 'shadow-[0_0_16px_rgba(0,212,255,0.5)]',
  },
  pilot: {
    icon: Plane,
    label: '飞行员',
    color: 'text-energy-blue',
    bg: 'from-energy-blue/30 to-energy-purple/20',
    glow: 'shadow-[0_0_16px_rgba(74,158,255,0.5)]',
  },
  medic: {
    icon: Heart,
    label: '医疗官',
    color: 'text-life-green',
    bg: 'from-life-green/30 to-life-teal/20',
    glow: 'shadow-[0_0_16px_rgba(57,255,20,0.5)]',
  },
};

const STAT_CONFIG = [
  { key: 'leadership', label: '指挥', color: 'text-danger-yellow' },
  { key: 'gunnery', label: '炮术', color: 'text-danger-red' },
  { key: 'engineering', label: '工程', color: 'text-energy-cyan' },
  { key: 'piloting', label: '驾驶', color: 'text-energy-blue' },
  { key: 'medical', label: '医疗', color: 'text-life-green' },
] as const;

export function CrewCard({
  crew,
  selected = false,
  onClick,
  compact = false,
  showTalents = false,
}: CrewCardProps) {
  const roleCfg = ROLE_CONFIG[crew.role];
  const RoleIcon = roleCfg.icon;
  const initial = crew.name.charAt(0);
  const rarityClass = `rarity-${crew.rarity}`;
  const avatarSize = compact ? 'w-14 h-14' : 'w-[72px] h-[72px]';
  const iconSize = compact ? 'w-6 h-6' : 'w-8 h-8';

  return (
    <Card
      onClick={onClick}
      selected={selected}
      className={cn(rarityClass, 'border-2')}
    >
      <div className={cn('flex gap-3', compact ? 'gap-2' : 'gap-4')}>
        <div className="relative flex-shrink-0">
          <div
            className={cn(
              'rounded-full flex items-center justify-center bg-gradient-to-br border-2 relative overflow-hidden',
              avatarSize,
              roleCfg.bg,
              roleCfg.glow
            )}
            style={{
              borderColor: `var(--role-border, currentColor)`,
            }}
          >
            <div className="absolute inset-0 rounded-full opacity-40">
              <div
                className="absolute inset-1 rounded-full"
                style={{
                  background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 60%)`,
                }}
              />
            </div>
            {crew.avatar ? (
              <img
                src={crew.avatar}
                alt={crew.name}
                className={cn('rounded-full object-cover relative z-10', avatarSize)}
              />
            ) : (
              <span className={cn(
                'font-display font-bold relative z-10',
                roleCfg.color,
                compact ? 'text-2xl' : 'text-3xl'
              )}>
                {initial}
              </span>
            )}
            <div className={cn(
              'absolute -bottom-0.5 -right-0.5 rounded-full bg-space-800 border border-space-600 p-0.5 z-20',
              compact ? 'p-0.5' : 'p-1'
            )}>
              <RoleIcon className={cn(
                roleCfg.color,
                compact ? 'w-3 h-3' : 'w-4 h-4'
              )} />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className={cn(
                    'font-display font-semibold truncate',
                    compact ? 'text-sm' : 'text-base',
                    'text-white'
                  )}>
                    {crew.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <RarityStars rarity={crew.rarity} size="sm" />
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-medium border',
                    roleCfg.color,
                    'bg-space-800/60',
                    `border-current/40`
                  )}>
                    {roleCfg.label}
                  </span>
                </div>
              </div>
              <div className={cn(
                'font-display font-bold text-energy-cyan flex-shrink-0',
                compact ? 'text-sm' : 'text-base'
              )}>
                Lv.{crew.level}
              </div>
            </div>
          </div>

          <div className={compact ? 'mt-1' : 'mt-2'}>
            <ProgressBar
              value={crew.exp}
              max={crew.maxExp}
              color="life"
              height="sm"
              label={!compact ? `EXP ${crew.exp}/${crew.maxExp}` : undefined}
            />
            {compact && (
              <div className="flex justify-between text-[10px] text-ship-silver/70 mt-0.5">
                <span>EXP</span>
                <span>{crew.exp}/{crew.maxExp}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-5 gap-1 mt-3 pt-3 border-t border-energy-cyan/15">
          {STAT_CONFIG.map(({ key, label, color }) => (
            <StatBadge
              key={key}
              label={label}
              value={crew.stats[key]}
              color={color}
              className="!px-1.5 !py-1 !flex-col !gap-0.5 !text-center min-w-0"
            />
          ))}
        </div>
      )}

      {showTalents && crew.talents && crew.talents.length > 0 && (
        <div className="mt-3 pt-3 border-t border-energy-cyan/15">
          <div className="text-[10px] text-ship-silver/70 mb-2">天赋树</div>
          <div className="flex gap-1.5 flex-wrap">
            {crew.talents.map((talent) => (
              <div
                key={talent.id}
                title={`${talent.name}: ${talent.description}`}
                className={cn(
                  'w-8 h-8 rounded-md flex items-center justify-center text-xs font-display font-bold border transition-all',
                  talent.unlocked
                    ? 'bg-life-green/20 border-life-green/60 text-life-green shadow-[0_0_8px_rgba(57,255,20,0.3)]'
                    : 'bg-space-800/60 border-ship-dark/60 text-ship-silver/40'
                )}
              >
                {talent.tier}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default CrewCard;
