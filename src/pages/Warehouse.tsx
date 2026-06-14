import { useState, useMemo } from 'react';
import {
  Search,
  Swords,
  Shield,
  Settings,
  Star,
  ArrowUpDown,
  Hammer,
  Coins,
  Package,
  Sparkles,
  X,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { TopBar } from '../components/HUD/TopBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EquipmentCard } from '../components/EquipmentCard';
import { MaterialItem } from '../components/MaterialItem';
import { Modal } from '../components/ui/Modal';
import { useGameStore } from '../store/useGameStore';
import { useUIGlobalStore } from '../store/useUIGlobalStore';
import { cn } from '../lib/utils';
import { getRarityColor, getRarityTextClass } from '../utils/rarityColors';
import type { Equipment, EquipmentType, Material, Recipe, Rarity } from '../types';
import { EQUIPMENTS } from '../data/equipment';

const TYPE_FILTERS: { key: EquipmentType | 'all'; label: string; icon: typeof Swords }[] = [
  { key: 'all', label: '全部', icon: Package },
  { key: 'weapon', label: '武器', icon: Swords },
  { key: 'shield', label: '护盾', icon: Shield },
  { key: 'module', label: '模块', icon: Settings },
];

const RARITY_FILTERS: { key: Rarity | 0; label: string }[] = [
  { key: 0, label: '全部' },
  { key: 1, label: '普通' },
  { key: 2, label: '稀有' },
  { key: 3, label: '精良' },
  { key: 4, label: '史诗' },
  { key: 5, label: '传说' },
];

type SortKey = 'rarity' | 'level' | 'name';

interface CraftHistoryEntry {
  id: string;
  name: string;
  success: boolean;
  timestamp: number;
}

export function Warehouse() {
  const equipments = useGameStore((s) => s.equipments);
  const materials = useGameStore((s) => s.materials);
  const recipes = useGameStore((s) => s.recipes);
  const starCoins = useGameStore((s) => s.profile.starCoins);
  const craftEquipment = useGameStore((s) => s.craftEquipment);

  const addToast = useUIGlobalStore((s) => s.addToast);
  const openCraftModal = useUIGlobalStore((s) => s.openCraftModal);
  const showCraftModal = useUIGlobalStore((s) => s.showCraftModal);
  const closeCraftModal = useUIGlobalStore((s) => s.closeCraftModal);

  const [activeTab, setActiveTab] = useState<'equipment' | 'craft' | 'material'>('equipment');

  const [typeFilter, setTypeFilter] = useState<EquipmentType | 'all'>('all');
  const [rarityFilter, setRarityFilter] = useState<Rarity | 0>(0);
  const [eqSearch, setEqSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rarity');
  const [sortDesc, setSortDesc] = useState(true);

  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const [craftHistory, setCraftHistory] = useState<CraftHistoryEntry[]>([]);

  const equipmentTemplates = useMemo(() => {
    const map = new Map<string, Equipment>();
    equipments.forEach((e) => {
      const baseId = e.id.replace(/^player-/, '').replace(/-\d+$/, '');
      if (!map.has(baseId)) {
        map.set(baseId, e);
      }
    });
    return map;
  }, [equipments]);

  const filteredEquipments = useMemo(() => {
    let list = equipments.filter((e) => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      if (rarityFilter !== 0 && e.rarity !== rarityFilter) return false;
      if (eqSearch && !e.name.toLowerCase().includes(eqSearch.toLowerCase())) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      let va: string | number = 0;
      let vb: string | number = 0;
      if (sortKey === 'rarity') {
        va = a.rarity;
        vb = b.rarity;
      } else if (sortKey === 'level') {
        va = a.level;
        vb = b.level;
      } else {
        va = a.name;
        vb = b.name;
      }
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDesc ? vb - va : va - vb;
      }
      return sortDesc ? String(vb).localeCompare(String(va)) : String(va).localeCompare(String(vb));
    });
    return list;
  }, [equipments, typeFilter, rarityFilter, eqSearch, sortKey, sortDesc]);

  const equipmentStats = useMemo(() => {
    const stats: Record<EquipmentType | 'total', number> = { weapon: 0, shield: 0, module: 0, total: equipments.length };
    equipments.forEach((e) => {
      stats[e.type]++;
    });
    return stats;
  }, [equipments]);

  const handleCraft = (recipe: Recipe) => {
    const template = equipmentTemplates.get(recipe.outputId);
    const name = template?.name ?? '装备';
    const success = craftEquipment(recipe.id);
    setCraftHistory((prev) => [
      { id: `${Date.now()}-${Math.random()}`, name, success, timestamp: Date.now() },
      ...prev,
    ].slice(0, 3));
    if (success) {
      addToast('craft-ok', 'success', `合成成功！获得 ${name}`);
    } else {
      addToast('craft-fail', 'error', `合成失败！材料已消耗...`);
    }
  };

  const getRecipeOutput = (recipe: Recipe): Equipment | undefined => {
    const tmpl = EQUIPMENTS.find((e: Equipment) => e.id === recipe.outputId);
    return tmpl;
  };

  const recipesWithOutput = useMemo(() => {
    return recipes.map((r) => ({
      recipe: r,
      output: getRecipeOutput(r),
    })).filter((x): x is { recipe: Recipe; output: Equipment } => !!x.output);
  }, [recipes]);

  const materialUsedInRecipes = useMemo(() => {
    const map = new Map<string, { recipeId: string; outputName: string; quantity: number }[]>();
    recipesWithOutput.forEach(({ recipe, output }) => {
      recipe.materials.forEach((m) => {
        if (!map.has(m.id)) {
          map.set(m.id, []);
        }
        map.get(m.id)!.push({
          recipeId: recipe.id,
          outputName: output.name,
          quantity: m.quantity,
        });
      });
    });
    return map;
  }, [recipesWithOutput]);

  return (
    <div className="relative min-h-screen w-full bg-gradient-space overflow-hidden">
      <TopBar />

      <div className="relative z-10 p-4 md:p-6 max-w-[1600px] mx-auto">
        <div className="mb-5">
          <h2 className="font-display font-black text-3xl md:text-4xl text-white text-glow tracking-wider mb-1">
            装备仓库
          </h2>
          <p className="text-sm text-ship-silver/80 font-display tracking-wide">
            管理装备、合成新物品、存储材料
          </p>
        </div>

        <div className="flex gap-1 p-1 rounded-lg bg-space-900/60 border border-ship-dark/60 mb-4 max-w-2xl">
          {[
            { key: 'equipment', label: '装备仓库', icon: Shield },
            { key: 'craft', label: '合成工坊', icon: Hammer },
            { key: 'material', label: '材料仓库', icon: Package },
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

        {activeTab === 'equipment' && (
          <div className="space-y-4">
            <Card>
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ship-silver/50" />
                    <input
                      type="text"
                      placeholder="搜索装备名称..."
                      value={eqSearch}
                      onChange={(e) => setEqSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-md bg-space-900/80 border border-ship-dark/60 text-sm text-white placeholder-ship-silver/40 focus:outline-none focus:border-energy-cyan/60 focus:shadow-[0_0_0_2px_rgba(0,212,255,0.15)] transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ship-silver/70 font-display shrink-0">排序:</span>
                    <div className="flex rounded-md overflow-hidden border border-ship-dark/60">
                      {([
                        { k: 'rarity', label: '稀有度' },
                        { k: 'level', label: '等级' },
                        { k: 'name', label: '名字' },
                      ] as { k: SortKey; label: string }[]).map(({ k, label }) => (
                        <button
                          key={k}
                          onClick={() => {
                            if (sortKey === k) {
                              setSortDesc((v) => !v);
                            } else {
                              setSortKey(k);
                              setSortDesc(true);
                            }
                          }}
                          className={cn(
                            'flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-display tracking-wide transition-all',
                            sortKey === k
                              ? 'bg-energy-cyan/20 text-energy-cyan'
                              : 'bg-space-800/60 text-ship-silver hover:text-white'
                          )}
                        >
                          {label}
                          {sortKey === k && (
                            <ArrowUpDown className={cn('w-3 h-3 transition-transform', !sortDesc && 'rotate-180')} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {TYPE_FILTERS.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setTypeFilter(key)}
                        className={cn(
                          'flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-[11px] font-display tracking-wide transition-all',
                          typeFilter === key
                            ? 'bg-energy-cyan/20 border-energy-cyan/60 text-energy-cyan shadow-[0_0_12px_rgba(0,212,255,0.25)]'
                            : 'bg-space-800/60 border-ship-dark/60 text-ship-silver hover:border-energy-cyan/40 hover:text-white'
                        )}
                      >
                        <Icon className="w-3 h-3" />
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="h-5 w-px bg-ship-dark/60 hidden md:block" />

                  <div className="flex flex-wrap gap-1.5">
                    {RARITY_FILTERS.map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setRarityFilter(key)}
                        className={cn(
                          'px-2.5 py-1.5 rounded-md border text-[11px] font-display tracking-wide transition-all',
                          rarityFilter === key
                            ? key === 0
                              ? 'bg-energy-cyan/20 border-energy-cyan/60 text-energy-cyan shadow-[0_0_12px_rgba(0,212,255,0.25)]'
                              : `border-2 ${getRarityTextClass(key as Rarity)}`
                            : 'bg-space-800/60 border-ship-dark/60 text-ship-silver hover:border-energy-cyan/40 hover:text-white'
                        )}
                        style={key !== 0 && rarityFilter === key ? {
                          background: `${getRarityColor(key as Rarity)}15`,
                          borderColor: `${getRarityColor(key as Rarity)}80`,
                        } : {}}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              {filteredEquipments.length === 0 ? (
                <div className="py-16 text-center text-ship-silver/60">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="font-display text-sm">暂无符合条件的装备</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[620px] overflow-y-auto pr-1">
                  {filteredEquipments.map((eq) => (
                    <EquipmentCard
                      key={eq.id}
                      equipment={eq}
                      showStats
                    />
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-energy-cyan/15">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'total', label: '总计', icon: Package },
                    { key: 'weapon', label: '武器', icon: Swords },
                    { key: 'shield', label: '护盾', icon: Shield },
                    { key: 'module', label: '模块', icon: Settings },
                  ].map(({ key, label, icon: Icon }) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 px-3 py-2 rounded-md bg-space-900/60 border border-ship-dark/60"
                    >
                      <Icon className="w-4 h-4 text-energy-cyan shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] text-ship-silver/60 font-display">{label}</div>
                        <div className="text-sm font-display font-bold text-white">
                          {equipmentStats[key as keyof typeof equipmentStats]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'craft' && (
          <div className="space-y-4">
            <Card>
              <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h3 className="font-display font-black text-xl text-energy-cyan text-glow tracking-wider mb-1 flex items-center gap-2">
                    <Hammer className="w-5 h-5" />
                    合成工坊
                  </h3>
                  <p className="text-xs text-ship-silver/70 font-display">
                    使用材料和星币合成强力装备
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-space-800/80 border border-danger-yellow/30">
                  <Coins className="w-4 h-4 text-danger-yellow" />
                  <span className="font-display font-bold text-danger-yellow">
                    {starCoins.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {recipesWithOutput.map(({ recipe, output }) => {
                  const canAffordCoins = starCoins >= recipe.starCoinCost;
                  const canAffordMats = recipe.materials.every((m) => {
                    const mat = materials.find((x) => x.id === m.id);
                    return mat && mat.quantity >= m.quantity;
                  });
                  const canCraft = canAffordCoins && canAffordMats;

                  const successColor =
                    recipe.successRate >= 90
                      ? 'text-life-green'
                      : recipe.successRate >= 70
                      ? 'text-danger-yellow'
                      : 'text-danger-red';

                  return (
                    <div
                      key={recipe.id}
                      className="hud-panel p-4 border-2"
                      style={{ borderColor: `${getRarityColor(output.rarity)}50` }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-4">
                          <div className="text-[10px] text-ship-silver/60 font-display tracking-wider mb-2">产出装备</div>
                          <EquipmentCard equipment={output} showStats canCraft={false} />
                        </div>

                        <div className="md:col-span-3 flex flex-col items-center justify-center gap-3 py-4">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-6 h-6 text-energy-cyan opacity-60" />
                            <ChevronRight className="w-6 h-6 text-energy-cyan" />
                          </div>

                          <div className="text-center">
                            <div className="text-[10px] text-ship-silver/60 font-display mb-1">成功率</div>
                            <div className={cn('text-3xl font-display font-black', successColor)} style={{ textShadow: '0 0 12px currentColor' }}>
                              {recipe.successRate}%
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-space-900/80 border border-ship-dark/60">
                            <Coins className="w-3.5 h-3.5 text-danger-yellow" />
                            <span className="text-xs text-ship-silver/70 font-display">消耗</span>
                            <span className={cn('text-sm font-display font-bold', canAffordCoins ? 'text-danger-yellow' : 'text-danger-red')}>
                              {recipe.starCoinCost}
                            </span>
                          </div>

                          <Button
                            variant={canCraft ? 'success' : 'danger'}
                            size="md"
                            className="w-full"
                            disabled={!canCraft}
                            onClick={() => handleCraft(recipe)}
                          >
                            <Hammer className="w-4 h-4 mr-1.5" />
                            {canCraft ? '开始合成' : '条件不足'}
                          </Button>
                        </div>

                        <div className="md:col-span-5">
                          <div className="text-[10px] text-ship-silver/60 font-display tracking-wider mb-2">所需材料</div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {recipe.materials.map((m) => {
                              const mat = materials.find((x) => x.id === m.id);
                              const matData = mat ?? {
                                id: m.id,
                                name: '未知材料',
                                rarity: 1 as Rarity,
                                quantity: 0,
                                icon: '?',
                                description: '',
                              };
                              const haveEnough = (mat?.quantity ?? 0) >= m.quantity;
                              return (
                                <div
                                  key={m.id}
                                  className={cn(
                                    'p-2.5 rounded-lg border-2 bg-space-900/60 transition-all',
                                    haveEnough
                                      ? 'border-life-green/40'
                                      : 'border-danger-red/40'
                                  )}
                                  style={{
                                    boxShadow: haveEnough
                                      ? 'inset 0 0 12px rgba(57, 255, 20, 0.08)'
                                      : 'inset 0 0 12px rgba(255, 46, 99, 0.08)',
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <MaterialItem material={matData} size="md" />
                                    <div className="flex-1 min-w-0">
                                      <div
                                        className="text-xs font-display font-semibold truncate"
                                        style={{ color: getRarityColor(matData.rarity) }}
                                      >
                                        {matData.name}
                                      </div>
                                      <div className="mt-1 flex items-center justify-between">
                                        <span className={cn(
                                          'text-xs font-display font-bold',
                                          haveEnough ? 'text-life-green' : 'text-danger-red'
                                        )}>
                                          {mat?.quantity ?? 0}
                                          <span className="text-ship-silver/50"> / {m.quantity}</span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {craftHistory.length > 0 && (
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-energy-cyan" />
                    <span>合成历史</span>
                  </div>
                }
              >
                <div className="space-y-2">
                  {craftHistory.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 rounded-md border',
                        entry.success
                          ? 'bg-life-green/10 border-life-green/30'
                          : 'bg-danger-red/10 border-danger-red/30'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-ship-silver/60 font-display">
                          #{craftHistory.length - idx}
                        </span>
                        <Sparkles className={cn('w-4 h-4', entry.success ? 'text-life-green' : 'text-danger-red')} />
                        <span className={cn('text-sm font-display font-semibold', entry.success ? 'text-life-green' : 'text-danger-red')}>
                          {entry.name}
                        </span>
                      </div>
                      <span className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-display font-bold',
                        entry.success
                          ? 'bg-life-green/20 text-life-green border border-life-green/40'
                          : 'bg-danger-red/20 text-danger-red border border-danger-red/40'
                      )}>
                        {entry.success ? '成功' : '失败'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'material' && (
          <Card
            title={
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-energy-cyan" />
                <span className="font-display font-black tracking-wider">材料仓库</span>
              </div>
            }
          >
            {materials.length === 0 ? (
              <div className="py-16 text-center text-ship-silver/60">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-display text-sm">暂无材料</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 max-h-[620px] overflow-y-auto pr-1 p-2">
                {materials.map((mat) => (
                  <MaterialItem
                    key={mat.id}
                    material={mat}
                    size="lg"
                    showName
                    onClick={() => setSelectedMaterial(mat)}
                  />
                ))}
              </div>
            )}
          </Card>
        )}

        <Modal
          open={!!selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
          size="md"
          title={
            selectedMaterial && (
              <div className="flex items-center gap-2">
                <span style={{ color: getRarityColor(selectedMaterial.rarity) }}>
                  {selectedMaterial.icon}
                </span>
                <span style={{ color: getRarityColor(selectedMaterial.rarity) }}>
                  {selectedMaterial.name}
                </span>
              </div>
            )
          }
          footer={
            <Button variant="ghost" onClick={() => setSelectedMaterial(null)}>
              关闭
            </Button>
          }
        >
          {selectedMaterial && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div
                  className="w-20 h-20 shrink-0 rounded-lg bg-space-900/80 border-2 flex items-center justify-center"
                  style={{
                    borderColor: `${getRarityColor(selectedMaterial.rarity)}80`,
                    boxShadow: `0 0 24px ${getRarityColor(selectedMaterial.rarity)}30, inset 0 0 16px ${getRarityColor(selectedMaterial.rarity)}20`,
                  }}
                >
                  <span
                    className="font-display font-black text-4xl"
                    style={{
                      color: getRarityColor(selectedMaterial.rarity),
                      textShadow: `0 0 12px ${getRarityColor(selectedMaterial.rarity)}`,
                    }}
                  >
                    {selectedMaterial.icon}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-display font-bold border',
                        getRarityTextClass(selectedMaterial.rarity)
                      )}
                      style={{
                        background: `${getRarityColor(selectedMaterial.rarity)}15`,
                        borderColor: `${getRarityColor(selectedMaterial.rarity)}50`,
                      }}
                    >
                      {RARITY_FILTERS.find((r) => r.key === selectedMaterial.rarity)?.label ?? '稀有'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-danger-yellow fill-danger-yellow/30" />
                      <span className="text-sm font-display font-bold text-white">
                        x {selectedMaterial.quantity}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-ship-silver/60 font-display tracking-wider mb-1">描述</div>
                    <p className="text-sm text-ship-silver leading-relaxed">
                      {selectedMaterial.description || '暂无描述'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-energy-cyan/15">
                <div className="text-[10px] text-ship-silver/60 font-display tracking-wider mb-2 flex items-center gap-1.5">
                  <Hammer className="w-3 h-3" />
                  可用配方
                </div>
                {(() => {
                  const usages = materialUsedInRecipes.get(selectedMaterial.id);
                  if (!usages || usages.length === 0) {
                    return (
                      <div className="py-4 text-center text-ship-silver/50 text-xs font-display">
                        此材料暂无配方用途
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {usages.map((u) => (
                        <div
                          key={u.recipeId}
                          className="flex items-center justify-between px-3 py-2 rounded-md bg-space-900/60 border border-ship-dark/60 hover:border-energy-cyan/40 transition-all cursor-pointer"
                          onClick={() => {
                            setActiveTab('craft');
                            setSelectedMaterial(null);
                            openCraftModal();
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-energy-cyan" />
                            <span className="text-sm font-display font-semibold text-white">{u.outputName}</span>
                          </div>
                          <span className="text-xs font-display text-ship-silver">
                            需要 <span className="text-life-green font-bold">x{u.quantity}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </Modal>

        {showCraftModal && (
          <Modal
            open={showCraftModal}
            onClose={closeCraftModal}
            size="md"
            title={
              <div className="flex items-center gap-2">
                <Hammer className="w-4 h-4 text-energy-cyan" />
                <span className="text-energy-cyan">跳转至合成工坊</span>
              </div>
            }
            footer={
              <>
                <Button variant="ghost" onClick={closeCraftModal}>
                  取消
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    closeCraftModal();
                    setActiveTab('craft');
                  }}
                >
                  前往合成
                </Button>
              </>
            }
          >
            <div className="py-4 text-center">
              <Hammer className="w-12 h-12 mx-auto mb-3 text-energy-cyan opacity-80" />
              <p className="text-sm text-ship-silver font-display">
                是否跳转到合成工坊查看相关配方？
              </p>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
