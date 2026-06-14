export type Rarity = 1 | 2 | 3 | 4 | 5;
export type ShipType = 'battleship' | 'cruiser' | 'destroyer' | 'carrier' | 'support';
export type CrewRole = 'captain' | 'gunner' | 'engineer' | 'pilot' | 'medic';
export type EquipmentType = 'weapon' | 'shield' | 'module';
export type MissionType = 'main' | 'side' | 'daily';
export type BattlePhase = 'player' | 'enemy' | 'environment';
export type EnvironmentTileType = 'asteroid' | 'nebula' | 'radiation' | 'wormhole' | 'empty';

export interface Position {
  x: number;
  y: number;
}

export interface StatusEffect {
  id: string;
  name: string;
  icon: string;
  duration: number;
  statsMod: Partial<Record<'attack' | 'defense' | 'speed' | 'moveRange' | 'attackRange', number>>;
  damagePerTurn?: number;
  healPerTurn?: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  currentCooldown: number;
  apCost: number;
  type: 'attack' | 'heal' | 'buff' | 'debuff' | 'utility' | 'move';
  range: number;
  effect: {
    damage?: number;
    heal?: number;
    shieldRestore?: number;
    statusEffect?: StatusEffect;
    aoe?: number;
    teleport?: boolean;
  };
}

export interface Talent {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  tier: number;
  requires: string[];
  effect: Record<string, number>;
  cost: number;
}

export interface Stats {
  leadership: number;
  gunnery: number;
  engineering: number;
  piloting: number;
  medical: number;
}

export interface Ship {
  id: string;
  name: string;
  type: ShipType;
  rarity: Rarity;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  attack: number;
  defense: number;
  speed: number;
  moveRange: number;
  attackRange: number;
  actionPoints: number;
  maxActionPoints: number;
  weaponId?: string;
  shieldModuleId?: string;
  moduleIds?: string[];
  crewIds: string[];
  position?: Position;
  statusEffects: StatusEffect[];
  faction?: 'player' | 'enemy';
  sprite?: string;
  baseStats?: {
    maxHp: number;
    maxShield: number;
    attack: number;
    defense: number;
    speed: number;
    moveRange: number;
    attackRange: number;
    maxActionPoints: number;
  };
}

export interface Crew {
  id: string;
  name: string;
  role: CrewRole;
  rarity: Rarity;
  level: number;
  exp: number;
  maxExp: number;
  talents: Talent[];
  skills: Skill[];
  stats: Stats;
  shipId?: string;
  avatar?: string;
  backstory?: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  rarity: Rarity;
  level: number;
  stats: Record<string, number>;
  description: string;
  equipped?: boolean;
  shipId?: string;
}

export interface Material {
  id: string;
  name: string;
  rarity: Rarity;
  quantity: number;
  icon: string;
  description: string;
}

export interface Recipe {
  id: string;
  outputId: string;
  materials: { id: string; quantity: number }[];
  starCoinCost: number;
  successRate: number;
}

export interface EnvironmentTile {
  position: Position;
  type: EnvironmentTileType;
  effect?: string;
  damage?: number;
  defenseMod?: number;
}

export interface LogEntry {
  id: string;
  turn: number;
  timestamp: number;
  type: 'attack' | 'defend' | 'move' | 'skill' | 'environment' | 'heal' | 'system' | 'status';
  sourceId?: string;
  sourceName?: string;
  targetId?: string;
  targetName?: string;
  value?: number;
  message: string;
  critical?: boolean;
}

export interface BattleState {
  id: string;
  stageId: string;
  turn: number;
  phase: BattlePhase;
  playerFleet: Ship[];
  enemyFleet: Ship[];
  gridSize: { width: number; height: number };
  environmentTiles: EnvironmentTile[];
  battleLog: LogEntry[];
  selectedShipId: string | null;
  targetedShipId: string | null;
  validMoves: Position[];
  validTargets: string[];
  actionMode: 'none' | 'move' | 'attack' | 'skill';
  activeSkillId?: string;
  victory?: boolean;
  finished: boolean;
  floatingDamage: { id: string; shipId: string; value: number; x: number; y: number; type: 'damage' | 'heal' | 'miss' | 'shield' | 'move' }[];
  totalDamageDealt: number;
  totalDamageTaken: number;
}

export interface Stage {
  id: string;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  enemyFleetTemplate: Omit<Ship, 'position'>[];
  environment: EnvironmentTile[];
  gridSize: { width: number; height: number };
  rewards: {
    starCoins: number;
    exp: number;
    materials?: { id: string; quantity: number; dropRate: number }[];
    equipment?: { id: string; dropRate: number }[];
  };
  unlocked: boolean;
  completed: boolean;
  starRating: 0 | 1 | 2 | 3;
  x: number;
  y: number;
  connections: string[];
  intel: {
    name: string;
    strength: string;
    weaknesses: string[];
    warning: string;
  };
  requiredStages: string[];
}

export interface Mission {
  id: string;
  title: string;
  type: MissionType;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  rewards: {
    starCoins?: number;
    materials?: { id: string; quantity: number }[];
    exp?: number;
    equipmentId?: string;
    crewId?: string;
  };
  storyUnlock?: string;
  trackType: 'stage_cleared' | 'ship_destroyed' | 'crew_recruited' | 'star_coins_earned' | 'battle_won';
  requiredStageId?: string;
}

export interface StoryNode {
  id: string;
  title: string;
  unlocked: boolean;
  viewed: boolean;
  content: string[];
  speaker?: string;
  nextNodeId?: string;
  background?: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  level: number;
  exp: number;
  maxExp: number;
  starCoins: number;
  totalStagesCleared: number;
  totalBattlesWon: number;
  totalShipsDestroyed: number;
  unlockedStoryIds: string[];
  lastSaveTime: number;
  createdAt: number;
}

export interface BattleLogArchive {
  id: string;
  stageId: string;
  stageName: string;
  timestamp: number;
  victory: boolean;
  turns: number;
  starRating: 0 | 1 | 2 | 3;
  damageDealt: number;
  damageTaken: number;
  details: LogEntry[];
  rewards: { starCoins: number; exp: number; materials: { id: string; quantity: number }[] };
}

export interface GameState {
  profile: PlayerProfile;
  ships: Ship[];
  activeFleetIds: string[];
  crews: Crew[];
  equipments: Equipment[];
  materials: Material[];
  recipes: Recipe[];
  stages: Stage[];
  missions: Mission[];
  stories: StoryNode[];
  battleArchive: BattleLogArchive[];
  currentBattle?: BattleState;
  lastBattleResult?: {
    battleId: string;
    victory: boolean;
    rewards: {
      starCoins: number;
      exp: number;
      materials: { id: string; name: string; quantity: number }[];
      equipments: Equipment[];
    };
    starRating: 0 | 1 | 2 | 3;
    stageId: string;
    stageName: string;
    turns: number;
    totalDamageDealt: number;
    totalDamageTaken: number;
    enemiesDestroyed: number;
    totalEnemies: number;
    shipsSurvived: number;
    totalShips: number;
  };
}
