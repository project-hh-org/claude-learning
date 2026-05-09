// ─── 프로젝트 메타 ───────────────────────────────────────────

export type Platform = 'app' | 'web' | 'responsive' | 'multi';

export type ProjectTemplate =
  | 'ecommerce'
  | 'social'
  | 'saas'
  | 'internal-tool'
  | 'content'
  | 'booking'
  | 'custom';

export interface ProjectMeta {
  id: string;
  name: string;
  goal: string;
  template: ProjectTemplate;
  platforms: Platform[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

// ─── 기획 플로우 ─────────────────────────────────────────────

export type SuggestionCategory =
  | 'auth'
  | 'ui'
  | 'feature'
  | 'flow'
  | 'data'
  | 'strategy'
  | 'onboarding'
  | 'error'
  | 'navigation'
  | 'goal'
  | 'target'
  | 'edge';

export type SuggestionPriority = 'required' | 'recommended' | 'optional';

export type WireComponentType =
  | 'header'
  | 'bottomNav'
  | 'tabBar'
  | 'searchBar'
  | 'card'
  | 'list'
  | 'grid'
  | 'button'
  | 'input'
  | 'modal'
  | 'sheet'
  | 'image'
  | 'text'
  | 'divider'
  | 'spacer'
  | 'emptyZone';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: SuggestionCategory;
  priority: SuggestionPriority;
  hasComponent: boolean;
  componentType?: WireComponentType;
  componentVariants?: string[];
  selectedVariant?: string;
}

export interface StepSelection {
  step: number;
  phaseLabel: string;
  selected: string[];
  custom: string[];
  componentsChosen: string[];
  timestamp: string;
}

// ─── AI 세션 입출력 ──────────────────────────────────────────

export interface StepContext {
  projectGoal: string;
  platforms: Platform[];
  stepNumber: number;
  completionScore: number;
  selectionLog: StepSelection[];
  prevAiSuggestions: {
    id: string;
    title: string;
    hasComponent: boolean;
    componentType?: string;
  }[];
  coveredCategories: string[];
}

export interface StepResponse {
  phaseLabel: string;
  suggestions: Suggestion[];
  carriedOverIds: string[];
  completionDelta: number;
  missingCategories: SuggestionCategory[];
}

// ─── 완성도 ──────────────────────────────────────────────────

export interface CompletionCategory {
  key: string;
  label: string;
  weight: number;
  score: number;
}

export const COMPLETION_CATEGORIES: CompletionCategory[] = [
  { key: 'goal', label: '목적/목표', weight: 15, score: 0 },
  { key: 'target', label: '타겟/사용자', weight: 15, score: 0 },
  { key: 'feature', label: '핵심 기능/화면', weight: 25, score: 0 },
  { key: 'navigation', label: '정보구조/네비게이션', weight: 15, score: 0 },
  { key: 'edge', label: '예외처리/엣지케이스', weight: 10, score: 0 },
  { key: 'strategy', label: '실행전략/우선순위', weight: 20, score: 0 },
];

// ─── 와이어프레임 ─────────────────────────────────────────────

export interface WireComponent {
  id: string;
  type: WireComponentType;
  props: Record<string, unknown>;
  position: { row: number; col?: number };
  size?: { width?: string; height?: number };
  children?: WireComponent[];
  tappable?: boolean;
}

export interface ScreenFlow {
  from: string;
  to: string;
  trigger: string;
}

export interface WireScreen {
  id: string;
  name: string;
  platform: 'app' | 'web';
  components: WireComponent[];
  flows: ScreenFlow[];
}

export interface WireframeEditRequest {
  screenId: string;
  componentId?: string;
  request: string;
  position?: { row: number };
}

export interface WireframeEditResponse {
  updatedScreen: WireScreen;
  changeDescription: string;
}

// ─── 산출물 ──────────────────────────────────────────────────

export interface ProjectJSON {
  meta: ProjectMeta & { completionScore: number };
  completionCategories: CompletionCategory[];
  planningLog: StepSelection[];
  screens: WireScreen[];
  missingCategories: string[];
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fills?: unknown[];
  children?: FigmaNode[];
}

export interface FigmaFrame {
  id: string;
  name: string;
  type: 'FRAME';
  width: number;
  height: number;
  children: FigmaNode[];
}

export interface FigmaExportJSON {
  document: {
    id: string;
    name: string;
    type: 'DOCUMENT';
    children: FigmaFrame[];
  };
}

export interface LiveDocuments {
  storyboardMd: string;
  projectJson: ProjectJSON;
  figmaJson: FigmaExportJSON;
  promptMd: string;
  version: number;
  lastUpdated: string;
}

// ─── 스토어 ──────────────────────────────────────────────────

export type ActiveMode = 'flow' | 'wireframe' | 'documents';
export type BottomSheetState = 'closed' | 'component-action' | 'empty-zone' | 'documents';
export type PlatformView = 'app' | 'web';
