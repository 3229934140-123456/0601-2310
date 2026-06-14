import type { Mission } from '../types';

export const MISSIONS: Mission[] = [
  {
    id: 'mission_main_01',
    title: '初战告捷',
    type: 'main',
    description: '击退边境星域的敌方侦察舰队，保卫联邦边境安全。',
    progress: 0,
    target: 1,
    completed: false,
    claimed: false,
    rewards: {
      starCoins: 500,
      materials: [
        { id: 'material_01', quantity: 20 },
        { id: 'material_02', quantity: 15 }
      ],
      exp: 200
    },
    storyUnlock: 'story_02',
    trackType: 'stage_cleared'
  },
  {
    id: 'mission_main_02',
    title: '星云破袭',
    type: 'main',
    description: '摧毁敌方在星云区域建立的前哨站，切断敌方补给线。',
    progress: 0,
    target: 1,
    completed: false,
    claimed: false,
    rewards: {
      starCoins: 1500,
      materials: [
        { id: 'material_03', quantity: 15 },
        { id: 'material_04', quantity: 10 }
      ],
      exp: 500,
      equipmentId: 'weapon_03'
    },
    storyUnlock: 'story_04',
    trackType: 'stage_cleared'
  },
  {
    id: 'mission_main_03',
    title: '最终决战',
    type: 'main',
    description: '击败敌方旗舰"虚空吞噬者"，终结这场战争。',
    progress: 0,
    target: 1,
    completed: false,
    claimed: false,
    rewards: {
      starCoins: 10000,
      materials: [
        { id: 'material_07', quantity: 10 },
        { id: 'material_08', quantity: 5 }
      ],
      exp: 3000,
      equipmentId: 'module_03'
    },
    storyUnlock: 'story_06',
    trackType: 'stage_cleared'
  },
  {
    id: 'mission_side_01',
    title: '舰船猎手',
    type: 'side',
    description: '在战斗中累计击毁20艘敌方舰船。',
    progress: 0,
    target: 20,
    completed: false,
    claimed: false,
    rewards: {
      starCoins: 800,
      materials: [
        { id: 'material_03', quantity: 12 }
      ],
      exp: 300
    },
    trackType: 'ship_destroyed'
  },
  {
    id: 'mission_side_02',
    title: '常胜将军',
    type: 'side',
    description: '累计赢得10场战斗的胜利。',
    progress: 0,
    target: 10,
    completed: false,
    claimed: false,
    rewards: {
      starCoins: 1200,
      materials: [
        { id: 'material_05', quantity: 8 },
        { id: 'material_06', quantity: 5 }
      ],
      exp: 600
    },
    trackType: 'battle_won'
  },
  {
    id: 'mission_side_03',
    title: '财富累积',
    type: 'side',
    description: '累计获得10000星币奖励。',
    progress: 0,
    target: 10000,
    completed: false,
    claimed: false,
    rewards: {
      starCoins: 2000,
      materials: [
        { id: 'material_04', quantity: 20 },
        { id: 'material_05', quantity: 10 }
      ],
      exp: 800,
      equipmentId: 'shield_02'
    },
    trackType: 'star_coins_earned'
  }
];
