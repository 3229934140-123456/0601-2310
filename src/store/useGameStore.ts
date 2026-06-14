import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SHIPS } from '../data/ships';
import { CREWS } from '../data/crews';
import { EQUIPMENTS } from '../data/equipment';
import { MATERIALS } from '../data/materials';
import { RECIPES } from '../data/recipes';
import { STAGES } from '../data/stages';
import { MISSIONS } from '../data/missions';
import { STORIES } from '../data/stories';
import type {
  GameState,
  PlayerProfile,
  Ship,
  Crew,
  Equipment,
  Material,
  Mission,
  Stage,
  StoryNode,
  BattleLogArchive,
  BattleState,
  EquipmentType,
} from '../types';

interface GameActions {
  addStarCoins: (amount: number) => void;
  spendStarCoins: (amount: number) => boolean;
  gainExp: (amount: number) => void;
  setActiveFleet: (ids: string[]) => void;
  equipEquipment: (shipId: string, equipmentId: string) => void;
  unequipEquipment: (shipId: string, type: EquipmentType) => void;
  upgradeShipStats: (shipId: string, statKey: string, amount: number, cost: number) => boolean;
  recruitCrew: (crewId: string, cost: number) => boolean;
  assignCrewToShip: (crewId: string, shipId: string) => void;
  unassignCrew: (crewId: string) => void;
  upgradeTalent: (crewId: string, talentId: string) => boolean;
  craftEquipment: (recipeId: string) => boolean;
  claimMission: (missionId: string) => boolean;
  updateMissionProgress: (trackType: Mission['trackType'], amount?: number) => void;
  unlockStage: (stageId: string) => void;
  completeStage: (stageId: string, starRating: 0 | 1 | 2 | 3) => void;
  unlockStory: (storyId: string) => void;
  addBattleArchive: (log: BattleLogArchive) => void;
  setCurrentBattle: (battle: BattleState | undefined) => void;
  setLastBattleResult: (result: GameState['lastBattleResult']) => void;
  saveGame: () => void;
  resetGame: () => void;
  getMaterialsById: (ids: string[]) => Record<string, { id: string; name: string }>;
}

type GameStore = GameState & GameActions;

const calcExpForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

