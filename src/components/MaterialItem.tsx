import type { Material } from '../types';
import { cn } from '../lib/utils';
import { getRarityColor } from '../utils/rarityColors';

interface MaterialItemProps {
  material: Material;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const SIZE_CLASSES: Record<NonNullable<MaterialItemProps['size']>, { box: string; icon: string; badge: string }> = {
  sm: {
    box: 'w-10 h-10',
    icon: 'text-sm',
    badge: 'text-[9px] px-1 py-0.5 -bottom-1 -right-1',
  },
  md: {
    box: 'w-14 h-14',
    icon: 'text-xl',
    badge: 'text-[10px] px-1.5 py-0.5 -bottom-1.5 -right-1.5',
  },
  lg: {
    box: 'w-20 h-20',
    icon: 'text-3xl',
    badge: 'text-xs px-2 py-0.5 -bottom-2 -right-2',
  },
};

export function MaterialItem({
  material,
  showName = false,
  size = 'md',
  onClick,
}: MaterialItemProps) {
  const sizeCfg = SIZE_CLASSES[size];
  const rarityColor = getRarityColor(material.rarity);
  const rarityClass = `rarity-${material.rarity}`;

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5',
        onClick && 'cursor-pointer'
      )}
      title={`${material.name}${material.description ? ': ' + material.description : ''}`}
    >
      <div
        className={cn(
          'relative rounded-md bg-space-800/80 border-2 flex items-center justify-center',
          'transition-all duration-200 hover:scale-110',
          rarityClass,
          sizeCfg.box,
          onClick && 'hover:shadow-glow'
        )}
        style={{
          boxShadow: `inset 0 0 8px ${rarityColor}25, 0 0 8px ${rarityColor}15`,
        }}
      >
        <div
          className="absolute inset-0 rounded-md opacity-40 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${rarityColor}15 0%, transparent 60%)`,
          }}
        />
        <span
          className={cn(
            'font-display font-bold relative z-10 select-none',
            sizeCfg.icon
          )}
          style={{ color: rarityColor, textShadow: `0 0 8px ${rarityColor}80` }}
        >
          {material.icon}
        </span>
        <span
          className={cn(
            'absolute rounded-full bg-space-900 border border-ship-dark/80 font-display font-bold text-ship-silver z-20',
            sizeCfg.badge
          )}
        >
          {material.quantity}
        </span>
      </div>
      {showName && (
        <span
          className={cn(
            'font-medium text-center max-w-[80px] truncate',
            size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs' : 'text-sm'
          )}
          style={{ color: rarityColor }}
        >
          {material.name}
        </span>
      )}
    </div>
  );
}

export default MaterialItem;
