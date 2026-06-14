import { useState, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Swords,
  Star,
  Check,
  AlertTriangle,
  Target,
  Package,
  Shield,
  Cpu,
  Crosshair,
  Zap,
  Cloud,
  Atom,
  CircleDot,
  Skull
} from 'lucide-react';
import { TopBar } from '../components/HUD/TopBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RarityStars } from '../components/ui/RarityStars';
import { useGameStore } from '../store/useGameStore';
import { cn } from '../lib/utils';
import { getRarityBgClass, getRarityTextClass } from '../utils/rarityColors';
import type { Stage, Ship as ShipType, ShipType as ShipTypeEnum, Rarity, EnvironmentTileType, EnvironmentTile } from '../types';

const SHIP_TYPE_LABEL: Record<ShipTypeEnum, string> = {
  battleship: '战列舰',
  cruiser: '巡洋舰',
  destroyer: '驱逐舰',
  carrier: '航母',
  support: '支援舰'
};

const ENV_META: Record<EnvironmentTileType, { label: string; icon: ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string }> = {
  asteroid: { label: '陨石带', icon: CircleDot, color: '#FF6B35' },
  nebula: { label: '星云', icon: Cloud, color: '#9D6CFF' },
  radiation: { label: '辐射区', icon: Atom, color: '#39FF14' },
  wormhole: { label: '虫洞', icon: Zap, color: '#00D4FF' },
  empty: { label: '空地', icon: CircleDot, color: '#8B9DC3' }
};

function MiniEnemyShip({ ship }: { ship: ShipType }) {
  const type: ShipTypeEnum = ship.type;
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border p-2.5 rarity-' + ship.rarity
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'w-9 h-9 shrink-0 rounded border flex items-center justify-center',
            getRarityBgClass(ship.rarity as Rarity),
            'border-danger-red/30'
          )}
        >
          <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none">
            <g stroke="#FF2E63" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {type === 'battleship' && (
                <>
                  <path d="M42 24 L34 16 L18 14 L8 20 L4 24 L8 28 L18 34 L34 32 Z" />
                  <path d="M30 20 L26 24 L30 28" />
                  <path d="M22 18 L16 24 L22 30" />
                </>
              )}
              {type === 'cruiser' && (
                <>
                  <path d="M40 24 L32 18 L16 17 L8 22 L6 24 L8 26 L16 31 L32 30 Z" />
                  <path d="M28 21 L23 24 L28 27" />
                </>
              )}
              {type === 'destroyer' && (
                <>
                  <path d="M38 24 L30 20 L14 19 L6 24 L14 29 L30 28 Z" />
                </>
              )}
              {type === 'carrier' && (
                <>
                  <path d="M42 22 L38 14 L10 13 L6 22 L6 26 L10 35 L38 34 L42 26 Z" />
                  <path d="M12 18 L36 18 M12 30 L36 30" />
                </>
              )}
              {type === 'support' && (
                <>
                  <path d="M38 24 L30 17 L16 17 L8 24 L16 31 L30 31 Z" />
                  <circle cx="24" cy="24" r="3" />
                </>
              )}
            </g>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <span
            className={cn(
              'block font-display font-semibold text-[11px] truncate',
              getRarityTextClass(ship.rarity as Rarity)
            )}
          >
            {ship.name}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] font-display text-ship-gray px-1 py-0.5 rounded bg-space-800 border border-ship-dark">
              {SHIP_TYPE_LABEL[type]}
            </span>
            <RarityStars rarity={ship.rarity as Rarity} size="sm" />
          </div>
          <div className="flex items-center gap-2 mt-1 text-[10px]">
            <div className="flex items-center gap-0.5 text-danger-red">
              <Crosshair className="w-2.5 h-2.5" />
              <span className="font-display">{ship.attack}</span>
            </div>
            <div className="flex items-center gap-0.5 text-life-green">
              <Shield className="w-2.5 h-2.5" />
              <span className="font-display">{ship.maxHp}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DifficultyStars({ difficulty }: { difficulty: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'w-4 h-4 drop-shadow-[0_0_3px]',
            i <= difficulty ? 'fill-danger-yellow' : 'opacity-20'
          )}
          style={{ color: i <= difficulty ? '#FFC93C' : undefined }}
        />
      ))}
    </div>
  );
}