const getInitialState = (): GameState => {
  const now = Date.now();

  const initialPlayerShips: Ship[] = SHIPS.filter((s) => s.faction !== 'enemy').slice(0, 8).map((ship) => ({
    ...ship,
    id: `player-${ship.id}`,
    position: undefined,
    faction: 'player' as const,
    statusEffects: [],
  }));

  const activeFleetIds = initialPlayerShips.slice(0, 3).map((s) => s.id);

  const initialCrews: Crew[] = CREWS.map((crew) => ({
    ...crew,
    id: `player-${crew.id}`,
    talents: crew.talents.map((t) => ({ ...t })),
    skills: crew.skills.map((s) => ({ ...s })),
  }));

  const initialEquipments: Equipment[] = EQUIPMENTS.map((eq) => ({
    ...eq,
    id: `player-${eq.id}`,
    equipped: false,
  }));

  const initialMaterials: Material[] = MATERIALS.map((mat) => ({
    ...mat,
    quantity: Math.floor(Math.random() * 18) + 3,
  }));

  const initialStages: Stage[] = STAGES.map((stage, idx) => ({
    ...stage,
    unlocked: idx === 0,
    completed: false,
    starRating: 0 as const,
  }));

  const initialStories: StoryNode[] = STORIES.map((story, idx) => ({
    ...story,
    unlocked: idx === 0,
    viewed: false,
  }));

  const profile: PlayerProfile = {
    id: 'player-profile',
    name: '指挥官',
    level: 1,
    exp: 0,
    maxExp: calcExpForLevel(1),
    starCoins: 5000,
    totalStagesCleared: 0,
    totalBattlesWon: 0,
    totalShipsDestroyed: 0,
    unlockedStoryIds: ['story_01'],
    lastSaveTime: now,
    createdAt: now,
  };

  return {
    profile,
    ships: initialPlayerShips,
    activeFleetIds,
    crews: initialCrews,
    equipments: initialEquipments,
    materials: initialMaterials,
    recipes: RECIPES,
    stages: initialStages,
    missions: MISSIONS.map((m) => ({ ...m })),
    stories: initialStories,
    battleArchive: [],
    currentBattle: undefined,
    lastBattleResult: undefined,
  };
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      addStarCoins: (amount) =>
        set((state) => {
          const newAmount = state.profile.starCoins + amount;
          get().updateMissionProgress('star_coins_earned', amount);
          return {
            profile: {
              ...state.profile,
              starCoins: newAmount,
              lastSaveTime: Date.now(),
            },
          };
        }),

      spendStarCoins: (amount) => {
        const state = get();
        if (state.profile.starCoins < amount) return false;
        set({
          profile: {
            ...state.profile,
            starCoins: state.profile.starCoins - amount,
            lastSaveTime: Date.now(),
          },
        });
        return true;
      },

      gainExp: (amount) =>
        set((state) => {
          let newExp = state.profile.exp + amount;
          let newLevel = state.profile.level;
          let newMaxExp = state.profile.maxExp;

          while (newExp >= newMaxExp) {
            newExp -= newMaxExp;
            newLevel += 1;
            newMaxExp = calcExpForLevel(newLevel);
          }

          return {
            profile: {
              ...state.profile,
              exp: newExp,
              level: newLevel,
              maxExp: newMaxExp,
              lastSaveTime: Date.now(),
            },
          };
        }),

      setActiveFleet: (ids) =>
        set((state) => ({
          activeFleetIds: ids,
          profile: { ...state.profile, lastSaveTime: Date.now() },
        })),

      equipEquipment: (shipId, equipmentId) =>
        set((state) => {
          const equipment = state.equipments.find((e) => e.id === equipmentId);
          if (!equipment || equipment.equipped) return state;

          const ship = state.ships.find((s) => s.id === shipId);
          if (!ship) return state;

          let newShips = state.ships.map((s) => ({ ...s }));
          let newEquipments = state.equipments.map((e) => ({ ...e }));
          const shipIdx = newShips.findIndex((s) => s.id === shipId);
          const eqIdx = newEquipments.findIndex((e) => e.id === equipmentId);

          if (equipment.type === 'weapon') {
            if (newShips[shipIdx].weaponId) {
              const oldEqIdx = newEquipments.findIndex((e) => e.id === newShips[shipIdx].weaponId);
              if (oldEqIdx !== -1) {
                newEquipments[oldEqIdx].equipped = false;
                newEquipments[oldEqIdx].shipId = undefined;
              }
            }
            newShips[shipIdx].weaponId = equipmentId;
          } else if (equipment.type === 'shield') {
            if (newShips[shipIdx].shieldModuleId) {
              const oldEqIdx = newEquipments.findIndex((e) => e.id === newShips[shipIdx].shieldModuleId);
              if (oldEqIdx !== -1) {
                newEquipments[oldEqIdx].equipped = false;
                newEquipments[oldEqIdx].shipId = undefined;
              }
            }
            newShips[shipIdx].shieldModuleId = equipmentId;
          } else if (equipment.type === 'module') {
            newShips[shipIdx].moduleIds = [...(newShips[shipIdx].moduleIds || []), equipmentId];
          }

          newEquipments[eqIdx].equipped = true;
          newEquipments[eqIdx].shipId = shipId;

          return {
            ships: newShips,
            equipments: newEquipments,
            profile: { ...state.profile, lastSaveTime: Date.now() },
          };
        }),

      unequipEquipment: (shipId, type) =>
        set((state) => {
          const ship = state.ships.find((s) => s.id === shipId);
          if (!ship) return state;

          let newShips = state.ships.map((s) => ({ ...s }));
          let newEquipments = state.equipments.map((e) => ({ ...e }));
          const shipIdx = newShips.findIndex((s) => s.id === shipId);

          if (type === 'weapon' && newShips[shipIdx].weaponId) {
            const eqIdx = newEquipments.findIndex((e) => e.id === newShips[shipIdx].weaponId);
            if (eqIdx !== -1) {
              newEquipments[eqIdx].equipped = false;
              newEquipments[eqIdx].shipId = undefined;
            }
            newShips[shipIdx].weaponId = undefined;
          } else if (type === 'shield' && newShips[shipIdx].shieldModuleId) {
            const eqIdx = newEquipments.findIndex((e) => e.id === newShips[shipIdx].shieldModuleId);
            if (eqIdx !== -1) {
              newEquipments[eqIdx].equipped = false;
              newEquipments[eqIdx].shipId = undefined;
            }
            newShips[shipIdx].shieldModuleId = undefined;
          } else if (type === 'module') {
            const moduleIds = newShips[shipIdx].moduleIds || [];
            moduleIds.forEach((mid) => {
              const eqIdx = newEquipments.findIndex((e) => e.id === mid);
              if (eqIdx !== -1) {
                newEquipments[eqIdx].equipped = false;
                newEquipments[eqIdx].shipId = undefined;
              }
            });
            newShips[shipIdx].moduleIds = [];
          }

          return {
            ships: newShips,
            equipments: newEquipments,
            profile: { ...state.profile, lastSaveTime: Date.now() },
          };
        }),

      upgradeShipStats: (shipId, statKey, amount, cost) => {
        const state = get();
        if (state.profile.starCoins < cost) return false;
        const ship = state.ships.find((s) => s.id === shipId);
        if (!ship) return false;

        set((state) => {
          const newShips = state.ships.map((s) => {
            if (s.id !== shipId) return s;
            const updated = { ...s };
            const key = statKey as keyof Ship;
            if (typeof (updated as any)[key] === 'number') {
              (updated as any)[key] = (updated as any)[key] + amount;
              if (statKey === 'maxHp') {
                updated.hp = updated.maxHp;
              }
              if (statKey === 'maxShield') {
                updated.shield = updated.maxShield;
              }
            }
            return updated;
          });

          return {
            ships: newShips,
            profile: {
              ...state.profile,
              starCoins: state.profile.starCoins - cost,
              lastSaveTime: Date.now(),
            },
          };
        });
        return true;
      },

      recruitCrew: (crewId, cost) => {
        const state = get();
        if (state.profile.starCoins < cost) return false;
        const exists = state.crews.some((c) => c.id === crewId || c.id === `player-${crewId}`);
        if (exists) return false;

        const template = CREWS.find((c) => c.id === crewId);
        if (!template) return false;

        const newCrew: Crew = {
          ...template,
          id: `player-${template.id}`,
          talents: template.talents.map((t) => ({ ...t })),
          skills: template.skills.map((s) => ({ ...s })),
        };

        set((state) => {
          get().updateMissionProgress('crew_recruited');
          return {
            crews: [...state.crews, newCrew],
            profile: {
              ...state.profile,
              starCoins: state.profile.starCoins - cost,
              lastSaveTime: Date.now(),
            },
          };
        });
        return true;
      },

      assignCrewToShip: (crewId, shipId) =>
        set((state) => {
          const newCrews = state.crews.map((c) => {
            if (c.shipId) {
              return c;
            }
            if (c.id === crewId) {
              return { ...c, shipId };
            }
            return c;
          });

          const newShips = state.ships.map((s) => {
            if (s.id === shipId) {
              const crewToAdd = state.crews.find((c) => c.id === crewId);
              if (crewToAdd && !crewToAdd.shipId && !s.crewIds.includes(crewId)) {
                return { ...s, crewIds: [...s.crewIds, crewId] };
              }
            }
            return s;
          });

          return {
            crews: newCrews,
            ships: newShips,
            profile: { ...state.profile, lastSaveTime: Date.now() },
          };
        }),

      unassignCrew: (crewId) =>
        set((state) => {
          const crew = state.crews.find((c) => c.id === crewId);
          if (!crew || !crew.shipId) return state;

          const newCrews = state.crews.map((c) =>
            c.id === crewId ? { ...c, shipId: undefined } : c
          );

          const newShips = state.ships.map((s) =>
            s.id === crew.shipId
              ? { ...s, crewIds: s.crewIds.filter((id) => id !== crewId) }
              : s
          );

          return {
            crews: newCrews,
            ships: newShips,
            profile: { ...state.profile, lastSaveTime: Date.now() },
          };
        }),

      upgradeTalent: (crewId, talentId) => {
        const state = get();
        const crew = state.crews.find((c) => c.id === crewId);
        if (!crew) return false;

        const talent = crew.talents.find((t) => t.id === talentId);
        if (!talent || talent.unlocked) return false;

        const prereqsMet = talent.requires.every((req) =>
          crew.talents.some((t) => t.id === req && t.unlocked)
        );
        if (!prereqsMet) return false;

        if (state.profile.starCoins < talent.cost * 1000) return false;

        set((state) => ({
          crews: state.crews.map((c) => {
            if (c.id !== crewId) return c;
            return {
              ...c,
              talents: c.talents.map((t) =>
                t.id === talentId ? { ...t, unlocked: true } : t
              ),
            };
          }),
          profile: {
            ...state.profile,
            starCoins: state.profile.starCoins - talent.cost * 1000,
            lastSaveTime: Date.now(),
          },
        }));
        return true;
      },

      craftEquipment: (recipeId) => {
        const state = get();
        const recipe = state.recipes.find((r) => r.id === recipeId);
        if (!recipe) return false;

        if (state.profile.starCoins < recipe.starCoinCost) return false;

        for (const req of recipe.materials) {
          const mat = state.materials.find((m) => m.id === req.id);
          if (!mat || mat.quantity < req.quantity) return false;
        }

        const roll = Math.random() * 100;
        const success = roll < recipe.successRate;

        set((state) => {
          const newMaterials = state.materials.map((m) => {
            const req = recipe.materials.find((r) => r.id === m.id);
            if (req) {
              return { ...m, quantity: m.quantity - req.quantity };
            }
            return m;
          });

          let newEquipments = state.equipments;
          if (success) {
            const template = EQUIPMENTS.find((e) => e.id === recipe.outputId);
            if (template) {
              const newEq: Equipment = {
                ...template,
                id: `player-${template.id}-${Date.now()}`,
                equipped: false,
              };
              newEquipments = [...state.equipments, newEq];
            }
          }

          return {
            materials: newMaterials,
            equipments: newEquipments,
            profile: {
              ...state.profile,
              starCoins: state.profile.starCoins - recipe.starCoinCost,
              lastSaveTime: Date.now(),
            },
          };
        });

        return success;
      },

      claimMission: (missionId) => {
        const state = get();
        const mission = state.missions.find((m) => m.id === missionId);
        if (!mission || !mission.completed || mission.claimed) return false;

        set((state) => {
          const newMissions = state.missions.map((m) =>
            m.id === missionId ? { ...m, claimed: true } : m
          );

          let newStarCoins = state.profile.starCoins;
          let newExp = state.profile.exp;
          let newMaterials = [...state.materials];
          let newEquipments = [...state.equipments];

          if (mission.rewards.starCoins) {
            newStarCoins += mission.rewards.starCoins;
          }
          if (mission.rewards.exp) {
            newExp += mission.rewards.exp;
          }
          if (mission.rewards.materials) {
            for (const rm of mission.rewards.materials) {
              const idx = newMaterials.findIndex((m) => m.id === rm.id);
              if (idx !== -1) {
                newMaterials[idx] = {
                  ...newMaterials[idx],
                  quantity: newMaterials[idx].quantity + rm.quantity,
                };
              }
            }
          }
          if (mission.rewards.equipmentId) {
            const template = EQUIPMENTS.find((e) => e.id === mission.rewards.equipmentId);
            if (template) {
              newEquipments = [
                ...newEquipments,
                {
                  ...template,
                  id: `player-${template.id}-${Date.now()}`,
                  equipped: false,
                },
              ];
            }
          }

          let newStories = state.stories;
          let newUnlockedStoryIds = [...state.profile.unlockedStoryIds];
          if (mission.storyUnlock) {
            newStories = state.stories.map((s) =>
              s.id === mission.storyUnlock ? { ...s, unlocked: true } : s
            );
            if (!newUnlockedStoryIds.includes(mission.storyUnlock)) {
              newUnlockedStoryIds.push(mission.storyUnlock);
            }
          }

          return {
            missions: newMissions,
            materials: newMaterials,
            equipments: newEquipments,
            stories: newStories,
            profile: {
              ...state.profile,
              starCoins: newStarCoins,
              exp: newExp,
              unlockedStoryIds: newUnlockedStoryIds,
              lastSaveTime: Date.now(),
            },
          };
        });

        get().gainExp(0);
        return true;
      },

      updateMissionProgress: (trackType, amount = 1) =>
        set((state) => {
          const newMissions = state.missions.map((m) => {
            if (m.trackType !== trackType || m.completed) return m;
            const newProgress = Math.min(m.progress + amount, m.target);
            return {
              ...m,
              progress: newProgress,
              completed: newProgress >= m.target,
            };
          });
          return { missions: newMissions };
        }),

      unlockStage: (stageId) =>
        set((state) => ({
          stages: state.stages.map((s) =>
            s.id === stageId ? { ...s, unlocked: true } : s
          ),
          profile: { ...state.profile, lastSaveTime: Date.now() },
        })),

      completeStage: (stageId, starRating) =>
        set((state) => {
          const stage = state.stages.find((s) => s.id === stageId);
          if (!stage) return state;

          const newStages = state.stages.map((s) => {
            if (s.id === stageId) {
              return {
                ...s,
                completed: true,
                starRating: Math.max(s.starRating, starRating) as 0 | 1 | 2 | 3,
              };
            }
            if (stage.connections.includes(s.id)) {
              return { ...s, unlocked: true };
            }
            return s;
          });

          const totalStagesCleared = state.profile.totalStagesCleared + (stage.completed ? 0 : 1);
          const totalBattlesWon = state.profile.totalBattlesWon + 1;

          get().updateMissionProgress('stage_cleared');
          get().updateMissionProgress('battle_won');

          return {
            stages: newStages,
            profile: {
              ...state.profile,
              totalStagesCleared,
              totalBattlesWon,
              lastSaveTime: Date.now(),
            },
          };
        }),

      unlockStory: (storyId) =>
        set((state) => {
          const stories = state.stories.map((s) =>
            s.id === storyId ? { ...s, unlocked: true, viewed: true } : s
          );
          const unlockedStoryIds = state.profile.unlockedStoryIds.includes(storyId)
            ? state.profile.unlockedStoryIds
            : [...state.profile.unlockedStoryIds, storyId];
          return {
            stories,
            profile: { ...state.profile, unlockedStoryIds, lastSaveTime: Date.now() },
          };
        }),

      addBattleArchive: (log) =>
        set((state) => ({
          battleArchive: [log, ...state.battleArchive].slice(0, 100),
          profile: { ...state.profile, lastSaveTime: Date.now() },
        })),

      setCurrentBattle: (battle) =>
        set(() => ({
          currentBattle: battle,
        })),

      setLastBattleResult: (result) =>
        set((state) => ({
          lastBattleResult: result,
          profile: { ...state.profile, lastSaveTime: Date.now() },
        })),

      saveGame: () =>
        set((state) => ({
          profile: { ...state.profile, lastSaveTime: Date.now() },
        })),

      resetGame: () => set(getInitialState()),

      getMaterialsById: (ids) => {
        const state = get();
        const result: Record<string, { id: string; name: string }> = {};
        ids.forEach((id) => {
          const m = state.materials.find((x) => x.id === id);
          if (m) result[id] = { id: m.id, name: m.name };
        });
        ids.forEach((id) => {
          if (!result[id]) {
            const m = MATERIALS.find((x) => x.id === id);
            if (m) result[id] = { id: m.id, name: m.name };
          }
        });
        return result;
      },
    }),
    {
      name: 'staryuan-tactics-save',
      version: 1,
    }
  )
);
