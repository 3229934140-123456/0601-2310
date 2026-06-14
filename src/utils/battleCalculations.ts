import type { Ship, Position, StatusEffect } from '../types';
import { randomFloat, randomInt, chance } from './randomUtils';
import { getDistance } from './gridUtils';
export { getDistance };

export function calculateDamage(
  attacker: Ship,
  defender: Ship,
  isCrit: boolean = false,
): number {
  let atk = attacker.attack;
  let def = defender.defense;

  for (const effect of attacker.statusEffects) {
    if (effect.statsMod.attack) {
      atk += effect.statsMod.attack;
    }
  }
  for (const effect of defender.statusEffects) {
    if (effect.statsMod.defense) {
      def += effect.statsMod.defense;
    }
  }

  const baseDamage = Math.max(1, atk - def * 0.5);
  const multiplier = isCrit ? 1.5 + randomFloat(0, 0.3) : 1;
  const variance = randomFloat(0.9, 1.1);
  const rawDamage = baseDamage * multiplier * variance;

  return Math.max(1, Math.round(rawDamage));
}

export function calculateHitChance(attacker: Ship, defender: Ship): number {
  let atkSpeed = attacker.speed;
  let defSpeed = defender.speed;

  for (const effect of attacker.statusEffects) {
    if (effect.statsMod.speed) {
      atkSpeed += effect.statsMod.speed;
    }
  }
  for (const effect of defender.statusEffects) {
    if (effect.statsMod.speed) {
      defSpeed += effect.statsMod.speed;
    }
  }

  const speedDiff = atkSpeed - defSpeed;
  const baseChance = 0.75;
  const speedModifier = speedDiff * 0.01;
  const hitChance = Math.max(0.3, Math.min(0.98, baseChance + speedModifier));

  return hitChance;
}

export function isCritical(gunnerStat: number): boolean {
  const critChance = Math.min(0.5, 0.05 + gunnerStat * 0.005);
  return chance(critChance);
}

export function isInAttackRange(attacker: Ship, target: Ship): boolean {
  if (!attacker.position || !target.position) {
    return false;
  }

  let range = attacker.attackRange;
  for (const effect of attacker.statusEffects) {
    if (effect.statsMod.attackRange) {
      range += effect.statsMod.attackRange;
    }
  }

  const dist = getDistance(attacker.position, target.position);
  return dist <= range;
}

export function calculateMoveRange(
  ship: Ship,
  gridSize: { width: number; height: number },
  obstacles: Set<string> | Position[] = [],
): Position[] {
  if (!ship.position) {
    return [];
  }

  let range = ship.moveRange;
  for (const effect of ship.statusEffects) {
    if (effect.statsMod.moveRange) {
      range += effect.statsMod.moveRange;
    }
  }

  let obstacleSet: Set<string>;
  if (obstacles instanceof Set) {
    obstacleSet = new Set(obstacles);
  } else {
    obstacleSet = new Set(obstacles.map((p) => `${p.x},${p.y}`));
  }
  obstacleSet.delete(`${ship.position.x},${ship.position.y}`);

  const queue: { pos: Position; steps: number }[] = [{ pos: ship.position, steps: 0 }];
  const visited = new Set<string>();
  const result: Position[] = [];

  visited.add(`${ship.position.x},${ship.position.y}`);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.steps > 0) {
      result.push(current.pos);
    }

    if (current.steps >= range) {
      continue;
    }

    const neighbors = [
      { x: current.pos.x + 1, y: current.pos.y },
      { x: current.pos.x - 1, y: current.pos.y },
      { x: current.pos.x, y: current.pos.y + 1 },
      { x: current.pos.x, y: current.pos.y - 1 },
    ];

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (
        neighbor.x >= 0 &&
        neighbor.x < gridSize.width &&
        neighbor.y >= 0 &&
        neighbor.y < gridSize.height &&
        !visited.has(key) &&
        !obstacleSet.has(key)
      ) {
        visited.add(key);
        queue.push({ pos: neighbor, steps: current.steps + 1 });
      }
    }
  }

  return result;
}
