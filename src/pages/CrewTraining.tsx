import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Crown,
  Crosshair,
  Wrench,
  Plane,
  Heart,
  Star,
  Users,
  Sparkles,
  RefreshCw,
  ChevronDown,
  Coins,
  ArrowUp
} from 'lucide-react';
import { TopBar } from '../components/HUD/TopBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { CrewCard } from '../components/CrewCard';
import { useGameStore } from '../store/useGameStore';
import { useUIGlobalStore } from '../store/useUIGlobalStore';
import { cn } from '../lib/utils';
import { getRarityColor } from '../utils/rarityColors';
import type { Crew, CrewRole, Talent } from '../types';
import { CREWS } from '../data/crews';

const ROLE_FILTERS: { key: CrewRole | 'all'; label: string; icon: typeof Crown }[] = [
  { key: 'all', label: '全部', icon: Users },
  { key: 'captain', label: '舰长', icon: Crown },
  { key: 'gunner', label: '炮手', icon: Crosshair },
  { key: 'engineer', label: '工程师', icon: Wrench },
  { key: 'pilot', label: '飞行员', icon: Plane },
  { key: 'medic', label: '医疗官', icon: Heart },
];

const STAT_KEYS = ['leadership', 'gunnery', 'engineering', 'piloting', 'medical'] as const;
const STAT_LABELS: Record<typeof STAT_KEYS[number], string> = {
  leadership: '指挥',
  gunnery: '炮术',
  engineering: '工程',
  piloting: '驾驶',
  medical: '医疗',
};

const RARITY_RECRUIT_COST: Record<number, number> = {
  1: 500,
  2: 1000,
  3: 2500,
  4: 5000,
  5: 15000,
};

