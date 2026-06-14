import { Shield, Crosshair, Zap, Users, Heart, Swords, Gauge, Radar } from 'lucide-react';
import type { Ship, ShipType } from '../types';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import { StatBadge } from './ui/StatBadge';
import { RarityStars } from './ui/RarityStars';
import { cn } from '../lib/utils';
import { getRarityColor } from '../utils/rarityColors';

interface ShipCardProps {
  ship: Ship;
  selected?: boolean;
  onClick?: () => void;
  showStats?: boolean;
  compact?: boolean;
  assignedCrewNames?: string[];
}

const SHIP_TYPE_ICONS: Record<ShipType, typeof Shield> = {
  battleship: Shield,
  cruiser: Crosshair,
  destroyer: Zap,
  carrier: Users,
  support: Heart,
};

const SHIP_TYPE_LABELS: Record<ShipType, string> = {
  battleship: '战列舰',
  cruiser: '巡洋舰',
  destroyer: '驱逐舰',
  carrier: '航母',
  support: '支援舰',
};

function ShipIcon({ type, color }: { type: ShipType; color: string }) {
  const stroke = color;
  const common = {
    width: '40',
    height: '40',
    viewBox: '0 0 64 64',
    fill: 'none',
    stroke,
    strokeWidth: '1.5',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (type) {
    case 'battleship':
      return (
        <svg {...common}>
          <polygon points="32,8 52,24 48,56 16,56 12,24" />
          <line x1="20" y1="32" x2="44" y2="32" />
          <line x1="24" y1="40" x2="40" y2="40" />
          <line x1="28" y1="48" x2="36" y2="48" />
          <circle cx="32" cy="20" r="4" />
        </svg>
      );
    case 'cruiser':
      return (
        <svg {...common}>
          <polygon points="32,6 50,22 46,54 18,54 14,22" />
          <line x1="32" y1="6" x2="32" y2="54" />
          <line x1="14" y1="28" x2="50" y2="28" />
          <line x1="18" y1="38" x2="46" y2="38" />
          <path d="M24,48 L32,44 L40,48" />
        </svg>
      );
    case 'destroyer':
      return (
        <svg {...common}>
          <polygon points="32,4 54,32 44,58 20,58 10,32" />
          <line x1="32" y1="4" x2="32" y2="58" />
          <line x1="10" y1="32" x2="54" y2="32" />
          <path d="M20,58 L26,48 L32,52 L38,48 L44,58" />
        </svg>
      );
    case 'carrier':
      return (
        <svg {...common}>
          <rect x="8" y="16" width="48" height="36" rx="2" />
          <line x1="8" y1="28" x2="56" y2="28" />
          <line x1="8" y1="40" x2="56" y2="40" />
          <polygon points="20,8 44,8 40,16 24,16" />
          <path d="M16,52 L20,44 M28,52 L32,44 M40,52 L44,44 M48,52 L52,44" />
        </svg>
      );
    case 'support':
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="24" />
          <line x1="32" y1="14" x2="32" y2="50" />
          <line x1="14" y1="32" x2="50" y2="32" />
          <circle cx="32" cy="32" r="10" />
          <path d="M32,22 L32,42 M22,32 L42,32" strokeWidth="2" />
        </svg>
      );
  }
}

export function ShipCard({
  ship,
  selected = false,
  onClick,
  showStats = false,
  compact = false,
  assignedCrewNames,
}: ShipCardProps) {
  const TypeIcon = SHIP_TYPE_ICONS[ship.type];
  const rarityColor = getRarityColor(ship.rarity);
  const rarityClass = `rarity-${ship.rarity}`;

  return (
    <Card
      onClick={onClick}
      selected={selected}
      className={cn(
        rarityClass,
        'tech-border border-2',
        selected && 'animate-pulse-glow',
        compact && 'p-0'
      )}
    >
      <div className={cn('flex flex-col', compact ? 'gap-1.5 p-3' : 'gap-3')}>
        <div className="flex items-start justify-between">
          <RarityStars rarity={ship.rarity} size={compact ? 'sm' : 'md'} />
          <div className="flex items-center gap-1.5">
            <TypeIcon
              className={cn(
                compact ? 'w-4 h-4' : 'w-5 h-5',
                'text-energy-cyan drop-shadow-[0_0_4px_rgba(0,212,255,0.6)]'
              )}
            />
            <span className={cn(
              compact ? 'text-[10px]' : 'text-xs',
              'text-energy-cyan/80 font-medium'
            )}>
              {SHIP_TYPE_LABELS[ship.type]}
            </span>
          </div>
        </div>

        <h3
          className={cn(
            'font-display font-bold text-white text-glow-white',
            compact ? 'text-sm' : 'text-lg'
          )}
        >
          {ship.name}
        </h3>

        <div className={cn(
          'flex justify-center items-center',
          compact ? 'py-1' : 'py-2'
        )}>
          <div
            className="transition-all duration-300"
            style={{ filter: `drop-shadow(0 0 8px ${rarityColor}80)` }}
          >
            <ShipIcon type={ship.type} color={rarityColor} />
          </div>
        </div>

        <div className={cn('flex flex-col', compact ? 'gap-1' : 'gap-2')}>
          <div>
            <div className={cn(
              'flex justify-between mb-0.5',
              compact ? 'text-[10px]' : 'text-xs'
            )}>
              <span className="text-danger-red font-semibold">HP</span>
              <span className="text-danger-red/90">
                {ship.hp}/{ship.maxHp}
              </span>
            </div>
            <ProgressBar
              value={ship.hp}
              max={ship.maxHp}
              color="danger"
              height={compact ? 'sm' : 'md'}
            />
          </div>
          <div>
            <div className={cn(
              'flex justify-between mb-0.5',
              compact ? 'text-[10px]' : 'text-xs'
            )}>
              <span className="text-energy-cyan font-semibold">护盾</span>
              <span className="text-energy-cyan/90">
                {ship.shield}/{ship.maxShield}
              </span>
            </div>
            <ProgressBar
              value={ship.shield}
              max={ship.maxShield}
              color="energy"
              height={compact ? 'sm' : 'md'}
            />
          </div>
        </div>

        {showStats && !compact && (
          <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-energy-cyan/15">
            <StatBadge icon="Swords" label="攻" value={ship.attack} color="text-danger-red" className="!px-2 !py-1" />
            <StatBadge icon="Shield" label="防" value={ship.defense} color="text-energy-cyan" className="!px-2 !py-1" />
            <StatBadge icon="Zap" label="速" value={ship.speed} color="text-danger-yellow" className="!px-2 !py-1" />
            <StatBadge icon="Target" label="程" value={ship.attackRange} color="text-energy-purple" className="!px-2 !py-1" />
          </div>
        )}

        {assignedCrewNames && assignedCrewNames.length > 0 && !compact && (
          <div className="pt-2 border-t border-energy-cyan/15">
            <div className="text-[10px] text-ship-silver/70 mb-1">已配舰员</div>
            <div className="flex flex-wrap gap-1">
              {assignedCrewNames.map((name, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 text-[10px] rounded bg-space-700/60 text-ship-silver border border-ship-dark/50"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default ShipCard;
