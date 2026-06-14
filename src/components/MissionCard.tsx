import { Coins, Check, Eye } from 'lucide-react';
import type { Mission, MissionType } from '../types';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { useGameStore } from '../store/useGameStore';
import { MaterialItem } from './MaterialItem';

interface MissionCardProps {
  mission: Mission;
  onClaim?: () => void;
}

const TYPE_CONFIG: Record<MissionType, { label: string; lineColor: string; badge: string }> = {
  main: {
    label: '主线',
    lineColor: 'bg-gradient-to-b from-energy-cyan via-energy-blue to-transparent',
    badge: 'bg-energy-cyan/20 text-energy-cyan border-energy-cyan/40',
  },
  side: {
    label: '支线',
    lineColor: 'bg-gradient-to-b from-life-green via-life-teal to-transparent',
    badge: 'bg-life-green/20 text-life-green border-life-green/40',
  },
  daily: {
    label: '每日',
    lineColor: 'bg-gradient-to-b from-danger-yellow via-danger-orange to-transparent',
    badge: 'bg-danger-yellow/20 text-danger-yellow border-danger-yellow/40',
  },
};

export function MissionCard({
  mission,
  onClaim,
}: MissionCardProps) {
  const typeCfg = TYPE_CONFIG[mission.type];
  const { materials } = useGameStore();

  const isCompleted = mission.progress >= mission.target;
  const canClaim = isCompleted && !mission.claimed;
  const percentage = Math.min(100, (mission.progress / mission.target) * 100);

  return (
    <Card className="relative overflow-hidden !p-0">
      <div className={cn(
        'absolute left-0 top-0 bottom-0 w-1',
        typeCfg.lineColor
      )} />

      <div className="pl-5 pr-4 py-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-display font-bold text-base text-white truncate">
                {mission.title}
              </h3>
              <span className={cn(
                'px-2 py-0.5 rounded text-[10px] font-display font-semibold border flex-shrink-0',
                typeCfg.badge
              )}>
                {typeCfg.label}
              </span>
            </div>
            <p className="text-xs text-ship-silver/80 line-clamp-2 leading-relaxed">
              {mission.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-ship-silver/70">任务进度</span>
              <span className={cn(
                'font-display font-bold',
                isCompleted ? 'text-life-green' : 'text-energy-cyan'
              )}>
                {Math.min(mission.progress, mission.target)}/{mission.target}
              </span>
            </div>
            <ProgressBar
              value={mission.progress}
              max={mission.target}
              color={isCompleted ? 'life' : 'energy'}
              height="md"
            />
          </div>
        </div>

        {(mission.rewards.starCoins || (mission.rewards.materials && mission.rewards.materials.length > 0)) && (
          <div className="pt-2 border-t border-energy-cyan/10">
            <div className="text-[10px] text-ship-silver/60 mb-2 font-medium tracking-wider">
              奖 励 预 览
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {mission.rewards.starCoins && mission.rewards.starCoins > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-space-800/60 border border-danger-yellow/30">
                  <Coins className="w-4 h-4 text-danger-yellow" />
                  <span className="font-display font-bold text-sm text-danger-yellow">
                    {mission.rewards.starCoins}
                  </span>
                </div>
              )}
              {mission.rewards.materials?.map((mat) => {
                const matData = materials.find((m) => m.id === mat.id);
                if (!matData) return null;
                return (
                  <div key={mat.id} className="flex items-center gap-1.5">
                    <MaterialItem
                      material={{ ...matData, quantity: mat.quantity }}
                      size="sm"
                    />
                  </div>
                );
              })}
              {mission.rewards.exp && mission.rewards.exp > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-space-800/60 border border-energy-blue/30">
                  <span className="font-display font-bold text-xs text-energy-blue">EXP</span>
                  <span className="font-display font-bold text-sm text-energy-blue">
                    +{mission.rewards.exp}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-1">
          {canClaim ? (
            <Button
              variant="success"
              size="sm"
              onClick={onClaim}
              className="animate-pulse"
            >
              <Check className="w-4 h-4 mr-1" />
              领取奖励
            </Button>
          ) : mission.claimed ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5">
              <Check className="w-4 h-4 text-life-green" />
              <span className="text-sm font-display font-semibold text-life-green">
                已领取
              </span>
            </div>
          ) : (
            <Button variant="ghost" size="sm" disabled>
              <Eye className="w-4 h-4 mr-1" />
              追踪中
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default MissionCard;
