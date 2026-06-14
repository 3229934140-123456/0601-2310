import type { Ship, Equipment } from '../types';

export const getShipEquipments = (ship: Ship, allEquipments: Equipment[]): Equipment[] => {
  const ids = [ship.weaponId, ship.shieldModuleId, ...(ship.moduleIds || [])].filter(Boolean) as string[];
  return allEquipments.filter((e) => ids.includes(e.id));
};

export const calcEquipmentStats = (equipments: Equipment[]): Record<string, number> => {
  const stats: Record<string, number> = {};
  equipments.forEach((eq) => {
    Object.entries(eq.stats || {}).forEach(([key, val]) => {
      stats[key] = (stats[key] || 0) + (val || 0);
    });
  });
  return stats;
};

export const getShipFinalStats = (ship: Ship, allEquipments: Equipment[]) => {
  const base = ship.baseStats || {
    maxHp: ship.maxHp,
    maxShield: ship.maxShield,
    attack: ship.attack,
    defense: ship.defense,
    speed: ship.speed,
    moveRange: ship.moveRange,
    attackRange: ship.attackRange,
    maxActionPoints: ship.maxActionPoints,
  };
  const eqStats = calcEquipmentStats(getShipEquipments(ship, allEquipments));
  return {
    maxHp: Math.floor(base.maxHp + (eqStats.maxHp || 0)),
    maxShield: Math.floor(base.maxShield + (eqStats.maxShield || 0)),
    attack: Math.floor(base.attack + (eqStats.attack || 0)),
    defense: Math.floor(base.defense + (eqStats.defense || 0)),
    speed: Math.floor(base.speed + (eqStats.speed || 0)),
    moveRange: Math.floor(base.moveRange + (eqStats.moveRange || 0)),
    attackRange: Math.floor(base.attackRange + (eqStats.attackRange || 0)),
    maxActionPoints: Math.floor(base.maxActionPoints + (eqStats.maxActionPoints || 0)),
    critRate: eqStats.critRate || 0,
    critDamage: eqStats.critDamage || 0,
  };
};

export const refreshShipStats = (ship: Ship, allEquipments: Equipment[]): Ship => {
  const final = getShipFinalStats(ship, allEquipments);
  const hpRatio = ship.hp / Math.max(1, ship.maxHp);
  const shieldRatio = ship.shield / Math.max(1, ship.maxShield);
  return {
    ...ship,
    maxHp: final.maxHp,
    maxShield: final.maxShield,
    attack: final.attack,
    defense: final.defense,
    speed: final.speed,
    moveRange: final.moveRange,
    attackRange: final.attackRange,
    maxActionPoints: final.maxActionPoints,
    hp: Math.min(Math.floor(final.maxHp * hpRatio), final.maxHp),
    shield: Math.min(Math.floor(final.maxShield * shieldRatio), final.maxShield),
    actionPoints: Math.min(ship.actionPoints, final.maxActionPoints),
  };
};
