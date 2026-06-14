import { create } from 'zustand';
import type {
  BattleState, Ship, Position, LogEntry, StatusEffect, Skill,
  EnvironmentTile, PlayerProfile, Stage, BattleLogArchive, Material
} from '../types';
import { calculateDamage, calculateHitChance, isCritical, getDistance, calculateMoveRange, isInAttackRange } from '../utils/battleCalculations';
import { posKey } from '../utils/gridUtils';
import { randomInt, chance, pickRandom, shuffle } from '../utils/randomUtils';

let logIdCounter = 0;
const genLogId = () => `log_${Date.now()}_${++logIdCounter}`;
let fdIdCounter = 0;
const genFdId = () => `fd_${Date.now()}_${++fdIdCounter}`;

const createInitialBattle = (
  stage: Stage,
  playerFleetTemplate: Ship[],
  profile: PlayerProfile
): BattleState => {
  const gridW = stage.gridSize.width;
  const gridH = stage.gridSize.height;
  const startPositions: Position[] = [
    { x: 1, y: Math.floor(gridH / 2) - 1 },
    { x: 1, y: Math.floor(gridH / 2) },
    { x: 1, y: Math.floor(gridH / 2) + 1 },
    { x: 2, y: Math.floor(gridH / 2) },
  ];

  const enemyStartPositions: Position[] = [];
  for (let i = 0; i < stage.enemyFleetTemplate.length; i++) {
    const rowOffset = i % 2 === 0 ? -Math.floor(i / 2) : Math.floor(i / 2) + 1;
    enemyStartPositions.push({
      x: gridW - 2,
      y: Math.max(0, Math.min(gridH - 1, Math.floor(gridH / 2) + rowOffset)),
    });
  }

  const playerFleet: Ship[] = playerFleetTemplate
    .filter((s) => s.hp > 0)
    .slice(0, 4)
    .map((s, i) => ({
      ...s,
      id: `p_${s.id}_${Date.now()}_${i}`,
      faction: 'player' as const,
      position: startPositions[i] || { x: i + 1, y: 1 },
      hp: s.maxHp,
      shield: s.maxShield,
      actionPoints: s.maxActionPoints,
      statusEffects: [],
    }));

  const enemyFleet: Ship[] = stage.enemyFleetTemplate.map((s, i) => ({
    ...s,
    id: `e_${s.id}_${Date.now()}_${i}`,
    faction: 'enemy' as const,
    position: enemyStartPositions[i] || { x: gridW - 2, y: i + 1 },
    hp: s.maxHp,
    shield: s.maxShield,
    actionPoints: s.maxActionPoints,
    statusEffects: [],
  }));

  const occupied = new Set<string>();
  [...playerFleet, ...enemyFleet].forEach((s) => {
    if (s.position) occupied.add(posKey(s.position));
  });

  return {
    id: `battle_${stage.id}_${Date.now()}`,
    stageId: stage.id,
    turn: 1,
    phase: 'player',
    playerFleet,
    enemyFleet,
    gridSize: { width: gridW, height: gridH },
    environmentTiles: stage.environment.map((e) => ({ ...e })),
    battleLog: [
      {
        id: genLogId(),
        turn: 1,
        timestamp: Date.now(),
        type: 'system',
        message: `【第1回合】战斗开始！敌方舰队出现在 ${stage.name} 区域`,
      },
    ],
    selectedShipId: null,
    targetedShipId: null,
    validMoves: [],
    validTargets: [],
    actionMode: 'none',
    finished: false,
    floatingDamage: [],
  };
};

interface BattleStoreState extends BattleState {
  profile: PlayerProfile | null;
  stage: Stage | null;

  initBattle: (stage: Stage, playerShips: Ship[], profile: PlayerProfile) => void;
  resetBattle: () => void;

  selectShip: (shipId: string | null) => void;
  setActionMode: (mode: 'none' | 'move' | 'attack' | 'skill', skillId?: string) => void;
  setTarget: (shipId: string | null) => void;

  moveShip: (target: Position) => boolean;
  attackTarget: (targetId: string) => boolean;
  useSkill: (skillId: string, targetId: string) => boolean;
  repairShip: (shipId: string) => boolean;
  endTurn: () => void;

  triggerEnvironmentPhase: () => void;
  runEnemyAI: () => void;

