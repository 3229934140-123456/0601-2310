import { useState, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  X,
  Shield,
  Zap,
  Cpu,
  Heart,
  Crosshair,
  Navigation,
  Users,
  Target,
  Gauge
} from 'lucide-react';
import { TopBar } from '../components/HUD/TopBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RarityStars } from '../components/ui/RarityStars';
import { useGameStore } from '../store/useGameStore';
import { cn } from '../lib/utils';
import { getRarityColor, getRarityBgClass, getRarityTextClass } from '../utils/rarityColors';
import type { Ship, Equipment, Crew, ShipType, EquipmentType, Rarity } from '../types';

const SHIP_TYPE_LABEL: Record<ShipType, string> = {
  battleship: '战列舰',
  cruiser: '巡洋舰',
  destroyer: '驱逐舰',
  carrier: '航母',
  support: '支援舰'
};

const EQUIP_TYPE_LABEL: Record<EquipmentType, string> = {
  weapon: '武器',
  shield: '护盾',
  module: '模块'
};

const CREW_ROLE_LABEL: Record<string, string> = {
  captain: '舰长',
  gunner: '炮手',
  engineer: '工程师',
  pilot: '飞行员',
  medic: '医疗官'
};

function MiniShipSprite({ type }: { type: ShipType }) {
  const color = '#00D4FF';
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
      <g stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {type === 'battleship' && (
          <>
            <path d="M6 24 L14 16 L30 14 L40 20 L44 24 L40 28 L30 34 L14 32 Z" />
            <path d="M18 20 L22 24 L18 28" />
            <path d="M26 18 L32 24 L26 30" />
          </>
        )}
        {type === 'cruiser' && (
          <>
            <path d="M8 24 L16 18 L32 17 L40 22 L42 24 L40 26 L32 31 L16 30 Z" />
            <path d="M20 21 L25 24 L20 27" />
            <path d="M30 20 L34 24 L30 28" />
          </>
        )}
        {type === 'destroyer' && (
          <>
            <path d="M10 24 L18 20 L34 19 L42 24 L34 29 L18 28 Z" />
            <path d="M22 22 L28 24 L22 26" />
          </>
        )}
        {type === 'carrier' && (
          <>
            <path d="M6 22 L10 14 L38 13 L42 22 L42 26 L38 35 L10 34 L6 26 Z" />
            <path d="M14 18 L36 18 M14 30 L36 30" />
          </>
        )}
        {type === 'support' && (
          <>
            <path d="M10 24 L18 17 L32 17 L40 24 L32 31 L18 31 Z" />
            <circle cx="24" cy="24" r="4" />
          </>
        )}
      </g>
      <circle cx="24" cy="24" r="2" fill={color} opacity="0.8" />
    </svg>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
  maxValue,
  color = 'cyan'
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  maxValue?: number;
  color?: 'cyan' | 'red' | 'green' | 'yellow';
}) {
  const pct = maxValue ? Math.min(100, (value / maxValue) * 100) : 0;
  const colorMap: Record<string, string> = {
    cyan: 'from-energy-cyan to-energy-blue',
    red: 'from-danger-red to-danger-orange',
    green: 'from-life-green to-life-teal',
    yellow: 'from-danger-yellow to-danger-orange'
  };
  const barColor = colorMap[color];

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="w-6 shrink-0 text-ship-silver">
        <Icon className="w-4 h-4" />
      </div>
      <span className="w-14 shrink-0 text-ship-silver font-display tracking-wide">{label}</span>
      {maxValue ? (
        <div className="flex-1 h-1.5 rounded-full bg-space-800 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all`}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
      <span className="w-14 text-right font-display font-semibold text-white shrink-0">
        {value}
        {maxValue && <span className="text-ship-gray">/{maxValue}</span>}
      </span>
    </div>
  );
}

function ShipCard({
  ship,
  selected,
  onClick,
  size = 'md',
  showRemove,
  onRemove
}: {
  ship: Ship;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showRemove?: boolean;
  onRemove?: () => void;
}) {
  const rarityClass = `rarity-${ship.rarity}`;
  const sizeClasses = {
    sm: 'p-2.5 min-w-[150px]',
    md: 'p-3 min-w-[180px]',
    lg: 'p-4'
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative hud-panel overflow-hidden cursor-pointer transition-all',
        rarityClass,
        sizeClasses[size],
        selected && 'shadow-glow ring-2 ring-energy-cyan',
        !selected && 'hover:border-energy-cyan/50'
      )}
    >
      {showRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="absolute top-1.5 right-1.5 z-20 w-6 h-6 rounded-full bg-danger-red/20 border border-danger-red/50 text-danger-red hover:bg-danger-red/40 flex items-center justify-center transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="flex items-start gap-3">
        <div
          className={cn(
            'shrink-0 rounded-lg border flex items-center justify-center',
            getRarityBgClass(ship.rarity),
            'border-energy-cyan/30'
          )}
        >
          <MiniShipSprite type={ship.type} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span
              className={cn(
                'font-display font-bold text-sm truncate',
                getRarityTextClass(ship.rarity)
              )}
              style={{ textShadow: `0 0 8px ${getRarityColor(ship.rarity)}50` }}
            >
              {ship.name}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-display tracking-wider text-ship-gray px-1.5 py-0.5 rounded bg-space-800 border border-ship-dark">
              {SHIP_TYPE_LABEL[ship.type]}
            </span>
            <RarityStars rarity={ship.rarity as Rarity} size="sm" />
          </div>
          {size === 'lg' ? (
            <div className="space-y-1.5 mt-2">
              <StatRow icon={Heart} label="生命" value={ship.hp} maxValue={ship.maxHp} color="green" />
              <StatRow icon={Shield} label="护盾" value={ship.shield} maxValue={ship.maxShield} color="cyan" />
              <StatRow icon={Crosshair} label="攻击" value={ship.attack} color="red" />
              <StatRow icon={Shield} label="防御" value={ship.defense} color="yellow" />
              <StatRow icon={Gauge} label="速度" value={ship.speed} color="cyan" />
              <StatRow icon={Navigation} label="机动" value={ship.moveRange} color="cyan" />
              <StatRow icon={Target} label="射程" value={ship.attackRange} color="red" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-ship-silver">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-life-green" />
                <span className="font-display">{ship.maxHp}</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-energy-cyan" />
                <span className="font-display">{ship.maxShield}</span>
              </div>
              <div className="flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-danger-red" />
                <span className="font-display">{ship.attack}</span>
              </div>
              <div className="flex items-center gap-1">
                <Gauge className="w-3 h-3 text-energy-blue" />
                <span className="font-display">{ship.speed}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EquipmentCard({
  equipment,
  onClick,
  selected,
  showEmpty,
  emptyText,
  emptyIcon: EmptyIcon
}: {
  equipment?: Equipment;
  onClick?: () => void;
  selected?: boolean;
  showEmpty?: boolean;
  emptyText?: string;
  emptyIcon?: ComponentType<{ className?: string }>;
}) {
  if (!equipment && showEmpty) {
    const Icon = EmptyIcon || Plus;
    return (
      <div
        onClick={onClick}
        className={cn(
          'hud-panel p-3 cursor-pointer transition-all border-dashed hover:border-energy-cyan/60 hover:bg-energy-cyan/5',
          selected && 'shadow-glow ring-2 ring-energy-cyan'
        )}
      >
        <div className="flex flex-col items-center justify-center text-center py-3 text-ship-gray">
          <div className="w-10 h-10 rounded-lg border border-dashed border-ship-gray/50 flex items-center justify-center mb-2">
            <Icon className="w-5 h-5 opacity-60" />
          </div>
          <span className="text-xs font-display tracking-wide">{emptyText || '未装备'}</span>
        </div>
      </div>
    );
  }
  if (!equipment) return null;

  const IconComp =
    equipment.type === 'weapon' ? Crosshair : equipment.type === 'shield' ? Shield : Cpu;

  return (
    <div
      onClick={onClick}
      className={cn(
        'hud-panel p-3 cursor-pointer transition-all rarity-' + equipment.rarity,
        selected && 'shadow-glow ring-2 ring-energy-cyan'
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            'w-10 h-10 shrink-0 rounded-lg border flex items-center justify-center',
            getRarityBgClass(equipment.rarity),
            'border-energy-cyan/30'
          )}
        >
          <IconComp
            className="w-5 h-5"
            style={{ color: getRarityColor(equipment.rarity as Rarity) }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span
              className={cn(
                'font-display font-semibold text-xs truncate',
                getRarityTextClass(equipment.rarity as Rarity)
              )}
            >
              {equipment.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-display tracking-wider text-ship-gray px-1.5 py-0.5 rounded bg-space-800 border border-ship-dark">
              {EQUIP_TYPE_LABEL[equipment.type]}
            </span>
            <RarityStars rarity={equipment.rarity as Rarity} size="sm" />
          </div>
          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
            {Object.entries(equipment.stats).slice(0, 3).map(([k, v]) => (
              <span key={k} className="text-[10px] text-ship-silver">
                <span className="text-life-green">+{v}</span>
                <span className="text-ship-gray ml-0.5">{k}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CrewCard({
  crew,
  onClick,
  onUnassign,
  showEmpty,
  emptyText
}: {
  crew?: Crew;
  onClick?: () => void;
  onUnassign?: () => void;
  showEmpty?: boolean;
  emptyText?: string;
}) {
  if (!crew && showEmpty) {
    return (
      <div
        onClick={onClick}
        className="hud-panel p-3 cursor-pointer transition-all border-dashed hover:border-energy-cyan/60 hover:bg-energy-cyan/5"
      >
        <div className="flex flex-col items-center justify-center text-center py-2 text-ship-gray">
          <div className="w-9 h-9 rounded-full border border-dashed border-ship-gray/50 flex items-center justify-center mb-1.5">
            <Users className="w-4 h-4 opacity-60" />
          </div>
          <span className="text-xs font-display tracking-wide">{emptyText || '空闲槽位'}</span>
        </div>
      </div>
    );
  }
  if (!crew) return null;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative hud-panel p-3 cursor-pointer transition-all rarity-' + crew.rarity,
        'hover:border-energy-cyan/50'
      )}
    >
      {onUnassign && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUnassign();
          }}
          className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-danger-red/20 border border-danger-red/40 text-danger-red hover:bg-danger-red/40 flex items-center justify-center transition-all"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'w-10 h-10 shrink-0 rounded-full border-2 flex items-center justify-center',
            getRarityBgClass(crew.rarity as Rarity)
          )}
          style={{ borderColor: getRarityColor(crew.rarity as Rarity) + '80' }}
        >
          <span
            className={cn(
              'font-display font-bold text-xs',
              getRarityTextClass(crew.rarity as Rarity)
            )}
          >
            {crew.name.slice(0, 2)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <span
            className={cn(
              'block font-display font-semibold text-xs truncate mb-0.5',
              getRarityTextClass(crew.rarity as Rarity)
            )}
          >
            {crew.name}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-display tracking-wider text-ship-gray px-1.5 py-0.5 rounded bg-space-800 border border-ship-dark">
              {CREW_ROLE_LABEL[crew.role] || crew.role}
            </span>
            <span className="text-[10px] font-display text-ship-silver">Lv.{crew.level}</span>
            <RarityStars rarity={crew.rarity as Rarity} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FleetFormation() {
  const navigate = useNavigate();
  const ships = useGameStore((s) => s.ships);
  const activeFleetIds = useGameStore((s) => s.activeFleetIds);
  const setActiveFleet = useGameStore((s) => s.setActiveFleet);
  const equipments = useGameStore((s) => s.equipments);
  const crews = useGameStore((s) => s.crews);
  const equipEquipment = useGameStore((s) => s.equipEquipment);
  const unequipEquipment = useGameStore((s) => s.unequipEquipment);
  const assignCrewToShip = useGameStore((s) => s.assignCrewToShip);
  const unassignCrew = useGameStore((s) => s.unassignCrew);

  const [selectedShipId, setSelectedShipId] = useState<string | null>(
    activeFleetIds[0] || ships[0]?.id || null
  );
  const [activeEquipSlot, setActiveEquipSlot] = useState<EquipmentType | null>(null);
  const [activeCrewSlot, setActiveCrewSlot] = useState<number | null>(null);

  const selectedShip = ships.find((s) => s.id === selectedShipId);
  const activeFleetShips = activeFleetIds
    .map((id) => ships.find((s) => s.id === id))
    .filter((s): s is Ship => !!s);

  const handleAddToFleet = (shipId: string) => {
    if (activeFleetIds.includes(shipId)) return;
    if (activeFleetIds.length >= 4) return;
    const newIds = [...activeFleetIds, shipId];
    setActiveFleet(newIds);
  };

  const handleRemoveFromFleet = (shipId: string) => {
    const newIds = activeFleetIds.filter((id) => id !== shipId);
    setActiveFleet(newIds);
    if (selectedShipId === shipId) {
      setSelectedShipId(newIds[0] || ships[0]?.id || null);
    }
  };

  const handleEquip = (equipmentId: string) => {
    if (!selectedShip || !activeEquipSlot) return;
    equipEquipment(selectedShip.id, equipmentId);
    setActiveEquipSlot(null);
  };

  const handleUnequip = (type: EquipmentType) => {
    if (!selectedShip) return;
    unequipEquipment(selectedShip.id, type);
  };

  const handleAssignCrew = (crewId: string, slotIdx: number) => {
    if (!selectedShip) return;
    if (selectedShip.crewIds.length > slotIdx) {
      unassignCrew(selectedShip.crewIds[slotIdx]);
    }
    assignCrewToShip(crewId, selectedShip.id);
    setActiveCrewSlot(null);
  };

  const shipCrews = selectedShip
    ? selectedShip.crewIds
        .map((cid) => crews.find((c) => c.id === cid))
        .filter((c): c is Crew => !!c)
    : [];

  const availableEquipments = activeEquipSlot
    ? equipments.filter(
        (e) => e.type === activeEquipSlot && (!e.equipped || e.shipId === selectedShipId)
      )
    : [];

  const availableCrews = crews.filter(
    (c) =>
      !c.shipId &&
      c.level > 0 &&
      (!selectedShip?.crewIds.includes(c.id) || activeCrewSlot !== null)
  );

  const weapon = selectedShip?.weaponId
    ? equipments.find((e) => e.id === selectedShip.weaponId)
    : undefined;
  const shieldEq = selectedShip?.shieldModuleId
    ? equipments.find((e) => e.id === selectedShip.shieldModuleId)
    : undefined;
  const moduleEquipments = selectedShip?.moduleIds
    ? selectedShip.moduleIds.map((id) => equipments.find((e) => e.id === id)).filter(Boolean)
    : [];

  return (
    <div className="relative min-h-screen w-full bg-gradient-space overflow-hidden">
      <TopBar />

      <div className="relative z-10 p-4 md:p-6 max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display font-black text-3xl md:text-4xl text-white text-glow tracking-wider mb-1">
              舰队编成
            </h2>
            <p className="text-sm text-ship-silver/80 font-display tracking-wide">
              配置出战舰队（最多4艘）
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>
            返回主菜单
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 md:gap-6">
          <div className="lg:col-span-6 space-y-5">
            <Card
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-energy-cyan" />
                    <span>出战舰队</span>
                    <span className="text-xs text-ship-gray ml-2 font-display">
                      {activeFleetIds.length}/4 槽位
                    </span>
                  </div>
                </div>
              }
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((idx) => {
                  const ship = activeFleetShips[idx];
                  return (
                    <div key={idx} className="relative">
                      <div className="absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full bg-space-900 border border-energy-cyan/50 flex items-center justify-center text-[11px] font-display font-bold text-energy-cyan shadow-glow">
                        {idx + 1}
                      </div>
                      {ship ? (
                        <ShipCard
                          ship={ship}
                          selected={selectedShipId === ship.id}
                          onClick={() => setSelectedShipId(ship.id)}
                          size="sm"
                          showRemove
                          onRemove={() => handleRemoveFromFleet(ship.id)}
                        />
                      ) : (
                        <div
                          onClick={() => {
                            const firstAvail = ships.find((s) => !activeFleetIds.includes(s.id));
                            if (firstAvail && activeFleetIds.length < 4) {
                              handleAddToFleet(firstAvail.id);
                            }
                          }}
                          className="hud-panel p-3 min-h-[140px] cursor-pointer transition-all border-dashed hover:border-energy-cyan/60 hover:bg-energy-cyan/5 flex flex-col items-center justify-center text-center"
                        >
                          <div className="w-12 h-12 rounded-lg border-2 border-dashed border-energy-cyan/40 flex items-center justify-center mb-2">
                            <Plus className="w-6 h-6 text-energy-cyan/70" />
                          </div>
                          <span className="text-xs font-display tracking-wide text-ship-silver">
                            添加舰船
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card
              title={
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-energy-cyan" />
                  <span>舰船储备库</span>
                  <span className="text-xs text-ship-gray ml-2 font-display">
                    共 {ships.length} 艘
                  </span>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {ships.map((ship) => {
                  const inFleet = activeFleetIds.includes(ship.id);
                  return (
                    <div key={ship.id} className="relative">
                      {inFleet && (
                        <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-life-green/20 border border-life-green/40 text-[10px] font-display font-semibold text-life-green">
                          出战中
                        </div>
                      )}
                      <ShipCard
                        ship={ship}
                        selected={selectedShipId === ship.id}
                        onClick={() => {
                          setSelectedShipId(ship.id);
                          if (!inFleet && activeFleetIds.length < 4) {
                            handleAddToFleet(ship.id);
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <Card
              title={
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-energy-cyan" />
                  <span>舰船详情</span>
                </div>
              }
            >
              {selectedShip ? (
                <ShipCard ship={selectedShip} size="lg" />
              ) : (
                <div className="py-10 text-center text-ship-gray">
                  <p className="font-display text-sm">请选择一艘舰船查看详情</p>
                </div>
              )}
            </Card>

            <Card
              title={
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-energy-cyan" />
                  <span>装备配置</span>
                </div>
              }
            >
              <div className="space-y-2.5">
                <div className="relative">
                  <div className="text-[11px] font-display tracking-wider text-energy-cyan mb-1.5 flex items-center gap-1.5">
                    <Crosshair className="w-3 h-3" /> 武器槽
                    {weapon && (
                      <button
                        onClick={() => handleUnequip('weapon')}
                        className="ml-auto text-[10px] text-danger-red/80 hover:text-danger-red"
                      >
                        卸下
                      </button>
                    )}
                  </div>
                  <EquipmentCard
                    equipment={weapon}
                    showEmpty={!weapon}
                    emptyIcon={Crosshair}
                    emptyText="点击装备武器"
                    onClick={() => setActiveEquipSlot(activeEquipSlot === 'weapon' ? null : 'weapon')}
                    selected={activeEquipSlot === 'weapon'}
                  />
                  {activeEquipSlot === 'weapon' && (
                    <div className="mt-2 p-2 rounded-lg bg-space-900/80 border border-energy-cyan/30 max-h-40 overflow-y-auto space-y-1.5">
                      {availableEquipments.length === 0 && (
                        <p className="text-xs text-ship-gray text-center py-2">暂无可用武器</p>
                      )}
                      {availableEquipments.map((eq) => (
                        <div
                          key={eq.id}
                          onClick={() => handleEquip(eq.id)}
                          className="p-2 rounded border border-transparent hover:border-energy-cyan/50 hover:bg-energy-cyan/10 cursor-pointer transition-all"
                        >
                          <EquipmentCard equipment={eq} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="text-[11px] font-display tracking-wider text-energy-cyan mb-1.5 flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> 护盾槽
                    {shieldEq && (
                      <button
                        onClick={() => handleUnequip('shield')}
                        className="ml-auto text-[10px] text-danger-red/80 hover:text-danger-red"
                      >
                        卸下
                      </button>
                    )}
                  </div>
                  <EquipmentCard
                    equipment={shieldEq}
                    showEmpty={!shieldEq}
                    emptyIcon={Shield}
                    emptyText="点击装备护盾"
                    onClick={() => setActiveEquipSlot(activeEquipSlot === 'shield' ? null : 'shield')}
                    selected={activeEquipSlot === 'shield'}
                  />
                  {activeEquipSlot === 'shield' && (
                    <div className="mt-2 p-2 rounded-lg bg-space-900/80 border border-energy-cyan/30 max-h-40 overflow-y-auto space-y-1.5">
                      {availableEquipments.length === 0 && (
                        <p className="text-xs text-ship-gray text-center py-2">暂无可用护盾</p>
                      )}
                      {availableEquipments.map((eq) => (
                        <div
                          key={eq.id}
                          onClick={() => handleEquip(eq.id)}
                          className="p-2 rounded border border-transparent hover:border-energy-cyan/50 hover:bg-energy-cyan/10 cursor-pointer transition-all"
                        >
                          <EquipmentCard equipment={eq} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="text-[11px] font-display tracking-wider text-energy-cyan mb-1.5 flex items-center gap-1.5">
                    <Cpu className="w-3 h-3" /> 模块槽
                    {(moduleEquipments.length > 0) && (
                      <button
                        onClick={() => handleUnequip('module')}
                        className="ml-auto text-[10px] text-danger-red/80 hover:text-danger-red"
                      >
                        全部卸下
                      </button>
                    )}
                  </div>
                  <EquipmentCard
                    equipment={moduleEquipments[0]}
                    showEmpty={!moduleEquipments[0]}
                    emptyIcon={Cpu}
                    emptyText="点击装备模块"
                    onClick={() => setActiveEquipSlot(activeEquipSlot === 'module' ? null : 'module')}
                    selected={activeEquipSlot === 'module'}
                  />
                  {activeEquipSlot === 'module' && (
                    <div className="mt-2 p-2 rounded-lg bg-space-900/80 border border-energy-cyan/30 max-h-40 overflow-y-auto space-y-1.5">
                      {availableEquipments.length === 0 && (
                        <p className="text-xs text-ship-gray text-center py-2">暂无可用模块</p>
                      )}
                      {availableEquipments.map((eq) => (
                        <div
                          key={eq.id}
                          onClick={() => handleEquip(eq.id)}
                          className="p-2 rounded border border-transparent hover:border-energy-cyan/50 hover:bg-energy-cyan/10 cursor-pointer transition-all"
                        >
                          <EquipmentCard equipment={eq} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card
              title={
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-energy-cyan" />
                  <span>舰员分配</span>
                  <span className="text-xs text-ship-gray ml-2 font-display">
                    {shipCrews.length}/2
                  </span>
                </div>
              }
            >
              <div className="grid grid-cols-2 gap-2.5">
                {[0, 1].map((slotIdx) => {
                  const crew = shipCrews[slotIdx];
                  const isActive = activeCrewSlot === slotIdx;
                  return (
                    <div key={slotIdx} className="relative">
                      <div className="absolute -top-1.5 -left-1.5 z-10 w-5 h-5 rounded-full bg-space-900 border border-energy-cyan/50 flex items-center justify-center text-[10px] font-display font-bold text-energy-cyan">
                        {slotIdx + 1}
                      </div>
                      {crew ? (
                        <CrewCard
                          crew={crew}
                          onUnassign={() => unassignCrew(crew.id)}
                          onClick={() => setActiveCrewSlot(isActive ? null : slotIdx)}
                        />
                      ) : (
                        <CrewCard
                          showEmpty
                          emptyText="点击分配舰员"
                          onClick={() => setActiveCrewSlot(isActive ? null : slotIdx)}
                        />
                      )}
                      {isActive && (
                        <div className="mt-2 p-2 rounded-lg bg-space-900/80 border border-energy-cyan/30 max-h-52 overflow-y-auto space-y-1.5">
                          {availableCrews.length === 0 && (
                            <p className="text-xs text-ship-gray text-center py-3">
                              暂无空闲舰员
                            </p>
                          )}
                          {availableCrews.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => handleAssignCrew(c.id, slotIdx)}
                              className="rounded border border-transparent hover:border-energy-cyan/50 hover:bg-energy-cyan/10 cursor-pointer transition-all"
                            >
                              <CrewCard crew={c} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


