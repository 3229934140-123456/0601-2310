import type { Equipment } from '../types';

export const EQUIPMENTS: Equipment[] = [
  {
    id: 'weapon_01',
    name: '等离子主炮',
    type: 'weapon',
    rarity: 4,
    level: 1,
    stats: {
      attack: 60,
      critRate: 10
    },
    description: '标准型等离子武器，提供稳定的火力输出，对护盾单位有额外伤害。'
  },
  {
    id: 'weapon_02',
    name: '量子湮灭炮',
    type: 'weapon',
    rarity: 5,
    level: 1,
    stats: {
      attack: 120,
      critRate: 20,
      critDamage: 50
    },
    description: '利用量子湮灭原理制造的顶级武器，能直接瓦解目标物质结构。'
  },
  {
    id: 'weapon_03',
    name: '连射脉冲炮',
    type: 'weapon',
    rarity: 3,
    level: 1,
    stats: {
      attack: 35,
      attackRange: 1,
      critRate: 5
    },
    description: '高射速脉冲武器，牺牲单发威力换取更远的射程和持续输出。'
  },
  {
    id: 'weapon_04',
    name: '磁轨狙击炮',
    type: 'weapon',
    rarity: 4,
    level: 1,
    stats: {
      attack: 90,
      attackRange: 2,
      critRate: 25
    },
    description: '电磁加速轨道炮，射程极远且精度极高，擅长打击远距离目标。'
  },
  {
    id: 'shield_01',
    name: '标准能量护盾',
    type: 'shield',
    rarity: 2,
    level: 1,
    stats: {
      maxShield: 200,
      defense: 20
    },
    description: '联邦制式能量护盾发生器，能有效抵挡常规武器攻击。'
  },
  {
    id: 'shield_02',
    name: '相位偏转护盾',
    type: 'shield',
    rarity: 4,
    level: 1,
    stats: {
      maxShield: 500,
      defense: 50,
      speed: 10
    },
    description: '使用相位偏转技术的高级护盾，在防御的同时略微提升机动性。'
  },
  {
    id: 'shield_03',
    name: '反射力场护盾',
    type: 'shield',
    rarity: 5,
    level: 1,
    stats: {
      maxShield: 800,
      defense: 80
    },
    description: '传说级反射力场，可以将部分攻击反射回攻击者。'
  },
  {
    id: 'shield_04',
    name: '自适应装甲护盾',
    type: 'shield',
    rarity: 3,
    level: 1,
    stats: {
      maxShield: 350,
      defense: 40,
      maxHp: 150
    },
    description: '融合装甲与护盾技术的混合型防御系统，同时提升生命和护盾上限。'
  },
  {
    id: 'module_01',
    name: '高速引擎模块',
    type: 'module',
    rarity: 3,
    level: 1,
    stats: {
      speed: 30,
      moveRange: 1
    },
    description: '升级型推进系统，大幅提升舰船速度和移动范围。'
  },
  {
    id: 'module_02',
    name: '纳米修复模块',
    type: 'module',
    rarity: 4,
    level: 1,
    stats: {
      maxHp: 300,
      defense: 25
    },
    description: '内置纳米修复系统，持续修复舰体损伤并提升最大生命值。'
  },
  {
    id: 'module_03',
    name: '战术指挥模块',
    type: 'module',
    rarity: 5,
    level: 1,
    stats: {
      attack: 40,
      maxActionPoints: 1,
      critRate: 10
    },
    description: '旗舰级战术AI模块，为舰长提供战术支援，提升作战效率。'
  },
  {
    id: 'module_04',
    name: '能量循环模块',
    type: 'module',
    rarity: 3,
    level: 1,
    stats: {
      maxShield: 250,
      attack: 25,
      maxHp: 100
    },
    description: '高效能量循环系统，将多余能量分配到各个子系统，全面提升属性。'
  }
];
