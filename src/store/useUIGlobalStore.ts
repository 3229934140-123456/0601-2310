import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface UIGlobalState {
  showStoryModal: boolean;
  currentStoryId: string | null;
  showSettingsModal: boolean;
  showRecruitModal: boolean;
  showCraftModal: boolean;
  showShipDetailModal: boolean;
  selectedShipIdForDetail: string | null;
  showCrewDetailModal: boolean;
  selectedCrewIdForDetail: string | null;
  showIntelModal: boolean;
  selectedStageIdForIntel: string | null;
  toastMessages: ToastMessage[];
  soundEnabled: boolean;
  musicEnabled: boolean;
  showFloatingDamage: boolean;
}

interface UIGlobalActions {
  openStoryModal: (storyId?: string) => void;
  closeStoryModal: () => void;
  toggleStoryModal: () => void;

  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  toggleSettingsModal: () => void;

  openRecruitModal: () => void;
  closeRecruitModal: () => void;
  toggleRecruitModal: () => void;

  openCraftModal: () => void;
  closeCraftModal: () => void;
  toggleCraftModal: () => void;

  openShipDetailModal: (shipId: string) => void;
  closeShipDetailModal: () => void;
  toggleShipDetailModal: () => void;

  openCrewDetailModal: (crewId: string) => void;
  closeCrewDetailModal: () => void;
  toggleCrewDetailModal: () => void;

  openIntelModal: (stageId: string) => void;
  closeIntelModal: () => void;
  toggleIntelModal: () => void;

  setCurrentStoryId: (storyId: string | null) => void;
  setSelectedShipIdForDetail: (shipId: string | null) => void;
  setSelectedCrewIdForDetail: (crewId: string | null) => void;
  setSelectedStageIdForIntel: (stageId: string | null) => void;

  addToast: (...args: any[]) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setShowFloatingDamage: (show: boolean) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  toggleShowFloatingDamage: () => void;
}

type UIGlobalStore = UIGlobalState & UIGlobalActions;

export const useUIGlobalStore = create<UIGlobalStore>((set) => ({
  showStoryModal: false,
  currentStoryId: null,
  showSettingsModal: false,
  showRecruitModal: false,
  showCraftModal: false,
  showShipDetailModal: false,
  selectedShipIdForDetail: null,
  showCrewDetailModal: false,
  selectedCrewIdForDetail: null,
  showIntelModal: false,
  selectedStageIdForIntel: null,
  toastMessages: [],
  soundEnabled: true,
  musicEnabled: true,
  showFloatingDamage: true,

  openStoryModal: (storyId) =>
    set({
      showStoryModal: true,
      currentStoryId: storyId !== undefined ? storyId : null,
    }),
  closeStoryModal: () => set({ showStoryModal: false }),
  toggleStoryModal: () => set((state) => ({ showStoryModal: !state.showStoryModal })),

  openSettingsModal: () => set({ showSettingsModal: true }),
  closeSettingsModal: () => set({ showSettingsModal: false }),
  toggleSettingsModal: () => set((state) => ({ showSettingsModal: !state.showSettingsModal })),

  openRecruitModal: () => set({ showRecruitModal: true }),
  closeRecruitModal: () => set({ showRecruitModal: false }),
  toggleRecruitModal: () => set((state) => ({ showRecruitModal: !state.showRecruitModal })),

  openCraftModal: () => set({ showCraftModal: true }),
  closeCraftModal: () => set({ showCraftModal: false }),
  toggleCraftModal: () => set((state) => ({ showCraftModal: !state.showCraftModal })),

  openShipDetailModal: (shipId) =>
    set({
      showShipDetailModal: true,
      selectedShipIdForDetail: shipId,
    }),
  closeShipDetailModal: () =>
    set({
      showShipDetailModal: false,
      selectedShipIdForDetail: null,
    }),
  toggleShipDetailModal: () =>
    set((state) => ({ showShipDetailModal: !state.showShipDetailModal })),

  openCrewDetailModal: (crewId) =>
    set({
      showCrewDetailModal: true,
      selectedCrewIdForDetail: crewId,
    }),
  closeCrewDetailModal: () =>
    set({
      showCrewDetailModal: false,
      selectedCrewIdForDetail: null,
    }),
  toggleCrewDetailModal: () =>
    set((state) => ({ showCrewDetailModal: !state.showCrewDetailModal })),

  openIntelModal: (stageId) =>
    set({
      showIntelModal: true,
      selectedStageIdForIntel: stageId,
    }),
  closeIntelModal: () =>
    set({
      showIntelModal: false,
      selectedStageIdForIntel: null,
    }),
  toggleIntelModal: () => set((state) => ({ showIntelModal: !state.showIntelModal })),

  setCurrentStoryId: (storyId) => set({ currentStoryId: storyId }),
  setSelectedShipIdForDetail: (shipId) => set({ selectedShipIdForDetail: shipId }),
  setSelectedCrewIdForDetail: (crewId) => set({ selectedCrewIdForDetail: crewId }),
  setSelectedStageIdForIntel: (stageId) => set({ selectedStageIdForIntel: stageId }),

  addToast: (...args: any[]) => {
    let id: string;
    let type: ToastMessage['type'];
    let message: string;
    let duration = 3000;
    if (typeof args[0] === 'object') {
      const obj = args[0];
      id = `toast-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      type = obj.type || 'info';
      message = obj.message || '';
      duration = obj.duration ?? 3000;
    } else if (args.length >= 3) {
      id = args[0]; type = args[1]; message = args[2];
    } else {
      id = `toast-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      type = args[0] || 'info'; message = args[1] || '';
    }
    set((state) => ({
      toastMessages: [...state.toastMessages, { id, type, message }],
    }));
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toastMessages: state.toastMessages.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toastMessages: state.toastMessages.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toastMessages: [] }),

  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
  setShowFloatingDamage: (show) => set({ showFloatingDamage: show }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
  toggleShowFloatingDamage: () =>
    set((state) => ({ showFloatingDamage: !state.showFloatingDamage })),
}));
