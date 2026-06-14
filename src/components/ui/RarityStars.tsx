import { Star } from 'lucide-react';
import type { Rarity } from '@/types';
import { getRarityColor } from '@/utils/rarityColors';
import { cn } from '@/lib/utils';

interface RarityStarsProps {
  rarity: Rarity;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap: Record<NonNullable<RarityStarsProps['size']>, string> = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function RarityStars({
  rarity,
  size = 'md',
  className,
}: RarityStarsProps) {
  const stars: Rarity[] = [1, 2, 3, 4, 5];
  const color = getRarityColor(rarity);
  const starSize = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {stars.map((s) => {
        const filled = s <= rarity;
        return (
          <Star
            key={s}
            className={cn(
              starSize,
              filled ? 'drop-shadow-[0_0_4px]' : 'opacity-25'
            )}
            style={{
              color: filled ? color : undefined,
              fill: filled ? color : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

export default RarityStars;
