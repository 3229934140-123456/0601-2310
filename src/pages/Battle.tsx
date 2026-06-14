import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Crosshair, Shield, Zap, Heart, Move, Users, Target, Swords, Wrench, BookOpen, Flag, X, ChevronRight, Radar, AlertTriangle } from 'lucide-react';
import { StarField } from '../components/StarField';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useBattleStore } from '../store/battleStore';
import { useGameStore } from '../store/useGameStore';
import { useUIGlobalStore } from '../store/useUIGlobalStore';
import type { Ship, Position } from '../types';
import { posKey } from '../utils/gridUtils';
import { getRarityColor, getRarityTextClass } from '../utils/rarityColors';

const CELL = 56;

const getShipIcon = (s: Ship) => {
  switch (s.type) {
    case 'battleship': return Shield;
    case 'cruiser': return Crosshair;
    case 'destroyer': return Zap;
    case 'carrier': return Users;
    case 'support': return Heart;
  }
};

const getEnvStyle = (type: string) => {
  switch (type) {
    case 'asteroid':
      return { color: '#FF6B35', bg: 'bg-danger-orange/10', border: 'border-danger-orange/40', icon: '☄', label: '陨石带' };
    case 'nebula':
      return { color: '#9D6CFF', bg: 'bg-energy-purple/10', border: 'border-energy-purple/40', icon: '☁', label: '星云' };
    case 'radiation':
      return { color: '#FFC93C', bg: 'bg-danger-yellow/10', border: 'border-danger-yellow/40', icon: '☢', label: '辐射区' };
    case 'wormhole':
      return { color: '#00D4FF', bg: 'bg-energy-cyan/10', border: 'border-energy-cyan/50', icon: '◎', label: '虫洞' };
    default:
      return { color: '#888', bg: '', border: '', icon: '', label: '' };
  }
};

