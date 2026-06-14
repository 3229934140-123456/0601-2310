import type { Crew } from '../types';

export const CREWS: Crew[] = [
  {
    id: 'crew_captain_01',
    name: '雷恩·星辰',
    role: 'captain',
    rarity: 5,
    level: 1,
    exp: 0,
    maxExp: 100,
    stats: {
      leadership: 95,
      gunnery: 60,
      engineering: 55,
      piloting: 70,
      medical: 45
    },
    talents: [
      {
        id: 'talent_cpt_01',
        name: '战术指挥',
        description: '提升全队攻击力10%',
        unlocked: true,
        tier: 1,
        requires: [],
        effect: { attack: 10 },
        cost: 0
      },
      {
        id: 'talent_cpt_02',
        name: '钢铁意志',
        description: '提升全队最大生命值8%',
        unlocked: false,
        tier: 2,
        requires: ['talent_cpt_01'],
        effect: { maxHp: 8 },
        cost: 2
      }
    ],
    skills: [
      {
        id: 'skill_cpt_01',
        name: '全军突击',
        description: '下一回合全队攻击力提升30%',
        cooldown: 4,
        currentCooldown: 0,
        apCost: 2,
        type: 'buff',
        range: 5,
        effect: {
          statusEffect: {
            id: 'buff_attack_boost',
            name: '攻击提升',
            icon: 'attack_boost',
            duration: 1,
            statsMod: { attack: 30 }
          }
        }
      }
    ],
    avatar: 'captain_rayne',
    backstory: '银河联邦最年轻的舰队指挥官，在第三次星界战争中屡立战功。'
  },
  {
    id: 'crew_captain_02',
    name: '艾莉娅·夜影',
    role: 'captain',
    rarity: 4,
    level: 1,
    exp: 0,
    maxExp: 100,
    stats: {
      leadership: 85,
      gunnery: 70,
      engineering: 50,
      piloting: 75,
      medical: 40
    },
    talents: [
      {
        id: 'talent_cpt_03',
        name: '暗影战术',
        description: '提升全队行动点恢复速度15%',
        unlocked: true,
        tier: 1,
        requires: [],
        effect: { actionPoints: 15 },
        cost: 0
      }
    ],
    skills: [
      {
        id: 'skill_cpt_02',
        name: '紧急机动',
        description: '目标舰船本回合移动范围+2',
        cooldown: 3,
        currentCooldown: 0,
        apCost: 2,
        type: 'buff',
        range: 4,
        effect: {
          statusEffect: {
            id: 'buff_move_boost',
            name: '机动提升',
            icon: 'move_boost',
            duration: 1,
            statsMod: { moveRange: 2 }
          }
        }
      }
    ],
    avatar: 'captain_allya',
    backstory: '来自边境星域的传奇女舰长，以灵活多变的战术著称。'
  },
  {
    id: 'crew_gunner_01',
    name: '马库斯·铁拳',
    role: 'gunner',
    rarity: 5,
    level: 1,
    exp: 0,
    maxExp: 100,
    stats: {
      leadership: 50,
      gunnery: 98,
      engineering: 65,
      piloting: 40,
      medical: 30
    },
    talents: [
      {
        id: 'talent_gun_01',
        name: '精准射击',
        description: '暴击率提升15%',
        unlocked: true,
        tier: 1,
        requires: [],
        effect: { critRate: 15 },
        cost: 0
      },
      {
        id: 'talent_gun_02',
        name: '毁灭打击',
        description: '暴击伤害提升25%',
        unlocked: false,
        tier: 2,
        requires: ['talent_gun_01'],
        effect: { critDamage: 25 },
        cost: 2
      }
    ],
    skills: [
      {
        id: 'skill_gun_01',
        name: '主炮齐射',
        description: '对目标造成200%攻击力的伤害',
        cooldown: 3,
        currentCooldown: 0,
        apCost: 3,
        type: 'attack',
        range: 5,
        effect: {
          damage: 200
        }
      }
    ],
    avatar: 'gunner_marcus',
    backstory: '前帝国舰队首席炮手，能在任何距离命中目标。'
  },
  {
    id: 'crew_gunner_02',
    name: '莉娜·火花',
    role: 'gunner',
    rarity: 4,
    level: 1,
    exp: 0,
    maxExp: 100,
    stats: {
      leadership: 45,
      gunnery: 88,
      engineering: 60,
      piloting: 55,
      medical: 35
    },
    talents: [
      {
        id: 'talent_gun_03',
        name: '快速装填',
        description: '武器冷却时间减少20%',
        unlocked: true,
        tier: 1,
        requires: [],
        effect: { cooldownReduction: 20 },
        cost: 0
      }
    ],
    skills: [
      {
        id: 'skill_gun_02',
        name: '散射弹幕',
        description: '对3格范围内所有敌人造成120%攻击力伤害',
        cooldown: 4,
        currentCooldown: 0,
        apCost: 3,
        type: 'attack',
        range: 4,
        effect: {
          damage: 120,
          aoe: 3
        }
      }
    ],
    avatar: 'gunner_lina',
    backstory: '被誉为"火花少女"的天才炮手，火炮操控天赋惊人。'
  },
  {
    id: 'crew_engineer_01',
    name: '博斯曼·铁块',
    role: 'engineer',
    rarity: 5,
    level: 1,
    exp: 0,
    maxExp: 100,
    stats: {
      leadership: 40,
      gunnery: 45,
      engineering: 96,
      piloting: 50,
      medical: 55
    },
    talents: [
      {
        id: 'talent_eng_01',
        name: '装甲强化',
        description: '防御力提升20%',
        unlocked: true,
        tier: 1,
        requires: [],
        effect: { defense: 20 },
        cost: 0
      },
      {
        id: 'talent_eng_02',
        name: '紧急修复',
        description: '每回合恢复5%最大生命值',
        unlocked: false,
        tier: 2,
        requires: ['talent_eng_01'],
        effect: { hpRegen: 5 },
        cost: 2
      }
    ],
    skills: [
      {
        id: 'skill_eng_01',
        name: '护盾过载',
        description: '立即恢复目标舰船50%最大护盾值',
        cooldown: 4,
        currentCooldown: 0,
        apCost: 2,
        type: 'heal',
        range: 3,
        effect: {
          shieldRestore: 50
        }
      }
    ],
    avatar: 'engineer_bosman',
    backstory: '曾在废弃空间站独自生存3年的传奇工程师，能修理任何东西。'
  },
  {
    id: 'crew_pilot_01',
    name: '疾风·追风者',
    role: 'pilot',
    rarity: 5,
    level: 1,
    exp: 0,
    maxExp: 100,
    stats: {
      leadership: 55,
      gunnery: 60,
      engineering: 55,
      piloting: 97,
      medical: 35
    },
    talents: [
      {
        id: 'talent_pil_01',
        name: '闪避大师',
        description: '受到攻击时有20%概率闪避',
        unlocked: true,
        tier: 1,
        requires: [],
        effect: { dodge: 20 },
        cost: 0
      }
    ],
    skills: [
      {
        id: 'skill_pil_01',
        name: '星际漂移',
        description: '立即移动到目标位置，不消耗移动范围',
        cooldown: 3,
        currentCooldown: 0,
        apCost: 2,
        type: 'move',
        range: 6,
        effect: {
          teleport: true
        }
      }
    ],
    avatar: 'pilot_jifeng',
    backstory: '前星际竞速赛冠军，能在小行星带中穿梭自如。'
  },
  {
    id: 'crew_pilot_02',
    name: '米拉·星轨',
    role: 'pilot',
    rarity: 4,
    level: 1,
    exp: 0,
    maxExp: 100,
    stats: {
      leadership: 50,
      gunnery: 55,
      engineering: 60,
      piloting: 90,
      medical: 40
    },
    talents: [
      {
        id: 'talent_pil_02',
        name: '高速机动',
        description: '移动范围+1',
        unlocked: true,
        tier: 1,
        requires: [],
        effect: { moveRange: 1 },
        cost: 0
      }
    ],
    skills: [
      {
        id: 'skill_pil_02',
        name: '相位转移',
        description: '本回合免疫所有伤害',
        cooldown: 5,
        currentCooldown: 0,
        apCost: 3,
        type: 'buff',
        range: 2,
        effect: {
          statusEffect: {
            id: 'buff_invincible',
            name: '无敌状态',
            icon: 'invincible',
            duration: 1,
            statsMod: { defense: 100 }
          }
        }
      }
    ],
    avatar: 'pilot_mira',
    backstory: '星轨家族的传人，天生拥有对飞船的直觉操控能力。'
  },
  {
    id: 'crew_medic_01',
    name: '索菲亚·圣光',
    role: 'medic',
    rarity: 5,
    level: 1,
    exp: 0,
    maxExp: 100,
    stats: {
      leadership: 60,
      gunnery: 35,
      engineering: 50,
      piloting: 45,
      medical: 95
    },
    talents: [
      {
        id: 'talent_med_01',
        name: '生命祝福',
        description: '治疗效果提升25%',
        unlocked: true,
        tier: 1,
        requires: [],
        effect: { healBoost: 25 },
        cost: 0
      },
      {
        id: 'talent_med_02',
        name: '净化之光',
        description: '每回合有30%概率清除负面状态',
        unlocked: false,
        tier: 2,
        requires: ['talent_med_01'],
        effect: { cleanseChance: 30 },
        cost: 2
      }
    ],
    skills: [
      {
        id: 'skill_med_01',
        name: '纳米修复',
        description: '恢复目标舰船40%最大生命值并清除负面状态',
        cooldown: 4,
        currentCooldown: 0,
        apCost: 3,
        type: 'heal',
        range: 4,
        effect: {
          heal: 40,
          statusEffect: {
            id: 'heal_nano',
            name: '纳米修复',
            icon: 'nano_repair',
            duration: 2,
            statsMod: {},
            healPerTurn: 10
          }
        }
      }
    ],
    avatar: 'medic_sofia',
    backstory: '银河医学院荣誉毕业生，曾在战地医院拯救数千名士兵。'
  },
  {
    id: 'crew_medic_02',
    name: '凯恩·生命之树',
    role: 'medic',
    rarity: 3,
    level: 1,
    exp: 0,
    maxExp: 100,
    stats: {
      leadership: 50,
      gunnery: 40,
      engineering: 55,
      piloting: 40,
      medical: 82
    },
    talents: [
      {
        id: 'talent_med_03',
        name: '群体治疗',
        description: '治疗技能范围+2',
        unlocked: true,
        tier: 1,
        requires: [],
        effect: { healRange: 2 },
        cost: 0
      }
    ],
    skills: [
      {
        id: 'skill_med_02',
        name: '生命链接',
        description: '2回合内所有友军每回合恢复15%生命值',
        cooldown: 5,
        currentCooldown: 0,
        apCost: 3,
        type: 'heal',
        range: 5,
        effect: {
          statusEffect: {
            id: 'heal_link',
            name: '生命链接',
            icon: 'life_link',
            duration: 2,
            statsMod: {},
            healPerTurn: 15
          },
          aoe: 5
        }
      }
    ],
    avatar: 'medic_kane',
    backstory: '来自自然星球的治愈者，能用古老的生命能量修复舰船。'
  }
];