  checkVictory: () => void;
  addFloatingDamage: (shipId: string, value: number, type: 'damage' | 'heal' | 'miss') => void;
  clearFloatingDamage: () => void;

  addLog: (entry: Omit<LogEntry, 'id' | 'turn' | 'timestamp'>) => void;
  applyStatusEffects: (ship: Ship) => Ship;
}

export const useBattleStore = create<BattleStoreState>((set, get) => ({
  id: '',
  stageId: '',
  turn: 1,
  phase: 'player',
  playerFleet: [],
  enemyFleet: [],
  gridSize: { width: 12, height: 8 },
  environmentTiles: [],
  battleLog: [],
  selectedShipId: null,
  targetedShipId: null,
  validMoves: [],
  validTargets: [],
  actionMode: 'none',
  finished: false,
  floatingDamage: [],
  profile: null,
  stage: null,

  initBattle: (stage, playerShips, profile) => {
    const battle = createInitialBattle(stage, playerShips, profile);
    set({
      ...battle,
      profile,
      stage,
    });
  },

  resetBattle: () => {
    set({
      id: '',
      stageId: '',
      turn: 1,
      phase: 'player',
      playerFleet: [],
      enemyFleet: [],
      battleLog: [],
      selectedShipId: null,
      targetedShipId: null,
      validMoves: [],
      validTargets: [],
      actionMode: 'none',
      finished: false,
      floatingDamage: [],
      stage: null,
    });
  },

  selectShip: (shipId) => {
    if (!shipId) {
      set({ selectedShipId: null, validMoves: [], validTargets: [], actionMode: 'none' });
      return;
    }
    const state = get();
    const ship = [...state.playerFleet, ...state.enemyFleet].find((s) => s.id === shipId);
    if (!ship) return;

    if (ship.faction === 'player' && state.phase === 'player') {
      const obstacles = new Set<string>();
      [...state.playerFleet, ...state.enemyFleet].forEach((s) => {
        if (s.id !== ship.id && s.position && s.hp > 0) obstacles.add(posKey(s.position));
      });
      const moves = ship.actionPoints > 0
        ? calculateMoveRange(ship, state.gridSize, obstacles)
        : [];
      set({
        selectedShipId: shipId,
        validMoves: moves,
        validTargets: [],
        actionMode: 'none',
      });
    } else {
      set({ selectedShipId: shipId, validMoves: [], validTargets: [] });
    }
  },

  setActionMode: (mode, skillId) => {
    const state = get();
    const ship = state.playerFleet.find((s) => s.id === state.selectedShipId);
    if (!ship || ship.faction !== 'player') return;

    if (mode === 'attack' && ship.actionPoints >= 2) {
      const targets = state.enemyFleet
        .filter((e) => e.hp > 0 && e.position && ship.position && isInAttackRange(ship, e))
        .map((e) => e.id);
      set({ actionMode: 'attack', validTargets: targets, activeSkillId: undefined });
    } else if (mode === 'skill' && skillId) {
      const skill = ship.crewIds
        .flatMap(() => [])
        .find(() => false) as Skill | undefined;
      const apCost = 3;
      if (ship.actionPoints >= apCost) {
        const targets = state.enemyFleet.filter((e) => e.hp > 0).map((e) => e.id);
        set({ actionMode: 'skill', validTargets: targets, activeSkillId: skillId });
      }
    } else {
      set({ actionMode: mode, activeSkillId: skillId });
    }
  },

  setTarget: (shipId) => set({ targetedShipId: shipId }),

  moveShip: (target) => {
    const state = get();
    const ship = state.playerFleet.find((s) => s.id === state.selectedShipId);
    if (!ship || state.phase !== 'player' || ship.actionPoints < 1) return false;
    const isValid = state.validMoves.some((m) => m.x === target.x && m.y === target.y);
    if (!isValid || !ship.position) return false;

    const dist = getDistance(ship.position, target);
    const apCost = Math.max(1, Math.min(ship.actionPoints, dist));
    const newShip: Ship = { ...ship, position: target, actionPoints: ship.actionPoints - apCost };

    const obstacles = new Set<string>();
    state.playerFleet.forEach((s) => {
      if (s.id !== ship.id && s.position && s.hp > 0) obstacles.add(posKey(s.position));
    });
    state.enemyFleet.forEach((s) => {
      if (s.position && s.hp > 0) obstacles.add(posKey(s.position));
    });
    obstacles.add(posKey(target));
    const newMoves = newShip.actionPoints > 0
      ? calculateMoveRange(newShip, state.gridSize, obstacles)
      : [];

    const newPlayerFleet = state.playerFleet.map((s) => (s.id === ship.id ? newShip : s));
    get().addLog({
      type: 'move',
      sourceId: ship.id,
      sourceName: ship.name,
      message: `${ship.name} 移动到 (${target.x}, ${target.y})，消耗 ${apCost} 行动点`,
    });
    set({ playerFleet: newPlayerFleet, validMoves: newMoves });
    return true;
  },

  attackTarget: (targetId) => {
    const state = get();
    const attacker = state.playerFleet.find((s) => s.id === state.selectedShipId);
    const defender = state.enemyFleet.find((s) => s.id === targetId);
    if (!attacker || !defender || state.phase !== 'player') return false;
    if (attacker.actionPoints < 2) return false;
    if (!state.validTargets.includes(targetId)) return false;

    const hitChance = calculateHitChance(attacker, defender);
    const hit = chance(hitChance);
    const crit = isCritical(70);
    let damage = 0;

    let newDefender = { ...defender };
    let logMsg = '';

    if (!hit) {
      logMsg = `${attacker.name} → ${defender.name}：未命中！`;
      get().addFloatingDamage(targetId, 0, 'miss');
    } else {
      damage = calculateDamage(attacker, defender, crit);
      let remainDmg = damage;
      if (newDefender.shield > 0) {
        const absorbed = Math.min(newDefender.shield, Math.ceil(remainDmg * 0.7));
        newDefender.shield -= absorbed;
        remainDmg -= absorbed;
      }
      newDefender.hp = Math.max(0, newDefender.hp - remainDmg);
      const critStr = crit ? '【暴击！】' : '';
      logMsg = `${attacker.name} ${critStr}攻击 ${defender.name}，造成 ${damage} 伤害${newDefender.hp <= 0 ? '（舰船被摧毁！）' : ''}`;
      get().addFloatingDamage(targetId, damage, 'damage');
      if (newDefender.hp <= 0) {
        get().addFloatingDamage(targetId, damage, 'damage');
      }
    }

    const newAttacker = { ...attacker, actionPoints: attacker.actionPoints - 2 };
    const newPlayer = state.playerFleet.map((s) => (s.id === attacker.id ? newAttacker : s));
    const newEnemy = state.enemyFleet.map((s) => (s.id === defender.id ? newDefender : s));

    get().addLog({
      type: 'attack',
      sourceId: attacker.id,
      sourceName: attacker.name,
      targetId: defender.id,
      targetName: defender.name,
      value: damage,
      critical: crit,
      message: logMsg,
    });
    set({
      playerFleet: newPlayer,
      enemyFleet: newEnemy,
      selectedShipId: newAttacker.id,
      actionMode: 'none',
      validTargets: [],
    });
    setTimeout(() => get().clearFloatingDamage(), 1400);
    get().checkVictory();
    return true;
  },

  useSkill: (skillId, targetId) => {
    const state = get();
    const caster = state.playerFleet.find((s) => s.id === state.selectedShipId);
    if (!caster || state.phase !== 'player' || caster.actionPoints < 3) return false;

    const isHeal = skillId.includes('heal') || skillId.includes('repair');
    const isBuff = skillId.includes('buff') || skillId.includes('boost');
    let targets: Ship[] = [];
    let newPlayer = [...state.playerFleet];
    let newEnemy = [...state.enemyFleet];
    let msg = '';
    const skillNameMap: Record<string, string> = {
      overcharge: '过载打击',
      shield_boost: '护盾强化',
      emergency_repair: '紧急维修',
      precision_strike: '精准打击',
      focus_fire: '集火指令',
      damage_control: '损害管制',
    };
    const sName = skillNameMap[skillId] || '战术技能';

    if (isHeal || isBuff) {
      targets = state.playerFleet.filter((s) => s.hp > 0);
      const target = targets.find((s) => s.id === targetId) || caster;
      const healAmount = Math.floor(target.maxHp * 0.25) + 200;
      const shieldRestore = Math.floor(target.maxShield * 0.5);
      newPlayer = newPlayer.map((s) =>
        s.id === target.id
          ? {
              ...s,
              hp: Math.min(s.maxHp, s.hp + healAmount),
              shield: Math.min(s.maxShield, s.shield + shieldRestore),
            }
          : s,
      );
      msg = `${caster.name} 施放【${sName}】，恢复 ${target.name} ${healAmount} HP 和 ${shieldRestore} 护盾`;
      get().addFloatingDamage(target.id, healAmount, 'heal');
    } else {
      targets = state.enemyFleet.filter((e) => e.hp > 0);
      targets.forEach((t) => {
        const baseDmg = calculateDamage(caster, t, true);
        const dmg = Math.floor(baseDmg * 1.4);
        newEnemy = newEnemy.map((s) =>
          s.id === t.id ? { ...s, hp: Math.max(0, s.hp - dmg), shield: Math.max(0, s.shield - 100) } : s,
        );
        msg += `${t.name} 受到 ${dmg} 点范围伤害；`;
        get().addFloatingDamage(t.id, dmg, 'damage');
      });
      msg = `${caster.name} 施放【${sName}】：` + msg;
    }

    newPlayer = newPlayer.map((s) =>
      s.id === caster.id ? { ...s, actionPoints: s.actionPoints - 3 } : s,
    );
    get().addLog({ type: 'skill', sourceId: caster.id, sourceName: caster.name, message: msg });
    set({
      playerFleet: newPlayer,
      enemyFleet: newEnemy,
      actionMode: 'none',
      validTargets: [],
      activeSkillId: undefined,
    });
    setTimeout(() => get().clearFloatingDamage(), 1400);
    get().checkVictory();
    return true;
  },

  repairShip: (shipId) => {
    const state = get();
    const ship = state.playerFleet.find((s) => s.id === shipId);
    if (!ship || state.phase !== 'player' || ship.actionPoints < 2) return false;
    if (ship.hp >= ship.maxHp && ship.shield >= ship.maxShield) return false;

    const hpRepair = Math.min(ship.maxHp - ship.hp, Math.floor(ship.maxHp * 0.15) + 150);
    const shieldRepair = Math.min(ship.maxShield - ship.shield, Math.floor(ship.maxShield * 0.3));
    const newShip = {
      ...ship,
      hp: ship.hp + hpRepair,
      shield: ship.shield + shieldRepair,
      actionPoints: ship.actionPoints - 2,
    };
    const newPlayer = state.playerFleet.map((s) => (s.id === shipId ? newShip : s));
    get().addLog({
      type: 'heal',
      sourceId: shipId,
      sourceName: ship.name,
      message: `${ship.name} 启动维修舱段，恢复 ${hpRepair} HP、${shieldRepair} 护盾`,
    });
    if (hpRepair > 0) get().addFloatingDamage(shipId, hpRepair, 'heal');
    set({ playerFleet: newPlayer });
    setTimeout(() => get().clearFloatingDamage(), 1200);
    return true;
  },

  endTurn: () => {
    const state = get();
    if (state.phase !== 'player' || state.finished) return;
    get().addLog({ type: 'system', message: `【玩家回合结束】` });
    set({
      phase: 'enemy',
      selectedShipId: null,
      validMoves: [],
      validTargets: [],
      actionMode: 'none',
    });
    setTimeout(() => get().runEnemyAI(), 600);
  },

  runEnemyAI: () => {
    const state = get();
    if (state.finished) return;

    let playerShips = [...state.playerFleet];
    let enemyShips = [...state.enemyFleet];
    const aliveEnemies = enemyShips.filter((e) => e.hp > 0);

    const processNext = (idx: number) => {
      if (idx >= aliveEnemies.length) {
        // AI结束 -> 环境阶段
        set({ playerFleet: playerShips, enemyFleet: enemyShips });
        get().addLog({ type: 'system', message: `【敌方回合结束】` });
        setTimeout(() => get().triggerEnvironmentPhase(), 400);
        return;
      }
      const enemy = aliveEnemies[idx];
      const alivePlayers = playerShips.filter((p) => p.hp > 0 && p.position);
      if (alivePlayers.length === 0 || !enemy.position) {
        processNext(idx + 1);
        return;
      }

      // 找最近玩家舰船
      let nearest = alivePlayers[0];
      let nearestDist = Infinity;
      alivePlayers.forEach((p) => {
        if (p.position) {
          const d = getDistance(enemy.position!, p.position);
          if (d < nearestDist) {
            nearestDist = d;
            nearest = p;
          }
        }
      });

      let actions = enemy.maxActionPoints;
      const enemyCur = { ...enemy };

      // 若在攻击范围内，先攻击
      if (isInAttackRange(enemyCur, nearest) && actions >= 2) {
        const hit = chance(calculateHitChance(enemyCur, nearest));
        const crit = isCritical(50);
        const dmg = hit ? calculateDamage(enemyCur, nearest, crit) : 0;
        let newTarget = { ...nearest };
        if (hit && dmg > 0) {
          let remain = dmg;
          if (newTarget.shield > 0) {
            const a = Math.min(newTarget.shield, Math.ceil(remain * 0.7));
            newTarget.shield -= a;
            remain -= a;
          }
          newTarget.hp = Math.max(0, newTarget.hp - remain);
          get().addFloatingDamage(newTarget.id, dmg, 'damage');
        }
        actions -= 2;
        const critStr = crit ? '【暴击】' : '';
        const msg = hit
          ? `${enemy.name} ${critStr}攻击 ${newTarget.name}，造成 ${dmg} 伤害${newTarget.hp <= 0 ? '（舰船被摧毁！）' : ''}`
          : `${enemy.name} → ${newTarget.name}：未命中！`;
        if (!hit) get().addFloatingDamage(newTarget.id, 0, 'miss');
        get().addLog({
          type: 'attack',
          sourceId: enemyCur.id,
          sourceName: enemyCur.name,
          targetId: newTarget.id,
          targetName: newTarget.name,
          value: dmg,
          critical: crit,
          message: msg,
        });
        playerShips = playerShips.map((s) => (s.id === newTarget.id ? newTarget : s));
        enemyShips = enemyShips.map((s) => (s.id === enemyCur.id ? { ...s, actionPoints: actions } : s));
      } else if (actions >= 1 && nearest.position) {
        // 向玩家方向移动一步
        const dx = Math.sign(nearest.position.x - enemyCur.position!.x);
        const dy = Math.sign(nearest.position.y - enemyCur.position!.y);
        let newPos: Position = { x: enemyCur.position!.x + dx, y: enemyCur.position!.y + dy };
        // 检查是否被占用
        const occupied = new Set<string>();
        playerShips.forEach((p) => p.position && occupied.add(posKey(p.position)));
        enemyShips.forEach((e) => e.id !== enemyCur.id && e.position && occupied.add(posKey(e.position)));
        if (
          occupied.has(posKey(newPos)) ||
          newPos.x < 0 || newPos.x >= state.gridSize.width ||
          newPos.y < 0 || newPos.y >= state.gridSize.height
        ) {
          newPos = enemyCur.position!;
        } else {
          actions -= 1;
        }
        const updatedEnemy = { ...enemyCur, position: newPos, actionPoints: actions };
        enemyShips = enemyShips.map((s) => (s.id === enemyCur.id ? updatedEnemy : s));
      }

      set({ playerFleet: [...playerShips], enemyFleet: [...enemyShips] });
      get().checkVictory();
      setTimeout(() => processNext(idx + 1), 700);
    };

    processNext(0);
  },

  triggerEnvironmentPhase: () => {
    const state = get();
    if (state.finished) return;
    let playerShips = [...state.playerFleet];
    let enemyShips = [...state.enemyFleet];

    state.environmentTiles.forEach((tile) => {
      const key = posKey(tile.position);
      const allShips = [...playerShips, ...enemyShips];
      allShips.forEach((ship) => {
        if (ship.hp <= 0 || !ship.position) return;
        if (posKey(ship.position) === key) {
          if (tile.type === 'asteroid' && tile.damage) {
            const dmg = tile.damage;
            if (ship.faction === 'player') {
              playerShips = playerShips.map((s) =>
                s.id === ship.id ? { ...s, hp: Math.max(0, s.hp - dmg) } : s,
              );
            } else {
              enemyShips = enemyShips.map((s) =>
                s.id === ship.id ? { ...s, hp: Math.max(0, s.hp - dmg) } : s,
              );
            }
            get().addLog({
              type: 'environment',
              targetId: ship.id,
              targetName: ship.name,
              value: dmg,
              message: `⚠ 环境事件：${ship.name} 被陨石带撞击，受到 ${dmg} 伤害！`,
            });
            get().addFloatingDamage(ship.id, dmg, 'damage');
          } else if (tile.type === 'nebula') {
            // 星云恢复少量护盾
            const restore = Math.floor(ship.maxShield * 0.1);
            if (restore > 0 && ship.shield < ship.maxShield) {
              if (ship.faction === 'player') {
                playerShips = playerShips.map((s) =>
                  s.id === ship.id ? { ...s, shield: Math.min(s.maxShield, s.shield + restore) } : s,
                );
              } else {
                enemyShips = enemyShips.map((s) =>
                  s.id === ship.id ? { ...s, shield: Math.min(s.maxShield, s.shield + restore) } : s,
                );
              }
              get().addLog({
                type: 'environment',
                message: `☁ 环境事件：${ship.name} 进入星云，护盾恢复 ${restore}`,
              });
            }
          } else if (tile.type === 'radiation' && tile.damage) {
            const dmg = Math.floor(tile.damage * 0.6);
            if (ship.faction === 'player') {
              playerShips = playerShips.map((s) =>
                s.id === ship.id ? { ...s, hp: Math.max(0, s.hp - dmg) } : s,
              );
            } else {
              enemyShips = enemyShips.map((s) =>
                s.id === ship.id ? { ...s, hp: Math.max(0, s.hp - dmg) } : s,
              );
            }
            get().addLog({
              type: 'environment',
              message: `☢ 环境事件：${ship.name} 在辐射区持续受损 ${dmg} HP`,
            });
          }
        }
      });
    });

    set({ playerFleet: playerShips, enemyFleet: enemyShips });
    setTimeout(() => get().clearFloatingDamage(), 1000);
    get().checkVictory();

    // 进入下一回合玩家阶段
    const newTurn = state.turn + 1;
    const resetPlayer = playerShips.map((s) => (s.hp > 0 ? { ...s, actionPoints: s.maxActionPoints } : s));
    const resetEnemy = enemyShips.map((s) => (s.hp > 0 ? { ...s, actionPoints: s.maxActionPoints } : s));

    get().addLog({
      type: 'system',
      message: `——— 【第 ${newTurn} 回合 开始】———`,
    });
    setTimeout(() => {
      set({ turn: newTurn, phase: 'player', playerFleet: resetPlayer, enemyFleet: resetEnemy });
    }, 500);
  },

  checkVictory: () => {
    const state = get();
    if (state.finished) return;
    const playerAlive = state.playerFleet.some((s) => s.hp > 0);
    const enemyAlive = state.enemyFleet.some((s) => s.hp > 0);
    let victory: boolean | undefined;
    if (!enemyAlive) victory = true;
    else if (!playerAlive) victory = false;

    if (victory !== undefined) {
      get().addLog({
        type: 'system',
        message: victory ? '🎉 战斗胜利！所有敌舰已被歼灭' : '💀 战斗失败...舰队全灭',
      });
      set({ finished: true, victory });
    }
  },

  addFloatingDamage: (shipId, value, type) => {
    const state = get();
    const ship = [...state.playerFleet, ...state.enemyFleet].find((s) => s.id === shipId);
    if (!ship || !ship.position) return;
    const cellSize = 56;
    const entry = {
      id: genFdId(),
      shipId,
      value,
      type,
      x: ship.position.x * cellSize + cellSize / 2,
      y: ship.position.y * cellSize + 8,
    };
    set({ floatingDamage: [...state.floatingDamage, entry] });
    setTimeout(() => {
      set({ floatingDamage: get().floatingDamage.filter((f) => f.id !== entry.id) });
    }, 1300);
  },

  clearFloatingDamage: () => set({ floatingDamage: [] }),

  addLog: (entry) => {
    const state = get();
    const newEntry: LogEntry = {
      ...entry,
      id: genLogId(),
      turn: state.turn,
      timestamp: Date.now(),
    };
    set({ battleLog: [...state.battleLog, newEntry] });
  },

  applyStatusEffects: (ship) => ship,
}));
