import type { Rarity } from '../types';

const RARITY_COLORS: Record<Rarity, string> = {
  1: '#9CA3AF',
  2: '#39FF14',
  3: '#4A9EFF',
  4: '#9D6CFF',
  5: '#FFC93C',
};

export function getRarityColor(rarity: Rarity): string {
  return RARITY_COLORS[rarity];
}

export function getRarityBorder(rarity: Rarity): string {
  const color = RARITY_COLORS[rarity];
  return `border-2 border-solid`;
}

export function getRarityTextClass(rarity: Rarity): string {
  const map: Record<Rarity, string> = {
    1: 'text-[#9CA3AF]',
    2: 'text-[#39FF14]',
    3: 'text-[#4A9EFF]',
    4: 'text-[#9D6CFF]',
    5: 'text-[#FFC93C]',
  };
  return map[rarity];
}

export function getRarityBgClass(rarity: Rarity): string {
  const map: Record<Rarity, string> = {
    1: 'bg-[#9CA3AF]/10',
    2: 'bg-[#39FF14]/10',
    3: 'bg-[#4A9EFF]/10',
    4: 'bg-[#9D6CFF]/10',
    5: 'bg-[#FFC93C]/10',
  };
  return map[rarity];
}

export { RARITY_COLORS };
