# 컴포넌트 컨벤션

이 프로젝트는 5개 entity(post · concept · config · idea · seed)에 대한 인덱스/상세 페이지를 제공한다. 페이지마다 스타일이 미묘하게 달라지는 것을 막기 위해 **공유 primitive · layout shell · 도메인별 조립** 3계층으로 컴포넌트를 분리한다.

> FSD(Feature-Sliced Design)나 Atomic Design을 형식적으로 적용하지 않는다. 1인 프로젝트 + 5 entity + 단순 SSG 블로그라 ceremony가 과한 만큼 — 그러나 두 접근의 핵심 가치(공유 primitive 재사용, layout 일관성)는 모두 가져온다.

## 3계층 구조

```
src/components/
  layout/         ← 페이지 외곽 셸 (1쌍의 List/Detail이 공유)
    ListLayout.jsx     인덱스 페이지(/, /configs, /ideas, /seeds) 공통 셸
    DetailLayout.jsx   상세 페이지 공통 셸 (header + back-btn + article)
    TabNav.jsx         4개 인덱스 탭 (Link 기반 SPA)
  ui/             ← atom 단위 primitive (프레젠테이션만, 비즈니스 로직 X)
    Badge.jsx          variant prop으로 색/이모지 결정 — kind/stage/category 모두 처리
    EntryCard.jsx      post-card (날짜 컬럼 + 본문) — Learning Log용
    MetaCard.jsx       cfg-card 류 (배지 + 본문) — Configs/Ideas/Seeds 공통
    SearchInput.jsx    (단계 3 예정)
    TagFilter.jsx      (단계 3 예정)
    CopyButton.jsx     (단계 4 예정)
  list/           ← 인덱스 페이지 본체 — atoms와 layout을 도메인별로 조립
    PostList.jsx, ConfigsList.jsx, IdeaList.jsx, SeedList.jsx
  detail/         ← 상세 페이지 본체
    PostDetail.jsx, ConfigDetail.jsx, ConceptDetail.jsx, IdeaDetail.jsx, SeedDetail.jsx
  sidebar/        ← 페이지별 사이드바 fragment (단계 5 예정)
src/lib/          ← 데이터 layer (markdown 파싱)
  posts.js, concepts.js, configs.js, ideas.js, seeds.js, wikilink.js
```

> 현재(2026-05-08) 시점에는 폴더 분리는 단계 5에서 적용. 그 전까지는 `src/components/`에 평탄하게 두고 명명만 컨벤션을 따른다.

## 계층별 책임

### `layout/` — 외곽 일관성 책임
- `<header>`, `<TabNav>`, `<div.page-wrap>` 등 페이지 chrome을 단일 소스로
- props로 페이지별 차이(stats, sidebar 등)를 받음
- 비즈니스 로직 X — 데이터는 받기만 한다

### `ui/` — atom 단위 primitive
- 프레젠테이션만 — `useRouter`, `fetch` 등 사이드 이펙트 X
- 모든 페이지에서 동일하게 동작한다는 보장
- 인터랙션이 필요하면 props로 콜백을 받는다 (`onClick`, `onSelect`)
- variant prop으로 표현 분기 — 새 variant가 필요하면 atom을 확장

### `list/`, `detail/` — 도메인별 조립
- atoms와 layout을 조합해 entity별 페이지 본체를 구성
- 비즈니스 로직(필터링, 정렬, 그룹핑)은 여기에
- 마크업은 atom에 위임 — `<EntryCard>`, `<Badge>` 등을 사용
- 인라인 스타일 최소화 — 반복 패턴은 atom으로 승격

### `sidebar/` — 페이지별 사이드바 (단계 5)
- 각 인덱스 페이지의 사이드바 콘텐츠
- `ListLayout`의 `sidebar` prop으로 주입

## 명명 규칙

- 컴포넌트 파일: `PascalCase.jsx`
- 컴포넌트 함수: `PascalCase`
- 컴포넌트 export: default export (단일 파일 = 단일 컴포넌트가 기본)
- 보조 export: variant 객체나 helper는 named export 가능 (`export const STAGE_BADGE = ...`)
- CSS 클래스: kebab-case (예: `.post-card`, `.cfg-badge--orange`)
- atom의 variant prop: 의미 위주 (`variant="orange"` 보다 `variant="rule"` 또는 `tone="warning"` 같은 의도 표현)

## 인라인 스타일 vs CSS 클래스

| 상황 | 권장 |
|---|---|
| 반복되는 패턴 (cfg-badge, post-card 등) | CSS 클래스 (globals.css) |
| 한 번만 쓰이는 미세 조정 | 인라인 스타일 OK |
| 동적 값 (예: stage color) | inline `style={{ color: stage.color }}` |
| 새로 도입되는 패턴 | 우선 인라인으로 시도 → 2회 이상 반복되면 atom/클래스로 승격 |

## 새 entity 추가 시

`/blogs`라는 새 entity를 추가한다고 가정:

1. `src/lib/blogs.js` — 마크다운 파서 작성
2. `src/components/BlogList.jsx` — `ListLayout` + 기존 `MetaCard` (또는 `EntryCard`) 조합
3. `src/components/BlogDetail.jsx` — `DetailLayout` + 기존 `Badge` 조합
4. `src/app/blogs/page.jsx`, `src/app/blogs/[slug]/page.jsx` — 라우트
5. `src/components/TabNav.jsx`의 `TABS` 배열에 항목 추가

기존 컴포넌트를 수정하지 않고 추가만으로 끝나야 한다. 수정이 필요하다면 그건 atom 일반화가 필요하다는 신호.

## 리팩토링 단계 (진행 중)

| 단계 | 내용 | 상태 |
|---|---|---|
| 1 | `DetailLayout` 추출 (5개 Detail 외곽 통일) | 진행 중 |
| 2 | `Badge` / `EntryCard` / `MetaCard` atom 추출 | 진행 중 |
| 3 | `SearchInput` / `TagFilter` atom 추출 | 예정 (별도 PR) |
| 4 | `CopyButton` 추출 (현재 SeedDetail 인라인) | 예정 (별도 PR) |
| 5 | 폴더 분리 (`layout/`, `ui/`, `list/`, `detail/`, `sidebar/`) | 예정 (별도 PR) |

각 단계는 독립적이라 PR 단위로 진행한다.

## 안티 패턴 (지양)

- ❌ List/Detail에서 직접 `<header>` `<TabNav>` 작성 — `ListLayout`/`DetailLayout` 사용
- ❌ 같은 cfg-badge 마크업을 여러 곳에 복사 — `Badge` atom 사용
- ❌ 인라인 스타일에 동일한 객체 반복 정의 — atom으로 승격
- ❌ atom에서 `useRouter` 호출 — onClick 콜백을 props로 받기
- ❌ "페이지마다 살짝 다르게" — 다른 점이 있으면 atom을 확장하거나 variant prop 추가
