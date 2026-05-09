# AI 기획 빌더 — Claude Code 전체 개발 지침

## 레포지토리 클론

```bash
git clone https://github.com/project-hh-org/react-native-template.git ai-planner
cd ai-planner
pnpm install
```

---

## 제품 개요

사용자가 **0→100 프로젝트 기획을 완성**하는 앱+웹 동시 지원 인터랙티브 기획 빌더.

핵심 동작 원리:

- 매 기획 단계마다 **독립적인 Claude API 세션**이 실행됨
- 누적된 선택 로그가 다음 세션의 컨텍스트로 전달됨
- 이전 AI가 제안했던 항목 일부 + 새 세션의 추론 결과 일부가 조합되어 다음 선택지 생성
- 선택할 때마다 **4종 산출물(MD/JSON/Figma/AI프롬프트)이 실시간 업데이트**됨
- 기획이 충분히 쌓이면 **와이어프레임 에디터**로 전환, 실제 화면을 탭/조작하며 기획 발전
- 최종 산출물로 다른 AI(Claude Code, Cursor, v0.dev)에서 바로 개발 시작 가능

---

## 기술 스택 (템플릿 그대로 유지)

| 항목       | 버전/라이브러리                              |
| ---------- | -------------------------------------------- |
| 기반       | Expo 52, React Native 0.76, React 18.3       |
| 라우팅     | expo-router v4 (파일기반, typed routes)      |
| 스타일     | NativeWind v4 (Tailwind, global.css 토큰)    |
| 상태관리   | Zustand v5 + MMKV persist                    |
| 데이터패칭 | TanStack Query v5                            |
| 제스처     | react-native-gesture-handler                 |
| 애니메이션 | react-native-reanimated v3                   |
| SVG        | react-native-svg                             |
| 스토리지   | MMKV (웹 폴백: AsyncStorage)                 |
| AI         | Claude API claude-sonnet-4-20250514          |
| 린트       | Biome                                        |
| 언어       | TypeScript strict                            |

**웹 지원**: `app.config.ts`에 `web.bundler: 'metro'` 이미 설정됨 → `pnpm web`으로 실행

---

## 사전 작업: 불필요한 코드 제거

개발 시작 전 아래 파일/코드를 제거 또는 대체:

1. `src/features/auth/` 전체 폴더 → 삭제
2. `src/stores/auth.ts` → 삭제
3. `src/app/(auth)/` 전체 → 삭제
4. `src/lib/supabase.ts` → 삭제
5. `src/app/(tabs)/profile.tsx` → 삭제
6. `package.json`에서 `@supabase/supabase-js`, `@sentry/react-native` 제거 (선택, 나중에 필요시 재추가)
7. `src/app/_layout.tsx`에서 Supabase/Sentry import 제거, 기본 레이아웃만 유지
8. `src/locales/ko.json`, `en.json` 내용 초기화 후 이 프로젝트용으로 재작성

---

## 폴더 구조

```
src/
├── app/
│   ├── _layout.tsx                   # 루트 레이아웃 (GestureHandler, SafeArea, QueryClient)
│   ├── index.tsx                     # 시작화면 (목적 입력 + 템플릿 선택)
│   └── plan/
│       └── [sessionId]/
│           ├── _layout.tsx           # 기획 세션 레이아웃 (스토어 초기화)
│           ├── index.tsx             # 기획 플로우 화면 (카드 선택)
│           ├── wireframe.tsx         # 와이어프레임 에디터 화면
│           └── documents.tsx         # 산출물 전체보기 화면
├── components/
│   ├── ui/                           # 기존 템플릿 유지 (Button, Input)
│   ├── layout/                       # 기존 템플릿 유지 (Screen)
│   ├── flow/
│   │   ├── PlanningHeader.tsx        # 진행률 바 + 단계 레이블 (상단 고정)
│   │   ├── SuggestionCard.tsx        # 텍스트 전용 추천 카드
│   │   ├── ComponentPreviewCard.tsx  # 컴포넌트 프리뷰 포함 추천 카드
│   │   ├── ComponentVariantPicker.tsx # 스타일 변형 선택 (가로 스크롤)
│   │   ├── CustomInputCard.tsx       # 직접 입력 카드
│   │   └── SkeletonCard.tsx          # AI 로딩 중 스켈레톤
│   ├── wireframe/
│   │   ├── WireframeRenderer.tsx     # JSON → 화면 렌더링 총괄
│   │   ├── PhoneFrame.tsx            # 모바일 폰 프레임
│   │   ├── BrowserFrame.tsx          # 브라우저 프레임
│   │   ├── EmptyZone.tsx             # 빈 영역 (탭 가능, 점선 테두리)
│   │   ├── ActionSheet.tsx           # 요소 탭 시 하단 액션시트
│   │   ├── UndoBar.tsx               # 실행 취소 바
│   │   └── wire-components/          # 와이어프레임 컴포넌트 렌더러
│   │       ├── WireHeader.tsx
│   │       ├── WireBottomNav.tsx
│   │       ├── WireSearchBar.tsx
│   │       ├── WireCard.tsx
│   │       ├── WireList.tsx
│   │       ├── WireGrid.tsx
│   │       ├── WireButton.tsx
│   │       ├── WireInput.tsx
│   │       ├── WireTabBar.tsx
│   │       ├── WireImage.tsx
│   │       ├── WireModal.tsx
│   │       └── WireText.tsx
│   └── documents/
│       ├── DocumentPanel.tsx         # 산출물 패널 (탭 전환)
│       ├── StoryboardView.tsx        # MD 스토리보드 뷰어
│       ├── JsonView.tsx              # JSON 뷰어
│       └── PromptView.tsx            # AI 프롬프트 뷰어
├── features/
│   └── planner/
│       ├── api.ts                    # Claude API 호출 함수
│       ├── hooks.ts                  # usePlannerStep, useWireframeEdit 등
│       └── schemas.ts                # zod 스키마
├── stores/
│   └── planner.ts                   # 메인 Zustand 스토어
├── lib/
│   ├── ai/
│   │   ├── stepPrompt.ts             # 기획 스텝 시스템 프롬프트
│   │   ├── wireframePrompt.ts        # 와이어프레임 수정 시스템 프롬프트
│   │   └── documentPrompt.ts         # 산출물 생성 프롬프트
│   ├── wireframe/
│   │   └── schemaValidator.ts        # JSON 스키마 검증
│   ├── documents/
│   │   └── generators.ts             # MD/JSON/Figma/Prompt 생성 로직
│   ├── storage.ts                    # MMKV + 웹 폴백 (기존 파일 수정)
│   ├── cn.ts                         # 기존 유지
│   ├── env.ts                        # 기존 유지 + CLAUDE_API_KEY 추가
│   └── queryClient.ts                # 기존 유지
├── hooks/
│   ├── useAppState.ts                # 기존 유지
│   └── useColorScheme.ts             # 기존 유지
├── styles/
│   └── tokens.ts                     # 기존 유지
├── locales/
│   ├── ko.json                       # 한국어 (주)
│   └── en.json                       # 영어
└── types/
    └── index.ts                      # 전체 타입 정의
```