function StageNode({
  stage,
  selected,
  onClick
}: {
  stage: Stage;
  selected: boolean;
  onClick: () => void;
}) {
  const { x, y, name, difficulty, unlocked, completed } = stage;

  const baseRadius = 4;
  let fill = '#3A4860';
  let stroke = '#5A6A8A';
  let glow = false;

  if (!unlocked) {
    fill = '#1E3A5F';
    stroke = '#3A4860';
  } else if (completed) {
    fill = '#FFC93C';
    stroke = '#FFC93C';
    glow = true;
  } else {
    fill = '#00D4FF';
    stroke = '#00D4FF';
    glow = true;
  }

  return (
    <g
      className="cursor-pointer"
      onClick={onClick}
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      {(unlocked && !completed) && (
        <circle
          r={baseRadius + 5}
          fill="none"
          stroke="#00D4FF"
          strokeWidth="1"
          opacity="0.6"
          className="origin-center"
        >
          <animate
            attributeName="r"
            from={baseRadius + 2}
            to={baseRadius + 8}
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.7"
            to="0"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      {(selected && glow) && (
        <circle
          r={baseRadius + 3}
          fill="none"
          stroke={completed ? '#FFC93C' : '#00D4FF'}
          strokeWidth="2"
          opacity="0.8"
        />
      )}
      <circle
        r={baseRadius}
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        filter={glow ? 'url(#nodeGlow)' : undefined}
        opacity={unlocked ? 1 : 0.5}
      />
      {completed && (
        <g transform="translate(-2.5, -2.5)">
          <path
            d="M1 2.5 L2 3.5 L4 1.5"
            stroke="#0A1628"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
      {!unlocked && (
        <g transform="translate(-1.5, -1.5)">
          <path
            d="M0 1.5 h3 v1.5 h-3 z M0.8 1.5 v-0.6 a0.7 0.7 0 0 1 1.4 0 v0.6"
            fill="#8B9DC3"
            opacity="0.8"
          />
        </g>
      )}
      <text
        y={baseRadius + 7}
        textAnchor="middle"
        className={cn(
          'font-display font-semibold text-[2.5px]',
          unlocked ? 'fill-white' : 'fill-ship-gray/60'
        )}
        style={{ textShadow: unlocked ? '0 0 3px rgba(0,0,0,0.9)' : undefined }}
      >
        {name}
      </text>
      <g transform={`translate(${-difficulty * 1.2}, ${-baseRadius - 3})`}>
        {Array.from({ length: difficulty }).map((_, i) => (
          <circle key={i} cx={i * 2.4} cy={0} r="0.8" fill="#FFC93C" opacity="0.9" />
        ))}
      </g>
    </g>
  );
}

export function StarMap() {
  const navigate = useNavigate();
  const stages = useGameStore((s) => s.stages);
  const materials = useGameStore((s) => s.materials);
  const equipments = useGameStore((s) => s.equipments);

  const [selectedStageId, setSelectedStageId] = useState<string | null>(
    stages.find((s) => s.unlocked)?.id || stages[0]?.id || null
  );
  const selectedStage = stages.find((s) => s.id === selectedStageId);

  const getEnvTypesFromTiles = (tiles: EnvironmentTile[]) => {
    const types = new Set<EnvironmentTileType>();
    tiles.forEach((t) => t.type !== 'empty' && types.add(t.type));
    return Array.from(types);
  };

  const envTypes = selectedStage ? getEnvTypesFromTiles(selectedStage.environment) : [];

  return (
    <div className="relative min-h-screen w-full bg-gradient-space overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.08)_0%,transparent_70%)]" />
      <TopBar />

      <div className="relative z-10 p-4 md:p-6 max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display font-black text-3xl md:text-4xl text-white text-glow tracking-wider mb-1">
              星图关卡
            </h2>
            <p className="text-sm text-ship-silver/80 font-display tracking-wide">
              选择关卡开始战斗
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            返回主菜单
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 md:gap-6">
          <div className="lg:col-span-7">
            <Card>
              <div className="relative w-full aspect-[5/4] rounded-lg overflow-hidden bg-space-950/80 border border-energy-cyan/10">
                <div className="absolute inset-0 opacity-40">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        'radial-gradient(1px 1px at 20% 30%, #fff, transparent), radial-gradient(1px 1px at 60% 70%, #fff, transparent), radial-gradient(1.5px 1.5px at 40% 50%, #00D4FF, transparent), radial-gradient(1px 1px at 80% 20%, #fff, transparent), radial-gradient(1px 1px at 10% 80%, #fff, transparent), radial-gradient(1.5px 1.5px at 90% 60%, #9D6CFF, transparent)',
                      backgroundSize: '100% 100%'
                    }}
                  />
                </div>

                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="xMidYMid meet"
                  className="absolute inset-0 w-full h-full"
                >
                  <defs>
                    <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="1.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <linearGradient id="connActive" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#00D4FF" stopOpacity="1" />
                      <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>

                  {stages.map((stage) =>
                    stage.connections.map((targetId) => {
                      const target = stages.find((s) => s.id === targetId);
                      if (!target) return null;
                      const isActive = stage.completed || target.completed;
                      const key = `${stage.id}-${targetId}`;
                      return (
                        <line
                          key={key}
                          x1={stage.x}
                          y1={stage.y}
                          x2={target.x}
                          y2={target.y}
                          stroke={isActive ? 'url(#connActive)' : '#3A4860'}
                          strokeWidth={isActive ? '0.8' : '0.4'}
                          strokeDasharray={isActive ? undefined : '1 1'}
                          opacity={isActive ? 0.9 : 0.5}
                          filter={isActive ? 'url(#nodeGlow)' : undefined}
                        />
                      );
                    })
                  )}

                  {stages.map((stage) => (
                    <StageNode
                      key={stage.id}
                      stage={stage}
                      selected={selectedStageId === stage.id}
                      onClick={() => setSelectedStageId(stage.id)}
                    />
                  ))}
                </svg>

                <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] font-display text-ship-silver/80">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-space-900/80 border border-ship-dark/60">
                    <div className="w-2.5 h-2.5 rounded-full bg-space-700 border border-ship-dark" />
                    <span>未解锁</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-space-900/80 border border-ship-dark/60">
                    <div className="w-2.5 h-2.5 rounded-full bg-energy-cyan shadow-[0_0_6px_#00D4FF]" />
                    <span>可挑战</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-space-900/80 border border-ship-dark/60">
                    <div className="w-2.5 h-2.5 rounded-full bg-danger-yellow shadow-[0_0_6px_#FFC93C]" />
                    <span>已通关</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {selectedStage ? (
              <>
                <Card
                  className={cn(
                    selectedStage.unlocked && !selectedStage.completed && 'shadow-glow'
                  )}
                >
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-display font-black text-xl text-white text-glow tracking-wide">
                        {selectedStage.name}
                      </h3>
                      {selectedStage.completed && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-danger-yellow/20 border border-danger-yellow/50">
                          <Check className="w-3 h-3 text-danger-yellow" />
                          <span className="text-[10px] font-display text-danger-yellow font-semibold">
                            已通关
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <DifficultyStars difficulty={selectedStage.difficulty} />
                      <span className="text-[11px] font-display text-ship-gray tracking-wider">
                        难度 {selectedStage.difficulty}/5
                      </span>
                    </div>
                    <p className="text-xs text-ship-silver/80 leading-relaxed">
                      {selectedStage.description}
                    </p>
                  </div>

                  <div className="border-t border-energy-cyan/20 pt-4 mt-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Skull className="w-4 h-4 text-danger-red" />
                      <h4 className="font-display font-semibold text-sm text-danger-red tracking-wide">
                        敌方情报
                      </h4>
                    </div>
                    <div className="space-y-2.5 rounded-lg bg-danger-red/5 border border-danger-red/20 p-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-ship-gray w-16 shrink-0">部队名称</span>
                        <span className="font-display font-semibold text-white">
                          {selectedStage.intel.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-ship-gray w-16 shrink-0">整体实力</span>
                        <span className="font-display text-danger-yellow">
                          {selectedStage.intel.strength}
                        </span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="text-ship-gray w-16 shrink-0 pt-0.5">已知弱点</span>
                        <div className="flex-1 flex flex-wrap gap-1.5">
                          {selectedStage.intel.weaknesses.map((w, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] bg-life-green/15 border border-life-green/30 text-life-green font-display"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>
                      {selectedStage.intel.warning && (
                        <div className="mt-2 flex items-start gap-2 rounded-md bg-danger-red/20 border border-danger-red/40 p-2">
                          <AlertTriangle className="w-4 h-4 text-danger-yellow shrink-0 mt-0.5" />
                          <span className="text-[11px] font-display text-danger-yellow leading-relaxed">
                            {selectedStage.intel.warning}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-energy-cyan/20 pt-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-energy-cyan" />
                      <h4 className="font-display font-semibold text-sm text-energy-cyan tracking-wide">
                        敌方舰队 ({selectedStage.enemyFleetTemplate.length}艘)
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {selectedStage.enemyFleetTemplate.map((es) => (
                        <MiniEnemyShip key={es.id} ship={es as ShipType} />
                      ))}
                    </div>
                  </div>

                  {envTypes.length > 0 && (
                    <div className="border-t border-energy-cyan/20 pt-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-energy-purple" />
                        <h4 className="font-display font-semibold text-sm text-energy-purple tracking-wide">
                          环境事件
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {envTypes.map((t) => {
                          const meta = ENV_META[t];
                          const Icon = meta.icon;
                          return (
                            <div
                              key={t}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-space-800/80 border border-ship-dark"
                            >
                              <Icon
                                className="w-3.5 h-3.5"
                                style={{ color: meta.color }}
                              />
                              <span
                                className="text-[11px] font-display"
                                style={{ color: meta.color }}
                              >
                                {meta.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-energy-cyan/20 pt-4 mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-4 h-4 text-danger-yellow" />
                      <h4 className="font-display font-semibold text-sm text-danger-yellow tracking-wide">
                        通关奖励
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-danger-yellow/10 border border-danger-yellow/30">
                          <Star className="w-3.5 h-3.5 text-danger-yellow fill-danger-yellow/30" />
                          <span className="text-xs font-display font-semibold text-danger-yellow">
                            {selectedStage.rewards.starCoins}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-life-green/10 border border-life-green/30">
                          <Zap className="w-3.5 h-3.5 text-life-green" />
                          <span className="text-xs font-display font-semibold text-life-green">
                            EXP {selectedStage.rewards.exp}
                          </span>
                        </div>
                      </div>
                      {selectedStage.rewards.materials &&
                        selectedStage.rewards.materials.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedStage.rewards.materials.map((m) => {
                              const matInfo = materials.find((x) => x.id === m.id);
                              return (
                                <div
                                  key={m.id}
                                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-space-800/80 border border-ship-dark"
                                >
                                  <Cpu className="w-3 h-3 text-ship-silver" />
                                  <span className="text-[10px] font-display text-ship-silver">
                                    {matInfo?.name || m.id}
                                  </span>
                                  <span className="text-[10px] font-display text-life-green">
                                    ×{m.quantity}
                                  </span>
                                  <span className="text-[9px] text-ship-gray">
                                    ({m.dropRate}%)
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      {selectedStage.rewards.equipment &&
                        selectedStage.rewards.equipment.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedStage.rewards.equipment.map((eq) => {
                              const eqInfo = equipments.find((x) => x.id === eq.id);
                              return (
                                <div
                                  key={eq.id}
                                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-space-800/80 border border-ship-dark"
                                >
                                  <Shield className="w-3 h-3 text-energy-cyan" />
                                  <span className="text-[10px] font-display text-energy-cyan">
                                    {eqInfo?.name || eq.id}
                                  </span>
                                  <span className="text-[9px] text-ship-gray">
                                    ({eq.dropRate}%)
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Button
                      size="lg"
                      variant="primary"
                      disabled={!selectedStage.unlocked}
                      className="animate-pulse-glow"
                      onClick={() => navigate(`/battle/${selectedStage.id}`)}
                    >
                      <Swords className="w-5 h-5 mr-2" />
                      开始战斗
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/')}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      返回
                    </Button>
                  </div>
                </Card>
              </>
            ) : (
              <Card>
                <div className="py-16 text-center">
                  <Target className="w-16 h-16 mx-auto text-ship-gray/40 mb-4" />
                  <p className="font-display text-ship-gray/60 tracking-wide">
                    点击星图上的节点查看关卡详情
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


