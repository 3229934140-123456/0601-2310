import type { Recipe } from '../types';

export const RECIPES: Recipe[] = [
  {
    id: 'recipe_weapon_01',
    outputId: 'weapon_01',
    materials: [
      { id: 'material_01', quantity: 15 },
      { id: 'material_02', quantity: 10 }
    ],
    starCoinCost: 500,
    successRate: 100
  },
  {
    id: 'recipe_weapon_02',
    outputId: 'weapon_02',
    materials: [
      { id: 'material_05', quantity: 8 },
      { id: 'material_07', quantity: 2 },
      { id: 'material_04', quantity: 20 }
    ],
    starCoinCost: 5000,
    successRate: 75
  },
  {
    id: 'recipe_weapon_03',
    outputId: 'weapon_03',
    materials: [
      { id: 'material_02', quantity: 20 },
      { id: 'material_04', quantity: 10 }
    ],
    starCoinCost: 1200,
    successRate: 95
  },
  {
    id: 'recipe_shield_02',
    outputId: 'shield_02',
    materials: [
      { id: 'material_03', quantity: 25 },
      { id: 'material_04', quantity: 15 },
      { id: 'material_06', quantity: 5 }
    ],
    starCoinCost: 3000,
    successRate: 85
  },
  {
    id: 'recipe_shield_03',
    outputId: 'shield_03',
    materials: [
      { id: 'material_05', quantity: 12 },
      { id: 'material_06', quantity: 10 },
      { id: 'material_08', quantity: 3 }
    ],
    starCoinCost: 8000,
    successRate: 60
  },
  {
    id: 'recipe_module_02',
    outputId: 'module_02',
    materials: [
      { id: 'material_01', quantity: 30 },
      { id: 'material_06', quantity: 8 },
      { id: 'material_03', quantity: 20 }
    ],
    starCoinCost: 2500,
    successRate: 90
  },
  {
    id: 'recipe_module_03',
    outputId: 'module_03',
    materials: [
      { id: 'material_07', quantity: 5 },
      { id: 'material_05', quantity: 10 },
      { id: 'material_08', quantity: 2 },
      { id: 'material_04', quantity: 30 }
    ],
    starCoinCost: 10000,
    successRate: 50
  }
];
