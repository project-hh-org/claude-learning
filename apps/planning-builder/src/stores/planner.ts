import { getStorage } from '@/lib/storage';
import {
  type ActiveMode,
  type BottomSheetState,
  COMPLETION_CATEGORIES,
  type CompletionCategory,
  type LiveDocuments,
  type Platform,
  type PlatformView,
  type ProjectMeta,
  type ProjectTemplate,
  type StepSelection,
  type Suggestion,
  type WireScreen,
  type WireframeEditRequest,
} from '@/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PlannerState {
  // 프로젝트 메타
  project: ProjectMeta | null;

  // 기획 플로우
  currentStep: number;
  currentPhaseLabel: string;
  selectionLog: StepSelection[];
  currentSuggestions: Suggestion[];
  prevAiSuggestions: Suggestion[];
  completionCategories: CompletionCategory[];
  completionScore: number;

  // 와이어프레임
  screens: WireScreen[];
  activeScreenId: string | null;
  activePlatformView: PlatformView;
  selectedComponentId: string | null;
  wireframeHistory: WireScreen[][];
  pendingEditRequest: WireframeEditRequest | null;

  // 산출물
  documents: LiveDocuments | null;

  // UI 상태
  activeMode: ActiveMode;
  isAiLoading: boolean;
  bottomSheetState: BottomSheetState;

  // 액션
  initProject: (goal: string, template: ProjectTemplate, platforms: Platform[]) => void;
  setCurrentSuggestions: (suggestions: Suggestion[], phaseLabel: string) => void;
  appendSelectionLog: (entry: StepSelection) => void;
  bumpStep: () => void;
  updateCompletionDelta: (delta: number, categories: string[]) => void;

  setScreens: (screens: WireScreen[]) => void;
  updateScreen: (screen: WireScreen) => void;
  setActiveScreen: (id: string) => void;
  setActivePlatformView: (view: PlatformView) => void;
  setSelectedComponent: (id: string | null) => void;
  setPendingEditRequest: (req: WireframeEditRequest | null) => void;
  undoWireframe: () => void;

  setDocuments: (docs: LiveDocuments) => void;
  setActiveMode: (mode: ActiveMode) => void;
  setIsAiLoading: (loading: boolean) => void;
  setBottomSheetState: (state: BottomSheetState) => void;

  resetSession: () => void;
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      project: null,
      currentStep: 0,
      currentPhaseLabel: '',
      selectionLog: [],
      currentSuggestions: [],
      prevAiSuggestions: [],
      completionCategories: COMPLETION_CATEGORIES,
      completionScore: 0,
      screens: [],
      activeScreenId: null,
      activePlatformView: 'app',
      selectedComponentId: null,
      wireframeHistory: [],
      pendingEditRequest: null,
      documents: null,
      activeMode: 'flow',
      isAiLoading: false,
      bottomSheetState: 'closed',

      initProject: (goal, template, platforms) => {
        const id = `session-${Date.now()}`;
        set({
          project: {
            id,
            name: '',
            goal,
            template,
            platforms,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
          },
          currentStep: 1,
          currentPhaseLabel: '',
          selectionLog: [],
          currentSuggestions: [],
          prevAiSuggestions: [],
          completionScore: 0,
          completionCategories: COMPLETION_CATEGORIES,
          screens: [],
          activeScreenId: null,
          wireframeHistory: [],
          documents: null,
          activeMode: 'flow',
        });
      },

      setCurrentSuggestions: (suggestions, phaseLabel) => {
        set({ currentSuggestions: suggestions, currentPhaseLabel: phaseLabel });
      },

      appendSelectionLog: (entry) => {
        const { selectionLog } = get();
        set({ selectionLog: [...selectionLog, entry] });
      },

      bumpStep: () => {
        const { currentStep, currentSuggestions, project } = get();
        set({
          currentStep: currentStep + 1,
          prevAiSuggestions: currentSuggestions,
          project: project
            ? {
                ...project,
                updatedAt: new Date().toISOString(),
                version: project.version + 1,
              }
            : null,
        });
      },

      updateCompletionDelta: (delta, coveredKeys) => {
        const { completionCategories } = get();
        const updated = completionCategories.map((c) =>
          coveredKeys.includes(c.key) ? { ...c, score: Math.min(100, c.score + delta) } : c,
        );
        const newScore = updated.reduce((acc, c) => acc + (c.score / 100) * c.weight, 0);
        set({ completionCategories: updated, completionScore: Math.min(100, newScore) });
      },

      setScreens: (screens) => set({ screens, activeScreenId: screens[0]?.id ?? null }),

      updateScreen: (updatedScreen) => {
        const { screens, wireframeHistory } = get();
        const history = [...wireframeHistory, screens].slice(-20);
        set({
          screens: screens.map((s) => (s.id === updatedScreen.id ? updatedScreen : s)),
          wireframeHistory: history,
        });
      },

      setActiveScreen: (id) => set({ activeScreenId: id }),
      setActivePlatformView: (view) => set({ activePlatformView: view }),
      setSelectedComponent: (id) => set({ selectedComponentId: id }),
      setPendingEditRequest: (req) => set({ pendingEditRequest: req }),

      undoWireframe: () => {
        const { wireframeHistory } = get();
        if (wireframeHistory.length === 0) return;
        const prev = wireframeHistory[wireframeHistory.length - 1];
        set({
          screens: prev ?? [],
          wireframeHistory: wireframeHistory.slice(0, -1),
        });
      },

      setDocuments: (docs) => set({ documents: docs }),
      setActiveMode: (mode) => set({ activeMode: mode }),
      setIsAiLoading: (loading) => set({ isAiLoading: loading }),
      setBottomSheetState: (state) => set({ bottomSheetState: state }),

      resetSession: () =>
        set({
          project: null,
          currentStep: 0,
          currentPhaseLabel: '',
          selectionLog: [],
          currentSuggestions: [],
          prevAiSuggestions: [],
          completionCategories: COMPLETION_CATEGORIES,
          completionScore: 0,
          screens: [],
          activeScreenId: null,
          wireframeHistory: [],
          documents: null,
          activeMode: 'flow',
        }),
    }),
    {
      name: 'planner-store',
      storage: createJSONStorage(() => getStorage()),
      partialize: (state) => ({
        project: state.project,
        currentStep: state.currentStep,
        currentPhaseLabel: state.currentPhaseLabel,
        selectionLog: state.selectionLog,
        completionCategories: state.completionCategories,
        completionScore: state.completionScore,
        screens: state.screens,
        documents: state.documents,
      }),
    },
  ),
);

// Selection that lives only for the current step (not persisted).
interface PlannerTransientState {
  selectedIds: Set<string>;
  customItems: string[];
  toggleSelectedId: (id: string) => void;
  addCustomItem: (text: string) => void;
  removeCustomItem: (text: string) => void;
  clear: () => void;
}

export const usePlannerTransient = create<PlannerTransientState>()((set) => ({
  selectedIds: new Set(),
  customItems: [],
  toggleSelectedId: (id) =>
    set((s) => {
      const next = new Set(s.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next };
    }),
  addCustomItem: (text) =>
    set((s) => ({ customItems: text.trim() ? [...s.customItems, text.trim()] : s.customItems })),
  removeCustomItem: (text) =>
    set((s) => ({ customItems: s.customItems.filter((t) => t !== text) })),
  clear: () => set({ selectedIds: new Set(), customItems: [] }),
}));