function RadarChart({ stats }: { stats: Crew['stats'] }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 100;
  const ticks = [0.25, 0.5, 0.75, 1];
  const maxStat = 100;

  const angleForIndex = (i: number) => (Math.PI * 2 * i) / STAT_KEYS.length - Math.PI / 2;

  const pointForStat = (key: typeof STAT_KEYS[number], scale = 1) => {
    const idx = STAT_KEYS.indexOf(key);
    const angle = angleForIndex(idx);
    const value = Math.min(stats[key], maxStat) / maxStat;
    const r = maxRadius * value * scale;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    };
  };

  const polygonPoints = STAT_KEYS.map((k) => {
    const p = pointForStat(k);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto">
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.1" />
        </radialGradient>
      </defs>

      {ticks.map((t, i) => (
        <polygon
          key={i}
          points={STAT_KEYS.map((_, idx) => {
            const angle = angleForIndex(idx);
            const r = maxRadius * t;
            return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
          }).join(' ')}
          fill="none"
          stroke="rgba(0, 212, 255, 0.15)"
          strokeWidth="1"
        />
      ))}

      {STAT_KEYS.map((_, idx) => {
        const angle = angleForIndex(idx);
        const x2 = cx + Math.cos(angle) * maxRadius;
        const y2 = cy + Math.sin(angle) * maxRadius;
        return (
          <line
            key={idx}
            x1={cx}
            y1={cy}
            x2={x2}
            y2={y2}
            stroke="rgba(0, 212, 255, 0.2)"
            strokeWidth="1"
          />
        );
      })}

      <polygon
        points={polygonPoints}
        fill="url(#radarFill)"
        stroke="#00D4FF"
        strokeWidth="2"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))' }}
      />

      {STAT_KEYS.map((key, idx) => {
        const p = pointForStat(key);
        const labelAngle = angleForIndex(idx);
        const labelR = maxRadius + 24;
        const lx = cx + Math.cos(labelAngle) * labelR;
        const ly = cy + Math.sin(labelAngle) * labelR;
        return (
          <g key={key}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#00D4FF"
              style={{ filter: 'drop-shadow(0 0 6px #00D4FF)' }}
            />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-energy-cyan"
              style={{ fontSize: '11px', fontFamily: 'Orbitron, sans-serif', fontWeight: 600 }}
            >
              {STAT_LABELS[key]} {stats[key]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface TalentNodeDef {
  id: string;
  name: string;
  description: string;
  tier: number;
  requires: string[];
  cost: number;
  icon: string;
  effect: Record<string, number>;
  x: number;
  y: number;
}

function TalentTreeSVG({
  talents,
  onUpgrade,
  selectedTalent,
  setSelectedTalent,
  starCoins,
}: {
  talents: Talent[];
  onUpgrade: (tid: string) => void;
  selectedTalent: Talent | null;
  setSelectedTalent: (t: Talent | null) => void;
  starCoins: number;
}) {
  const width = 600;
  const height = 380;

  const defaultLayout: TalentNodeDef[] = useMemo(() => {
    const baseTalents: TalentNodeDef[] = [
      { id: 'root', name: '基础天赋', description: '天赋根基', tier: 0, requires: [], cost: 0, icon: '★', effect: {}, x: 300, y: 45 },
      { id: 't1_left', name: '专精强化', description: '提升主属性5%', tier: 1, requires: ['root'], cost: 1000, icon: '⚔', effect: { mainStat: 5 }, x: 140, y: 125 },
      { id: 't1_mid', name: '战术领悟', description: '全属性+3', tier: 1, requires: ['root'], cost: 1500, icon: '◈', effect: { allStat: 3 }, x: 300, y: 125 },
      { id: 't1_right', name: '生存本能', description: '最大生命值+8%', tier: 1, requires: ['root'], cost: 1000, icon: '✦', effect: { maxHp: 8 }, x: 460, y: 125 },
      { id: 't2_1', name: '暴击精通', description: '暴击率+12%', tier: 2, requires: ['t1_left'], cost: 2500, icon: '✧', effect: { critRate: 12 }, x: 80, y: 215 },
      { id: 't2_2', name: '致命打击', description: '暴击伤害+20%', tier: 2, requires: ['t1_left', 't1_mid'], cost: 3000, icon: '⚡', effect: { critDamage: 20 }, x: 210, y: 215 },
      { id: 't2_3', name: '元素掌控', description: '技能冷却-15%', tier: 2, requires: ['t1_mid', 't1_right'], cost: 3000, icon: '⟁', effect: { cooldownReduction: 15 }, x: 390, y: 215 },
      { id: 't2_4', name: '坚韧护甲', description: '防御力+15%', tier: 2, requires: ['t1_right'], cost: 2500, icon: '⛨', effect: { defense: 15 }, x: 520, y: 215 },
      { id: 't3_left', name: '终极觉醒', description: '全属性+10%, 技能效果+25%', tier: 3, requires: ['t2_1', 't2_2'], cost: 8000, icon: '✪', effect: { allStat: 10, skillPower: 25 }, x: 200, y: 315 },
      { id: 't3_right', name: '星域霸主', description: '最大生命+15%, 防御+10%, 攻击+10%', tier: 3, requires: ['t2_3', 't2_4'], cost: 8000, icon: '❖', effect: { maxHp: 15, defense: 10, attack: 10 }, x: 400, y: 315 },
    ];
    return baseTalents;
  }, []);

  const mergedNodes = useMemo(() => {
    return defaultLayout.map((def) => {
      const existing = talents.find((t) => t.id === def.id);
      if (existing) {
        return { ...def, ...existing, unlocked: existing.unlocked };
      }
      if (def.id === 'root') {
        return { ...def, unlocked: true };
      }
      return { ...def, unlocked: false };
    });
  }, [defaultLayout, talents]);

  const connections: { from: string; to: string }[] = [];
  mergedNodes.forEach((node) => {
    node.requires.forEach((reqId) => {
      connections.push({ from: reqId, to: node.id });
    });
  });

  const getNode = (id: string) => mergedNodes.find((n) => n.id === id);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="talentLineActive" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#39FF14" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {connections.map((conn, idx) => {
          const from = getNode(conn.from);
          const to = getNode(conn.to);
          if (!from || !to) return null;
          const isActive = from.unlocked && to.unlocked;
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2 - 20;
          const d = `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
          return (
            <path
              key={idx}
              d={d}
              fill="none"
              stroke={isActive ? 'url(#talentLineActive)' : 'rgba(100, 116, 139, 0.35)'}
              strokeWidth={isActive ? 3 : 2}
              strokeDasharray={isActive ? 'none' : '6 4'}
              style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(0, 212, 255, 0.6))' } : {}}
            />
          );
        })}

        {mergedNodes.map((node) => {
          const isUnlocked = node.unlocked;
          const prereqsMet = node.requires.every((r) => getNode(r)?.unlocked);
          const canAfford = starCoins >= node.cost;
          const canUnlock = !isUnlocked && prereqsMet && canAfford && node.tier > 0;
          const isSelected = selectedTalent?.id === node.id;
          const color = isUnlocked ? '#00D4FF' : canUnlock ? '#FFC93C' : '#64748B';
          const r = node.tier === 0 ? 26 : node.tier === 3 ? 24 : 20;

          return (
            <g
              key={node.id}
              onClick={() => {
                if (canUnlock) {
                  onUpgrade(node.id);
                }
                setSelectedTalent({
                  id: node.id,
                  name: node.name,
                  description: node.description,
                  unlocked: isUnlocked,
                  tier: node.tier as Talent['tier'],
                  requires: node.requires,
                  effect: node.effect,
                  cost: Math.ceil(node.cost / 1000),
                });
              }}
              className={cn(canUnlock && 'cursor-pointer')}
              style={{ cursor: node.tier > 0 ? 'pointer' : 'default' }}
            >
              {isUnlocked && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r + 10}
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  opacity="0.3"
                  className="animate-pulse"
                />
              )}

              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill={isUnlocked ? 'rgba(0, 212, 255, 0.2)' : 'rgba(15, 23, 42, 0.9)'}
                stroke={color}
                strokeWidth={isSelected ? 3 : 2}
                style={{
                  filter: isUnlocked
                    ? `drop-shadow(0 0 12px ${color}99)`
                    : isSelected
                    ? `drop-shadow(0 0 8px ${color}80)`
                    : 'none',
                }}
              />

              {canUnlock && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r - 4}
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.7"
                />
              )}

              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: node.tier === 0 ? '18px' : node.tier === 3 ? '16px' : '14px',
                  fill: color,
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 700,
                  textShadow: isUnlocked ? `0 0 8px ${color}` : 'none',
                }}
              >
                {node.icon}
              </text>

              <text
                x={node.x}
                y={node.y + r + 16}
                textAnchor="middle"
                style={{
                  fontSize: '11px',
                  fill: isUnlocked ? '#00D4FF' : prereqsMet ? '#CBD5E1' : '#64748B',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 600,
                }}
              >
                {node.name}
              </text>

              {node.tier > 0 && (
                <text
                  x={node.x}
                  y={node.y + r + 30}
                  textAnchor="middle"
                  style={{
                    fontSize: '9px',
                    fill: isUnlocked ? '#39FF14' : canAfford ? '#FFC93C' : '#FF2E63',
                    fontFamily: 'Orbitron, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  {isUnlocked ? '✓ 已解锁' : `${node.cost} ★`}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function CrewTraining() {
  const crews = useGameStore((s) => s.crews);
  const ships = useGameStore((s) => s.ships);
  const starCoins = useGameStore((s) => s.profile.starCoins);
  const assignCrewToShip = useGameStore((s) => s.assignCrewToShip);
  const unassignCrew = useGameStore((s) => s.unassignCrew);
  const upgradeTalent = useGameStore((s) => s.upgradeTalent);
  const recruitCrew = useGameStore((s) => s.recruitCrew);
  const spendStarCoins = useGameStore((s) => s.spendStarCoins);

  const addToast = useUIGlobalStore((s) => s.addToast);

  const [selectedRole, setSelectedRole] = useState<CrewRole | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedCrewId, setSelectedCrewId] = useState<string | null>(crews[0]?.id ?? null);
  const [activeTab, setActiveTab] = useState<'detail' | 'talent' | 'recruit'>('detail');
  const [assignShipOpen, setAssignShipOpen] = useState(false);

  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [recruitPool, setRecruitPool] = useState<Crew[]>([]);

  const selectedCrew = crews.find((c) => c.id === selectedCrewId) ?? null;

  const filteredCrews = useMemo(() => {
    return crews.filter((c) => {
      if (selectedRole !== 'all' && c.role !== selectedRole) return false;
      if (searchText && !c.name.toLowerCase().includes(searchText.toLowerCase())) return false;
      return true;
    });
  }, [crews, selectedRole, searchText]);

  const rollRecruitRarity = (): number => {
    const r = Math.random() * 100;
    if (r < 3) return 5;
    if (r < 15) return 4;
    if (r < 40) return 3;
    if (r < 75) return 2;
    return 1;
  };

  const generateRecruitPool = () => {
    const pool: Crew[] = [];
    const used = new Set<string>();

    for (let i = 0; i < 3; i++) {
      const rarity = rollRecruitRarity();
      const candidates = CREWS.filter(
        (c) =>
          c.rarity === rarity &&
          !used.has(c.id) &&
          !crews.some((owned) => owned.id === `player-${c.id}`)
      );
      let template;
      if (candidates.length > 0) {
        template = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        const fallback = CREWS.filter(
          (c) => !used.has(c.id) && !crews.some((owned) => owned.id === `player-${c.id}`)
        );
        if (fallback.length === 0) {
          template = CREWS[Math.floor(Math.random() * CREWS.length)];
        } else {
          template = fallback[Math.floor(Math.random() * fallback.length)];
        }
      }
      used.add(template.id);
      pool.push({ ...template, talents: template.talents.map((t) => ({ ...t })), skills: template.skills.map((s) => ({ ...s })) });
    }
    setRecruitPool(pool);
  };

  useEffect(() => {
    if (activeTab === 'recruit' && recruitPool.length === 0) {
      generateRecruitPool();
    }
  }, [activeTab]);

  const handleGainExp = () => {
    if (!selectedCrew) return;
    if (!spendStarCoins(1000)) {
      addToast('exp-fail', 'error', '星币不足！需要1000星币');
      return;
    }
    const expGain = 500;
    const crewIdx = crews.findIndex((c) => c.id === selectedCrew.id);
    if (crewIdx !== -1) {
      const state = useGameStore.getState();
      let crew = { ...state.crews[crewIdx] };
      crew.exp += expGain;
      while (crew.exp >= crew.maxExp) {
        crew.exp -= crew.maxExp;
        crew.level += 1;
        crew.maxExp = Math.floor(crew.maxExp * 1.5);
        const mult = 1 + (crew.level - 1) * 0.08;
        crew.stats = {
          leadership: Math.floor(crew.stats.leadership * mult),
          gunnery: Math.floor(crew.stats.gunnery * mult),
          engineering: Math.floor(crew.stats.engineering * mult),
          piloting: Math.floor(crew.stats.piloting * mult),
          medical: Math.floor(crew.stats.medical * mult),
        };
      }
      const newCrews = [...state.crews];
      newCrews[crewIdx] = crew;
      useGameStore.setState({ crews: newCrews });
    }
    addToast('exp-ok', 'success', `转化成功！${selectedCrew.name} 获得 500 经验`);
  };

  const handleAssign = (shipId: string | null) => {
    if (!selectedCrew) return;
    if (shipId === null) {
      unassignCrew(selectedCrew.id);
      addToast('unassign-ok', 'info', `已解除 ${selectedCrew.name} 的舰船分配`);
    } else {
      if (selectedCrew.shipId) {
        unassignCrew(selectedCrew.id);
      }
      assignCrewToShip(selectedCrew.id, shipId);
      const ship = ships.find((s) => s.id === shipId);
      addToast('assign-ok', 'success', `${selectedCrew.name} 已分配到 ${ship?.name ?? '舰船'}`);
    }
    setAssignShipOpen(false);
  };

  const handleUpgradeTalent = (talentId: string) => {
    if (!selectedCrew) return;
    const ok = upgradeTalent(selectedCrew.id, talentId);
    if (ok) {
      addToast('talent-ok', 'success', '天赋解锁成功！');
    } else {
      addToast('talent-fail', 'error', '天赋解锁失败：条件不足或星币不够');
    }
  };

  const handleRecruit = (crew: Crew) => {
    const cost = RARITY_RECRUIT_COST[crew.rarity] ?? 1000;
    const ok = recruitCrew(crew.id, cost);
    if (ok) {
      addToast('recruit-ok', 'success', `招募成功！${crew.name} 加入舰队`);
      setRecruitPool((prev) => prev.filter((c) => c.id !== crew.id));
    } else {
      addToast('recruit-fail', 'error', '招募失败：星币不足或已拥有');
    }
  };

  const handleRefreshPool = () => {
    if (!spendStarCoins(500)) {
      addToast('refresh-fail', 'error', '星币不足！刷新需要500星币');
      return;
    }
    generateRecruitPool();
    addToast('refresh-ok', 'info', '招募池已刷新');
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-space overflow-hidden">
      <TopBar />

      <div className="relative z-10 p-4 md:p-6 max-w-[1600px] mx-auto">
        <div className="mb-5">
          <h2 className="font-display font-black text-3xl md:text-4xl text-white text-glow tracking-wider mb-1">
            舰员培养
          </h2>
          <p className="text-sm text-ship-silver/80 font-display tracking-wide">
            管理、培养并招募你的星际舰员
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 md:gap-6">
          <div className="lg:col-span-4 space-y-4">
            <Card
              title={
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-energy-cyan" />
                  <span>舰员名册</span>
                </div>
              }
            >
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ship-silver/50" />
                  <input
                    type="text"
                    placeholder="搜索舰员名字..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-md bg-space-900/80 border border-ship-dark/60 text-sm text-white placeholder-ship-silver/40 focus:outline-none focus:border-energy-cyan/60 focus:shadow-[0_0_0_2px_rgba(0,212,255,0.15)] transition-all"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {ROLE_FILTERS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setSelectedRole(key)}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-[11px] font-display tracking-wide transition-all',
                        selectedRole === key
                          ? 'bg-energy-cyan/20 border-energy-cyan/60 text-energy-cyan shadow-[0_0_12px_rgba(0,212,255,0.25)]'
                          : 'bg-space-800/60 border-ship-dark/60 text-ship-silver hover:border-energy-cyan/40 hover:text-white'
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
                {filteredCrews.length === 0 && (
                  <div className="col-span-2 py-10 text-center text-ship-silver/60">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="font-display text-sm">暂无符合条件的舰员</p>
                  </div>
                )}
                {filteredCrews.map((crew) => (
                  <CrewCard
                    key={crew.id}
                    crew={crew}
                    selected={selectedCrewId === crew.id}
                    onClick={() => setSelectedCrewId(crew.id)}
                    compact
                  />
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-energy-cyan/15 flex items-center justify-between text-xs font-display">
                <span className="text-ship-silver/70">总计</span>
                <span className="text-energy-cyan font-bold">
                  {filteredCrews.length} <span className="text-ship-silver/50">/ {crews.length}</span> 名舰员
                </span>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="flex gap-1 p-1 rounded-lg bg-space-900/60 border border-ship-dark/60">
              {[
                { key: 'detail', label: '舰员详情', icon: Sparkles },
                { key: 'talent', label: '天赋树', icon: Star },
                { key: 'recruit', label: '招募中心', icon: Users },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as typeof activeTab)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-display tracking-wide transition-all',
                    activeTab === key
                      ? 'bg-gradient-to-r from-energy-cyan/30 to-energy-blue/30 border border-energy-cyan/50 text-energy-cyan shadow-[0_0_16px_rgba(0,212,255,0.25)] text-glow'
                      : 'text-ship-silver hover:text-white hover:bg-space-800/60'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'detail' && selectedCrew && (
              <div className="space-y-4">
                <Card>
                  <CrewCard crew={selectedCrew} showTalents />
                </Card>

                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-energy-cyan" />
                      <span>属性雷达图</span>
                    </div>
                  }
                >
                  <RadarChart stats={selectedCrew.stats} />
                </Card>

                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <ArrowUp className="w-4 h-4 text-life-green" />
                      <span>升级面板</span>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-ship-silver font-display">
                          经验进度 Lv.{selectedCrew.level}
                        </span>
                        <span className="text-xs text-life-green font-display font-bold">
                          {selectedCrew.exp} / {selectedCrew.maxExp}
                        </span>
                      </div>
                      <ProgressBar value={selectedCrew.exp} max={selectedCrew.maxExp} color="life" />
                    </div>

                    <Button
                      variant="success"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={handleGainExp}
                    >
                      <Coins className="w-4 h-4 text-danger-yellow" />
                      使用 1000 星币转化 500 经验
                    </Button>
                  </div>
                </Card>

                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-energy-cyan" />
                      <span>分配舰船</span>
                    </div>
                  }
                >
                  <div className="space-y-3">
                    <div className="p-3 rounded-md bg-space-900/60 border border-ship-dark/60">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-ship-silver/70 font-display mb-0.5">当前分配</div>
                          <div className="text-sm font-display font-bold text-white">
                            {selectedCrew.shipId
                              ? ships.find((s) => s.id === selectedCrew.shipId)?.name ?? '未知舰船'
                              : <span className="text-ship-silver/50">未分配</span>}
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => setAssignShipOpen((v) => !v)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-space-800/80 border border-energy-cyan/40 text-xs font-display text-energy-cyan hover:bg-energy-cyan/10 transition-all"
                          >
                            选择舰船
                            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', assignShipOpen && 'rotate-180')} />
                          </button>
                          {assignShipOpen && (
                            <div className="absolute right-0 top-full mt-1.5 z-30 w-56 rounded-lg bg-space-900/95 border border-energy-cyan/40 shadow-glow overflow-hidden">
                              <button
                                onClick={() => handleAssign(null)}
                                className="w-full px-3 py-2 text-left text-xs font-display text-ship-silver hover:bg-energy-cyan/10 hover:text-white transition-all border-b border-ship-dark/60"
                              >
                                解除分配
                              </button>
                              {ships.map((ship) => (
                                <button
                                  key={ship.id}
                                  onClick={() => handleAssign(ship.id)}
                                  disabled={ship.crewIds.length >= 2 && ship.id !== selectedCrew.shipId}
                                  className={cn(
                                    'w-full px-3 py-2 text-left text-xs font-display transition-all border-b border-ship-dark/40 last:border-0',
                                    ship.crewIds.length >= 2 && ship.id !== selectedCrew.shipId
                                      ? 'text-ship-silver/30 cursor-not-allowed'
                                      : selectedCrew.shipId === ship.id
                                      ? 'bg-energy-cyan/15 text-energy-cyan'
                                      : 'text-ship-silver hover:bg-energy-cyan/10 hover:text-white'
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{ship.name}</span>
                                    <span className="text-[10px] opacity-70">
                                      {ship.crewIds.length}/2
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'detail' && !selectedCrew && (
              <Card>
                <div className="py-16 text-center text-ship-silver/60">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="font-display text-sm">请从左侧选择一名舰员查看详情</p>
                </div>
              </Card>
            )}

            {activeTab === 'talent' && selectedCrew && (
              <div className="space-y-4">
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-danger-yellow" />
                      <span className="font-display font-black tracking-wider">天赋树</span>
                    </div>
                  }
                >
                  <div className="mb-2 flex items-center justify-between px-2">
                    <span className="text-xs font-display text-ship-silver/70">
                      舰员：<span className="text-white font-bold">{selectedCrew.name}</span>
                    </span>
                    <span className="text-xs font-display text-danger-yellow font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-danger-yellow/40" />
                      星币：{starCoins.toLocaleString()}
                    </span>
                  </div>
                  <TalentTreeSVG
                    talents={selectedCrew.talents}
                    onUpgrade={handleUpgradeTalent}
                    selectedTalent={selectedTalent}
                    setSelectedTalent={setSelectedTalent}
                    starCoins={starCoins}
                  />
                </Card>

                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-energy-cyan" />
                      <span>天赋详情</span>
                    </div>
                  }
                >
                  {selectedTalent ? (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-lg font-display font-black"
                              style={{ color: selectedTalent.unlocked ? '#00D4FF' : '#FFC93C' }}
                            >
                              {selectedTalent.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-display bg-space-800 border border-ship-dark text-ship-silver">
                              Tier {selectedTalent.tier}
                            </span>
                            {selectedTalent.unlocked && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-display bg-life-green/20 border border-life-green/40 text-life-green">
                                已解锁
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-ship-silver leading-relaxed">
                            {selectedTalent.description}
                          </p>
                        </div>
                      </div>

                      {Object.keys(selectedTalent.effect).length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(selectedTalent.effect).map(([k, v]) => (
                            <div
                              key={k}
                              className="flex items-center justify-between px-3 py-2 rounded-md bg-space-900/70 border border-life-green/30"
                            >
                              <span className="text-xs text-ship-silver">{k}</span>
                              <span className="font-display font-bold text-sm text-life-green">+{v}%</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedTalent.tier > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t border-energy-cyan/15">
                          <span className="text-xs text-ship-silver/70 font-display">
                            解锁消耗
                          </span>
                          <span
                            className={cn(
                              'text-sm font-display font-bold flex items-center gap-1',
                              starCoins >= selectedTalent.cost * 1000
                                ? 'text-danger-yellow'
                                : 'text-danger-red'
                            )}
                          >
                            <Coins className="w-4 h-4" />
                            {selectedTalent.cost * 1000} 星币
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-ship-silver/60">
                      <Star className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="font-display text-sm">点击上方天赋节点查看详情</p>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {activeTab === 'talent' && !selectedCrew && (
              <Card>
                <div className="py-16 text-center text-ship-silver/60">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="font-display text-sm">请从左侧选择一名舰员查看天赋树</p>
                </div>
              </Card>
            )}

            {activeTab === 'recruit' && (
              <div className="space-y-4">
                <Card
                  title={
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-energy-cyan" />
                        <span>招募中心</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleRefreshPool}>
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        刷新池 (500★)
                      </Button>
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                    {recruitPool.length === 0 && (
                      <div className="col-span-full py-10 text-center text-ship-silver/60">
                        <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <p className="font-display text-sm">暂无可用舰员，请刷新招募池</p>
                      </div>
                    )}
                    {recruitPool.map((crew) => {
                      const cost = RARITY_RECRUIT_COST[crew.rarity] ?? 1000;
                      const canAfford = starCoins >= cost;
                      return (
                        <div key={crew.id} className="space-y-3">
                          <CrewCard crew={crew} showTalents={false} />
                          <div
                            className="rounded-md p-3 border"
                            style={{
                              borderColor: `${getRarityColor(crew.rarity)}60`,
                              background: `linear-gradient(180deg, ${getRarityColor(crew.rarity)}10 0%, transparent 100%)`,
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-ship-silver/70 font-display">
                                招募消耗
                              </span>
                              <span
                                className={cn(
                                  'text-sm font-display font-bold flex items-center gap-1',
                                  canAfford ? 'text-danger-yellow' : 'text-danger-red'
                                )}
                              >
                                <Star className="w-3.5 h-3.5 fill-danger-yellow/30" />
                                {cost}
                              </span>
                            </div>
                            <Button
                              variant={canAfford ? 'success' : 'danger'}
                              size="sm"
                              className="w-full"
                              disabled={!canAfford}
                              onClick={() => handleRecruit(crew)}
                            >
                              {canAfford ? '立即招募' : '星币不足'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-energy-cyan/15">
                    <div className="text-xs font-display text-ship-silver/70 mb-2">招募概率</div>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { rarity: 1, label: '普通', pct: '60%' },
                        { rarity: 2, label: '稀有', pct: '25%' },
                        { rarity: 3, label: '史诗', pct: '12%' },
                        { rarity: 4, label: '传说', pct: '3%' },
                        { rarity: 5, label: '神话', pct: '-' },
                      ].map(({ rarity, label, pct }) => (
                        <div
                          key={rarity}
                          className="rounded-md p-2 text-center border"
                          style={{
                            borderColor: `${getRarityColor(rarity as 1 | 2 | 3 | 4 | 5)}40`,
                          }}
                        >
                          <div
                            className="text-xs font-display font-bold mb-0.5"
                            style={{ color: getRarityColor(rarity as 1 | 2 | 3 | 4 | 5) }}
                          >
                            {label}
                          </div>
                          <div className="text-[10px] text-ship-silver/70 font-display">
                            {pct}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