---

## 개발 순서 (이 순서대로 진행)

```
1.  레포 클론 + 불필요 코드 제거 (auth, supabase, sentry)
2.  src/types/index.ts 전체 타입 작성
3.  src/lib/storage.ts 웹 폴백 처리
4.  src/stores/planner.ts Zustand 스토어
5.  src/lib/ai/stepPrompt.ts 시스템 프롬프트
6.  src/app/api/step+api.ts Claude API 라우트
7.  src/app/index.tsx 시작화면 UI
8.  src/components/flow/PlanningHeader.tsx
9.  src/components/flow/SuggestionCard.tsx
10. wire-components 12종 구현 (WireHeader, WireBottomNav, WireSearchBar...)
11. src/components/flow/ComponentPreviewCard.tsx (wire-component 임베드)
12. src/components/flow/ComponentVariantPicker.tsx
13. src/app/plan/[sessionId]/index.tsx 기획 플로우 화면
14. src/lib/documents/generators.ts 산출물 생성
15. src/components/documents/DocumentPanel.tsx
16. src/app/api/wireframe+api.ts
17. src/components/wireframe/WireframeRenderer.tsx
18. src/components/wireframe/PhoneFrame.tsx + BrowserFrame.tsx
19. src/components/wireframe/ActionSheet.tsx
20. src/components/wireframe/EmptyZone.tsx
21. src/app/plan/[sessionId]/wireframe.tsx
22. MMKV 자동저장 + 세션 복구 (시작화면 "이어하기" 배너)
23. Undo 시스템 (wireframeHistory)
24. pnpm web 테스트 + 웹 폴백 확인
```

---

## 코드 컨벤션 (CLAUDE.md 기반)

- import는 항상 `@/` 알리아스 사용. `../../../` 금지
- NativeWind className 사용. 인라인 StyleSheet 지양
- 이미지는 `expo-image`만 사용
- 서버 상태 → TanStack Query / UI 상태 → useState / 전역 → Zustand
- 긴 목록은 FlashList 사용 (FlatList 금지)
- 하드코딩 문자열 금지 → `src/locales/ko.json`에 추가
- Biome으로 린트/포맷 (`pnpm lint:fix`)
- 타입체크 항상 통과 (`pnpm typecheck`)

---

## 완료 기준 (MVP)

- [ ] 시작화면에서 목적 입력 → 기획 스텝 시작
- [ ] 매 스텝마다 Claude API 독립 호출 + 선택지 표시
- [ ] 레이아웃 관련 항목은 컴포넌트 프리뷰 포함
- [ ] 진행률 0→100% 정상 계산
- [ ] 선택마다 MD/JSON/Figma/Prompt 실시간 업데이트
- [ ] 기획 완성도 40% 이상 시 와이어프레임 모드 진입 가능
- [ ] 와이어프레임 화면 탭 → AI 수정 → 즉시 반영
- [ ] Undo 동작
- [ ] MMKV 자동저장 + 재진입 시 복구
- [ ] `pnpm web` 으로 브라우저에서도 정상 동작
