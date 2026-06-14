import { Swords, Shield, Settings, ArrowUp, Coins } from 'lucide-react';
import type { Equipment, EquipmentType } from '../types';
import { Card } from './ui/Card';
import { RarityStars } from './ui/RarityStars';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { getRarityColor } from '../utils/rarityColors';
import { useGameStore } from '../store/useGameStore';
import { MaterialItem } from './MaterialItem';

interface EquipmentCardProps {
  equipment: Equipment;
  selected?: boolean;
  onClick?: () => void;
  showStats?: boolean;
  compact?: boolean;
  canCraft?: boolean;
}

const TYPE_CONFIG: Record<EquipmentType, { icon: typeof Swords; label: string; color: string }> = {
  weapon: { icon: Swords, label: '武器', color: 'text-danger-red' },
  shield: { icon: Shield, label: '护盾', color: 'text-energy-cyan' },
  module: { icon: Settings, label: '模块', color: 'text-energy-purple' },
};

function EquipmentArt({ type, color }: { type: EquipmentType; color: string }) {
  const common = {
    width: '64',
    height: '64',
    viewBox: '0 0 80 80',
    fill: 'none',
    stroke: color,
    strokeWidth: '2',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (type) {
    case 'weapon':
      return (
        <svg {...common}>
          <polygon points="40,6 46,24 64,28 50,42 54,62 40,54 26,62 30,42 16,28 34,24" />
          <line x1="40" y1="20" x2="40" y2="48" strokeWidth="3" />
          <circle cx="40" cy="34" r="4" fill={color} fillOpacity="0.3" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path d="M40,8 L68,18 L64,44 C62,58 52,68 40,72 C28,68 18,58 16,44 L12,18 Z" />
          <path d="M28,28 L40,40 L52,28" strokeWidth="2.5" />
          <circle cx="40" cy="48" r="6" fill={color} fillOpacity="0.25" />
        </svg>
      );
    case 'module':
      return (
        <svg {...common}>
          <rect x="16" y="16" width="48" height="48" rx="4" />
          <line x1="40" y1="16" x2="40" y2="64" strokeDasharray="4,4" />
          <line x1="16" y1="40" x2="64" y2="40" strokeDasharray="4,4" />
          <circle cx="40" cy="40" r="10" fill={color} fillOpacity="0.2" />
          <circle cx="40" cy="40" r="4" fill={color} />
          <path d="M24,24 L30,30 M56,24 L50,30 M24,56 L30,50 M56,56 L50,50" />
        </svg>
      );
  }
}

const STAT_LABEL_MAP: Record<string, string> = {
  attack: '攻击',
  defense: '防御',
  speed: '速度',
  hp: '生命',
  shield: '护盾',
  moveRange: '移动距离',
  attackRange: '攻击范围',
  critRate: '暴击率',
  critDamage: '暴击伤害',
  accuracy: '命中率',
  evasion: '闪避率',
};

export function EquipmentCard({
  equipment,
  selected = false,
  onClick,
  showStats = false,
  compact = false,
  canCraft = false,
}: EquipmentCardProps) {
  const typeCfg = TYPE_CONFIG[equipment.type];
  const TypeIcon = typeCfg.icon;
  const rarityColor = getRarityColor(equipment.rarity);
  const rarityClass = `rarity-${equipment.rarity}`;

  const { recipes, materials } = useGameStore();
  const recipe = canCraft ? recipes.find((r) => r.outputId === equipment.id) : undefined;

  return (
    <Card
      onClick={canCraft ? undefined : onClick}
      selected={selected}
      className={cn(rarityClass, 'border-2')}
    >
      <div className={cn('flex flex-col', compact ? 'gap-2' : 'gap-3')}>
        <div className="flex items-start justify-between">
          <div className={cn(
            'p-1.5 rounded-md bg-space-800/60 border border-ship-dark/60',
            typeCfg.color
          )}>
            <TypeIcon className={cn(compact ? 'w-4 h-4' : 'w-5 h-5')} />
          </div>
          <RarityStars rarity={equipment.rarity} size={compact ? 'sm' : 'md'} />
        </div>

        <div className={cn(
          'flex justify-center items-center relative mx-auto',
          compact ? 'w-16 h-16' : 'w-20 h-20'
        )}>
          <div
            className="absolute inset-0 rounded-xl opacity-50"
            style={{
              background: `radial-gradient(circle, ${rarityColor}40 0%, transparent 70%)`,
            }}
          />
          <div
            className={cn(
              'relative rounded-xl flex items-center justify-center border-2',
              compact ? 'w-14 h-14' : 'w-[72px] h-[72px]'
            )}
            style={{
              borderColor: `${rarityColor}80`,
              background: `linear-gradient(135deg, ${rarityColor}15 0%, ${rarityColor}05 100%)`,
              boxShadow: `0 0 16px ${rarityColor}30, inset 0 0 16px ${rarityColor}15`,
            }}
          >
            <EquipmentArt type={equipment.type} color={rarityColor} />
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h3 className={cn(
              'font-display font-semibold text-white',
              compact ? 'text-sm' : 'text-base'
            )}>
              {equipment.name}
            </h3>
            {equipment.equipped && (
              <span className="px-1.5 py-0.5 text-[9px] font-display rounded bg-life-green/20 text-life-green border border-life-green/40">
                已装备
              </span>
            )}
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className={cn(
              'px-2 py-0.5 rounded text-[10px] font-display font-bold',
              typeCfg.color,
              'bg-space-800/60 border border-ship-dark/50'
            )}>
              {typeCfg.label}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-display font-bold text-danger-yellow bg-space-800/60 border border-danger-yellow/30">
              Lv.{equipment.level}
            </span>
          </div>
        </div>

        {showStats && Object.keys(equipment.stats).length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-energy-cyan/15">
            {Object.entries(equipment.stats).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between px-2 py-1 rounded bg-space-800/40"
              >
                <div className="flex items-center gap-1.5">
                  <ArrowUp className="w-3 h-3 text-life-green" />
                  <span className="text-xs text-ship-silver">
                    {STAT_LABEL_MAP[key] ?? key}
                  </span>
                </div>
                <span className="font-display font-bold text-sm text-life-green">
                  +{value}
                </span>
              </div>
            ))}
          </div>
        )}

        {canCraft && recipe && (
          <div className="pt-3 mt-2 border-t border-energy-cyan/15 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ship-silver">成功率</span>
              <span className={cn(
                'font-display font-bold',
                recipe.successRate >= 80
                  ? 'text-life-green'
                  : recipe.successRate >= 50
                  ? 'text-danger-yellow'
                  : 'text-danger-red'
              )}>
                {recipe.successRate}%
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs mb-1">
              <Coins className="w-3.5 h-3.5 text-danger-yellow" />
              <span className="text-ship-silver">所需星币</span>
              <span className="ml-auto font-display font-bold text-danger-yellow">
                {recipe.starCoinCost}
              </span>
            </div>

            {recipe.materials.length > 0 && (
              <div>
                <div className="text-xs text-ship-silver mb-1.5">所需材料</div>
                <div className="flex flex-wrap gap-2">
                  {recipe.materials.map((mat) => {
                    const matData = materials.find((m) => m.id === mat.id);
                    return (
                      <div key={mat.id} className="flex items-center gap-1.5">
                        <MaterialItem
                          material={
                            matData ?? {
                              id: mat.id,
                              name: '未知材料',
                              rarity: 1,
                              quantity: 0,
                              icon: '?',
                              description: '',
                            }
                          }
                          size="sm"
                        />
                        <span className={cn(
                          'text-xs font-display font-bold',
                          (matData?.quantity ?? 0) >= mat.quantity
                            ? 'text-life-green'
                            : 'text-danger-red'
                        )}>
                          {matData?.quantity ?? 0}/{mat.quantity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Button variant="success" size="sm" className="w-full" onClick={onClick}>
              合成
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

export default EquipmentCard;