export function Battle() {
  const { stageId } = useParams();
  const navigate = useNavigate();
  const initDoneRef = useRef(false);

  const {
    stage, turn, phase, playerFleet, enemyFleet, gridSize, environmentTiles,
    battleLog, selectedShipId, validMoves, validTargets, actionMode,
    finished, victory, floatingDamage,
    initBattle, selectShip, setActionMode, moveShip, attackTarget, useSkill,
    repairShip, endTurn, resetBattle,
  } = useBattleStore();

  const { ships, activeFleetIds, profile, stages, completeStage, addStarCoins, gainExp,
    updateMissionProgress, unlockStage, addBattleArchive, setLastBattleResult,
    getMaterialsById } = useGameStore();
  const { addToast } = useUIGlobalStore();

  const [showReplay, setShowReplay] = useState(false);
  const [resultProcessed, setResultProcessed] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // 初始化战斗
  useEffect(() => {
    if (initDoneRef.current || !stageId) return;
    const st = stages.find((x) => x.id === stageId);
    if (!st) { addToast('error', '未找到关卡'); navigate('/starmap'); return; }
    if (!st.unlocked) { addToast('error', '该关卡尚未解锁'); navigate('/starmap'); return; }
    const fleet = ships.filter((s) => activeFleetIds.includes(s.id));
    if (fleet.length === 0) { addToast('warning', '请先在舰队编成中配置出战舰队'); navigate('/fleet'); return; }
    initBattle(st, fleet, profile);
    initDoneRef.current = true;
  }, [stageId, stages, ships, activeFleetIds, profile, initBattle, navigate, addToast]);

  // 日志自动滚动
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battleLog.length]);

  // 处理战斗结束
  useEffect(() => {
    if (!finished || resultProcessed || !stage) return;
    setResultProcessed(true);
    const aliveP = playerFleet.filter((s) => s.hp > 0).length;
    const totalP = playerFleet.length;
    const hpRatio = playerFleet.reduce((a, s) => a + s.hp, 0) / Math.max(1, playerFleet.reduce((a, s) => a + s.maxHp, 0));
    let stars: 0 | 1 | 2 | 3 = 0;
    if (victory) {
      stars = 1;
      if (aliveP >= Math.ceil(totalP * 0.75)) stars = 2;
      if (hpRatio >= 0.5 && aliveP === totalP) stars = 3;
    }

    const rw = stage.rewards;
    const starCoin = victory ? Math.floor(rw.starCoins * (0.7 + stars * 0.1)) : Math.floor(rw.starCoins * 0.1);
    const expGain = victory ? Math.floor(rw.exp * (0.8 + stars * 0.1)) : 20;
    const materialDrops: { id: string; name: string; quantity: number }[] = [];
    if (victory && rw.materials) {
      const mats = getMaterialsById ? getMaterialsById(rw.materials.map(m => m.id)) : {};
      rw.materials.forEach((m) => {
        if (Math.random() < m.dropRate) {
          const qty = Math.max(1, m.quantity + (stars >= 3 ? 1 : 0));
          materialDrops.push({ id: m.id, name: (mats as any)[m.id]?.name || '材料', quantity: qty });
        }
      });
    }

    if (victory) {
      addStarCoins(starCoin);
      gainExp(expGain);
      completeStage(stage.id, stars);
      stage.connections.forEach((cid) => unlockStage(cid));
      updateMissionProgress('stage_cleared', 1);
      updateMissionProgress('battle_won', 1);
      updateMissionProgress('ship_destroyed', enemyFleet.length);
    } else {
      addStarCoins(starCoin);
      gainExp(expGain);
      updateMissionProgress('battle_won', 0);
    }

    addBattleArchive({
      id: `arch_${Date.now()}`,
      stageId: stage.id,
      stageName: stage.name,
      timestamp: Date.now(),
      victory: !!victory,
      turns: turn,
      starRating: stars,
      damageDealt: 0,
      damageTaken: 0,
      details: battleLog,
      rewards: {
        starCoins: starCoin,
        exp: expGain,
        materials: materialDrops.map((m) => ({ id: m.id, quantity: m.quantity })),
      },
    });

    setLastBattleResult({
      battleId: `b_${Date.now()}`,
      victory: !!victory,
      rewards: {
        starCoins: starCoin,
        exp: expGain,
        materials: materialDrops,
        equipments: [],
      },
      starRating: stars,
      stageId: stage.id,
      turns: turn,
    });

    setTimeout(() => navigate(`/result/b_${Date.now()}`), 1400);
  }, [finished, resultProcessed, victory, stage, playerFleet, enemyFleet, turn, battleLog,
    completeStage, addStarCoins, gainExp, unlockStage, updateMissionProgress, addBattleArchive,
    setLastBattleResult, navigate, getMaterialsById]);

  const selectedShip = useMemo(
    () => [...playerFleet, ...enemyFleet].find((s) => s.id === selectedShipId),
    [playerFleet, enemyFleet, selectedShipId],
  );

  const allShips = useMemo(() => [...playerFleet, ...enemyFleet], [playerFleet, enemyFleet]);
  const occupiedKey = useMemo(() => {
    const s = new Set<string>();
    allShips.forEach((sh) => sh.hp > 0 && sh.position && s.add(posKey(sh.position)));
    return s;
  }, [allShips]);

  const validMoveKey = useMemo(() => new Set(validMoves.map(posKey)), [validMoves]);
  const validTargetSet = useMemo(() => new Set(validTargets), [validTargets]);

  const handleTileClick = (pos: Position) => {
    if (finished) return;
    if (phase !== 'player') return;

    const shipHere = allShips.find((s) => s.hp > 0 && s.position && posKey(s.position) === posKey(pos));

    if (actionMode === 'move') {
      if (validMoveKey.has(posKey(pos)) && !occupiedKey.has(posKey(pos))) {
        moveShip(pos);
      } else if (shipHere) {
        selectShip(shipHere.id);
      }
    } else if (actionMode === 'attack' && shipHere) {
      if (validTargetSet.has(shipHere.id)) {
        attackTarget(shipHere.id);
      } else {
        selectShip(shipHere.id);
      }
    } else if (actionMode === 'skill' && shipHere) {
      if (validTargetSet.has(shipHere.id)) {
        useSkill('overcharge', shipHere.id);
      } else if (shipHere.faction === 'player') {
        selectShip(shipHere.id);
      }
    } else {
      if (shipHere) selectShip(shipHere.id);
      else {
        selectShip(null);
      }
    }
  };

  const phaseText = { player: '玩家回合', enemy: '敌方回合', environment: '环境结算' }[phase];
  const phaseColor = { player: 'text-energy-cyan', enemy: 'text-danger-red', environment: 'text-danger-yellow' }[phase];

  // 退出前确认
  const handleExit = () => {
    if (!finished) {
      if (confirm('战斗进行中，确定退出吗？进度将会丢失')) {
        resetBattle();
        navigate('/starmap');
      }
    } else {
      navigate('/starmap');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-space overflow-hidden">
      <StarField />
      <div className="relative z-10 flex flex-col h-screen p-4 gap-3">
        {/* 顶栏 */}
        <div className="flex items-center justify-between hud-panel p-3 px-5">
          <div className="flex items-center gap-6">
            <Button variant="ghost" onClick={handleExit}><X className="w-4 h-4 mr-1" />退出</Button>
            <div>
              <div className="font-display font-bold text-lg text-white">{stage?.name || '战斗区域'}</div>
              <div className="text-xs text-ship-silver">难度 {'★'.repeat(stage?.difficulty || 1)}</div>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="font-display text-xs text-ship-silver">回合</div>
              <div className="font-display font-black text-3xl text-energy-cyan text-glow">{turn}</div>
            </div>
            <div className="text-center">
              <div className="font-display text-xs text-ship-silver">阶段</div>
              <div className={`font-display font-bold text-lg ${phaseColor}`}>
                {phase === 'player' && <Move className="w-4 h-4 inline mr-1" />}
                {phase === 'enemy' && <Swords className="w-4 h-4 inline mr-1" />}
                {phase === 'environment' && <AlertTriangle className="w-4 h-4 inline mr-1" />}
                {phaseText}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <StatMini label="我方舰队" value={`${playerFleet.filter(s => s.hp > 0).length}/${playerFleet.length}`} color="text-life-green" />
              <StatMini label="敌方舰队" value={`${enemyFleet.filter(s => s.hp > 0).length}/${enemyFleet.length}`} color="text-danger-red" />
            </div>
            <Button variant="ghost" onClick={() => setShowReplay(true)}><BookOpen className="w-4 h-4 mr-1" />战报</Button>
          </div>
        </div>

        {/* 主体区：左(我方舰队列表) + 中(战场) + 右(战报+操作) */}
        <div className="flex-1 flex gap-3 min-h-0">
          {/* 左栏 - 我方舰船 */}
          <div className="w-64 flex flex-col gap-3">
            <Card title="我方舰队" className="!p-3 flex-1 overflow-auto">
              <div className="flex flex-col gap-2">
                {playerFleet.map((s) => (
                  <FleetShipCard
                    key={s.id}
                    ship={s}
                    selected={selectedShipId === s.id}
                    onClick={() => selectShip(s.id)}
                  />
                ))}
              </div>
            </Card>
            <Card title="敌方舰队" className="!p-3 max-h-64 overflow-auto">
              <div className="flex flex-col gap-2">
                {enemyFleet.map((s) => (
                  <FleetShipCard
                    key={s.id}
                    ship={s}
                    selected={selectedShipId === s.id}
                    onClick={() => selectShip(s.id)}
                    enemy
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* 中栏 - 战场 */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <Card className="!p-4 flex-1 overflow-auto flex items-center justify-center relative">
              {/* 战场网格 */}
              <div
                className="relative"
                style={{
                  width: gridSize.width * CELL,
                  height: gridSize.height * CELL,
                }}
              >
                {/* 网格底 */}
                <div
                  className="absolute inset-0 grid"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize.width}, ${CELL}px)`,
                    gridTemplateRows: `repeat(${gridSize.height}, ${CELL}px)`,
                  }}
                >
                  {Array.from({ length: gridSize.width * gridSize.height }).map((_, i) => {
                    const x = i % gridSize.width;
                    const y = Math.floor(i / gridSize.width);
                    const pos = { x, y };
                    const env = environmentTiles.find((e) => e.position.x === x && e.position.y === y);
                    const moveValid = validMoveKey.has(posKey(pos));
                    const shipHere = allShips.find((s) => s.hp > 0 && s.position && posKey(s.position) === posKey(pos));
                    const attackValid = validTargetSet.has(shipHere?.id || '');

                    const extraCls = [];
                    if (moveValid && !shipHere) extraCls.push('valid-move');
                    if (attackValid) extraCls.push('valid-attack');

                    return (
                      <div
                        key={i}
                        className={`grid-tile ${extraCls.join(' ')} ${env ? getEnvStyle(env.type).bg + ' ' + getEnvStyle(env.type).border : ''}`}
                        onClick={() => handleTileClick(pos)}
                      >
                        {env && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-2xl opacity-70" style={{ color: getEnvStyle(env.type).color }}>
                              {getEnvStyle(env.type).icon}
                            </span>
                          </div>
                        )}
                        {moveValid && !shipHere && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-3 h-3 rounded-full bg-life-green/60 animate-pulse" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 舰船渲染 */}
                {allShips.filter(s => s.hp > 0 && s.position).map((s) => {
                  const SelIcon = getShipIcon(s);
                  const isSel = selectedShipId === s.id;
                  const isTarget = validTargetSet.has(s.id);
                  return (
                    <div
                      key={s.id}
                      className={`absolute transition-all duration-300 ease-out cursor-pointer`}
                      style={{
                        left: s.position!.x * CELL + 2,
                        top: s.position!.y * CELL + 2,
                        width: CELL - 4,
                        height: CELL - 4,
                      }}
                      onClick={(e) => { e.stopPropagation(); handleTileClick(s.position!); }}
                    >
                      <div
                        className={`relative w-full h-full rounded-lg flex items-center justify-center
                          ${s.faction === 'player' ? 'bg-gradient-to-br from-energy-cyan/20 to-energy-blue/30 border-energy-cyan/70' : 'bg-gradient-to-br from-danger-red/20 to-danger-orange/30 border-danger-red/70'}
                          border-2 backdrop-blur-sm
                          ${isSel ? 'shadow-glow-lg ring-2 ring-white/70 scale-105' : ''}
                          ${isTarget ? 'ring-2 ring-danger-red animate-pulse shadow-glow-red' : ''}
                        `}
                      >
                        <SelIcon className={`w-7 h-7 ${s.faction === 'player' ? 'text-energy-cyan' : 'text-danger-red'} drop-shadow`} />
                        {/* HP小条 */}
                        <div className="absolute -top-3 left-0 right-0 px-0.5">
                          <div className="h-1.5 rounded-full bg-space-950 border border-black/40 overflow-hidden">
                            <div
                              className={`h-full ${s.faction === 'player' ? 'bg-gradient-to-r from-life-green to-life-teal' : 'bg-gradient-to-r from-danger-red to-danger-orange'}`}
                              style={{ width: `${(s.hp / s.maxHp) * 100}%` }}
                            />
                          </div>
                        </div>
                        {/* 护盾条 */}
                        {s.shield > 0 && (
                          <div className="absolute -bottom-2 left-0 right-0 px-0.5">
                            <div className="h-1 rounded-full bg-space-950 border border-black/40 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-energy-cyan to-energy-blue"
                                style={{ width: `${(s.shield / s.maxShield) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {/* 舰名小标签 */}
                        <div className="absolute -left-1 -right-1 -bottom-7 text-[10px] text-center font-display text-ship-silver whitespace-nowrap overflow-hidden text-ellipsis">
                          {s.name}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* 浮动伤害 */}
                {floatingDamage.map((fd) => (
                  <div
                    key={fd.id}
                    className="absolute pointer-events-none damage-float z-30 font-display font-black text-xl"
                    style={{
                      left: fd.x,
                      top: fd.y,
                      transform: 'translateX(-50%)',
                      color: fd.type === 'damage' ? '#FF2E63' : fd.type === 'heal' ? '#39FF14' : '#8B9DC3',
                      textShadow: '0 0 8px rgba(0,0,0,0.8), 0 0 4px currentColor',
                    }}
                  >
                    {fd.type === 'miss' ? 'MISS' : (fd.type === 'heal' ? '+' : '-') + fd.value}
                  </div>
                ))}
              </div>

              {/* 操作模式指示 */}
              {actionMode !== 'none' && (
                <div className="absolute top-3 left-3 hud-panel px-4 py-2 font-display text-sm">
                  <Radar className="w-4 h-4 inline mr-2 text-energy-cyan" />
                  当前模式：
                  <span className="text-energy-cyan font-bold ml-1">
                    {actionMode === 'move' && '移动 - 点击绿色格子移动'}
                    {actionMode === 'attack' && '攻击 - 点击红色舰船攻击'}
                    {actionMode === 'skill' && '技能 - 选择目标释放'}
                  </span>
                  <X
                    className="w-4 h-4 inline ml-3 cursor-pointer text-ship-silver hover:text-white"
                    onClick={() => setActionMode('none')}
                  />
                </div>
              )}
            </Card>

            {/* 底部操作面板 */}
            <Card className="!p-3">
              <div className="flex items-center gap-3">
                {/* 选中舰船信息 */}
                <div className="flex-1 flex items-center gap-4 min-w-0">
                  {selectedShip ? (
                    <>
                      <div
                        className={`w-14 h-14 rounded-lg flex items-center justify-center border-2 ${selectedShip.faction === 'player' ? 'border-energy-cyan/60 bg-energy-cyan/10' : 'border-danger-red/60 bg-danger-red/10'}`}
                      >
                        {(() => { const Ic = getShipIcon(selectedShip); return <Ic className={`w-7 h-7 ${selectedShip.faction === 'player' ? 'text-energy-cyan' : 'text-danger-red'}`} />; })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-display font-bold ${selectedShip.faction === 'player' ? 'text-white' : 'text-danger-red'}`}>
                            {selectedShip.name}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded border ${getRarityTextClass(selectedShip.rarity)}`} style={{ borderColor: getRarityColor(selectedShip.rarity) }}>
                            {'★'.repeat(selectedShip.rarity)}
                          </span>
                          {selectedShip.faction === 'player' && (
                            <span className="text-xs text-ship-silver">行动点 {selectedShip.actionPoints}/{selectedShip.maxActionPoints}</span>
                          )}
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="text-[10px] text-ship-silver mb-0.5">HP {selectedShip.hp}/{selectedShip.maxHp}</div>
                            <ProgressBar value={selectedShip.hp} max={selectedShip.maxHp} color="life" height="sm" />
                          </div>
                          <div className="flex-1">
                            <div className="text-[10px] text-ship-silver mb-0.5">护盾 {selectedShip.shield}/{selectedShip.maxShield}</div>
                            <ProgressBar value={selectedShip.shield} max={selectedShip.maxShield} color="energy" height="sm" />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-ship-silver italic font-display">点击我方舰船选中进行操作，或点击敌方查看情报</div>
                  )}
                </div>

                {/* 行动按钮 */}
                {selectedShip && selectedShip.faction === 'player' && phase === 'player' && !finished && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="success"
                      size="sm"
                      disabled={selectedShip.actionPoints < 1}
                      onClick={() => setActionMode(actionMode === 'move' ? 'none' : 'move')}
                      className={actionMode === 'move' ? 'shadow-glow-green ring-1 ring-life-green' : ''}
                    >
                      <Move className="w-4 h-4 mr-1" />移动 (1AP)
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={selectedShip.actionPoints < 2}
                      onClick={() => setActionMode(actionMode === 'attack' ? 'none' : 'attack')}
                      className={actionMode === 'attack' ? 'shadow-glow-red ring-1 ring-danger-red' : ''}
                    >
                      <Target className="w-4 h-4 mr-1" />攻击 (2AP)
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={selectedShip.actionPoints < 3}
                      onClick={() => setActionMode(actionMode === 'skill' ? 'none' : 'skill', 'overcharge')}
                      className={actionMode === 'skill' ? 'shadow-glow ring-1 ring-energy-cyan' : ''}
                    >
                      <Zap className="w-4 h-4 mr-1" />战术技能 (3AP)
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={selectedShip.actionPoints < 2 || (selectedShip.hp >= selectedShip.maxHp && selectedShip.shield >= selectedShip.maxShield)}
                      onClick={() => repairShip(selectedShip.id)}
                    >
                      <Wrench className="w-4 h-4 mr-1" />维修 (2AP)
                    </Button>
                  </div>
                )}

                <div className="ml-2">
                  <Button
                    variant="primary"
                    disabled={phase !== 'player' || finished}
                    onClick={endTurn}
                    className="animate-pulse-glow"
                  >
                    <Flag className="w-4 h-4 mr-1" />结束回合
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* 右栏 - 战报面板 */}
          <div className="w-80 flex flex-col gap-3">
            <Card
              title="战斗战报"
              className="!p-3 flex-1 min-h-0 flex flex-col"
              footer={<div className="text-xs text-ship-silver px-2">总计 {battleLog.length} 条记录</div>}
            >
              <div className="flex-1 overflow-auto text-sm space-y-1.5 pr-1">
                {battleLog.map((l) => (
                  <div
                    key={l.id}
                    className={`text-xs px-2 py-1.5 rounded-md border-l-2 ${l.type === 'system' ? 'border-energy-cyan bg-energy-cyan/10 text-energy-cyan/90' :
                      l.type === 'attack' ? `border-${l.critical ? 'danger-yellow bg-danger-yellow/10' : 'danger-red/60 bg-danger-red/5'} text-ship-silver` :
                      l.type === 'skill' ? 'border-energy-purple bg-energy-purple/10 text-energy-purple/90' :
                      l.type === 'heal' ? 'border-life-green bg-life-green/10 text-life-green/90' :
                      l.type === 'environment' ? 'border-danger-yellow bg-danger-yellow/10 text-danger-yellow' :
                      'border-ship-gray/50 bg-space-800/50 text-ship-silver'}`}
                  >
                    <span className="text-ship-gray mr-1">[T{l.turn}]</span>
                    {l.message}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </Card>

            {/* 图例 */}
            <Card title="地形图例" className="!p-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['asteroid', 'nebula', 'radiation', 'wormhole'].map((t) => {
                  const s = getEnvStyle(t);
                  return (
                    <div key={t} className="flex items-center gap-2">
                      <span className={`inline-block w-6 h-6 rounded ${s.bg} border ${s.border} flex items-center justify-center`}>
                        <span style={{ color: s.color }}>{s.icon}</span>
                      </span>
                      <span className="text-ship-silver">{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* 战报复盘Modal */}
      {showReplay && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in" onClick={() => setShowReplay(false)}>
          <div className="hud-panel w-full max-w-4xl max-h-[80vh] flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-energy-cyan/20">
              <div className="font-display font-bold text-xl text-white">完整战报 - {stage?.name}</div>
              <Button variant="ghost" onClick={() => setShowReplay(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="p-5 overflow-auto text-sm space-y-2 flex-1">
              {battleLog.map((l) => (
                <div key={l.id} className="flex gap-3 items-start py-1.5 border-b border-space-700/50">
                  <span className="font-mono text-xs text-energy-cyan/80 min-w-[10ch]">T{l.turn.toString().padStart(2, '0')}</span>
                  <span className={`font-mono text-xs min-w-[8ch] ${
                    l.type === 'system' ? 'text-energy-cyan' :
                    l.type === 'attack' ? 'text-danger-red' :
                    l.type === 'skill' ? 'text-energy-purple' :
                    l.type === 'heal' ? 'text-life-green' :
                    l.type === 'environment' ? 'text-danger-yellow' :
                    'text-ship-silver'
                  }`}>【{({ system: '系统', attack: '战斗', move: '移动', skill: '技能', heal: '治疗', environment: '环境' } as any)[l.type] || l.type}】</span>
                  <span className="text-ship-silver flex-1">{l.message}</span>
                  {l.value !== undefined && l.value > 0 && (
                    <span className={`font-bold ${l.type === 'heal' ? 'text-life-green' : 'text-danger-red'}`}>
                      {l.type === 'heal' ? '+' : '-'}{l.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatMini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-[10px] text-ship-silver font-display tracking-wider">{label}</div>
      <div className={`font-display font-bold ${color}`}>{value}</div>
    </div>
  );
}

function FleetShipCard({ ship, selected, onClick, enemy = false }: { ship: Ship; selected?: boolean; onClick?: () => void; enemy?: boolean }) {
  const Icon = getShipIcon(ship);
  const dead = ship.hp <= 0;
  return (
    <div
      onClick={onClick}
      className={`relative p-2.5 rounded-lg cursor-pointer transition-all border ${
        selected
          ? `border-energy-cyan shadow-glow ${enemy ? 'bg-danger-red/10' : 'bg-energy-cyan/10'}`
          : `border-ship-dark/60 bg-space-900/50 hover:border-ship-gray hover:bg-space-800/70`
      } ${dead ? 'opacity-40 grayscale' : ''}`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`w-10 h-10 rounded-md flex items-center justify-center border ${
            enemy ? 'border-danger-red/50 bg-danger-red/10' : 'border-energy-cyan/40 bg-energy-cyan/10'
          }`}
        >
          <Icon className={`w-5 h-5 ${enemy ? 'text-danger-red' : 'text-energy-cyan'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-display font-semibold text-sm truncate ${enemy ? 'text-danger-red' : 'text-white'}`}>
            {dead ? '💀 ' : ''}{ship.name}
          </div>
          <div className="mt-1 space-y-0.5">
            <div>
              <div className="text-[9px] text-ship-silver flex justify-between">
                <span>HP</span><span>{ship.hp}/{ship.maxHp}</span>
              </div>
              <div className="h-1 rounded bg-space-950 overflow-hidden">
                <div
                  className={`h-full ${enemy ? 'bg-gradient-to-r from-danger-red to-danger-orange' : 'bg-gradient-to-r from-life-green to-life-teal'}`}
                  style={{ width: `${(ship.hp / ship.maxHp) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="text-[9px] text-ship-silver flex justify-between">
                <span>护盾</span><span>{ship.shield}/{ship.maxShield}</span>
              </div>
              <div className="h-1 rounded bg-space-950 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-energy-cyan to-energy-blue"
                  style={{ width: `${(ship.shield / ship.maxShield) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        {!enemy && (
          <div className="text-[10px] font-display text-energy-cyan bg-space-900 px-1.5 py-0.5 rounded border border-energy-cyan/30">
            {ship.actionPoints}AP
          </div>
        )}
      </div>
    </div>
  );
}
