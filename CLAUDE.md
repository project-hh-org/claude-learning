# claude/learn 프로젝트

다희의 개발 학습 로그 블로그. Next.js SSG + AWS S3/CloudFront로 배포됨.
URL: https://claude-learning.project-hh.com

## 라우트 / 네비게이션

`src/components/TabNav.jsx`가 모든 인덱스 페이지에서 공유되는 단일 탭 네비게이션이다.
페이지별로 탭 항목을 다르게 두지 않는다 — 4개 라우트로 고정:

| 탭 | 경로 | 페이지 컴포넌트 |
|---|---|---|
| 📚 Learning Log | `/` (+ `/concept/...`) | `PostList` |
| 🔧 Claude Configs | `/configs` (+ `/configs/...`) | `ConfigsList` |
| 💡 Ideas | `/ideas` (+ `/ideas/...`) | `IdeaList` |
| 🌱 Seeds | `/seeds` (+ `/seeds/...`) | `SeedList` |

탭은 Next.js `<Link>` + `usePathname` 기반이라 클라이언트 SPA 네비게이션으로 동작 (전체 새로고침 없음). 새 인덱스 페이지를 추가할 때는:
1. `src/app/<name>/page.jsx`와 `src/components/<Name>List.jsx`를 만들고
2. `TabNav.jsx`의 `TABS` 배열에 항목 추가

탭 항목을 페이지별로 다르게 두지 않는다(이전에는 그랬으나 일관성 깨짐).

---

## 폴더 구조

```
entries/          ← 날짜 기반 학습 로그 (서사형, "무엇을 했나")
concepts/         ← 원자적 개념 노트 (영구 노트, "무엇인가") ← 제텔카스텐
ideas/            ← thinking 자동 캡처 — 현재 프로젝트 맥락의 메모/생각
seeds/            ← thinking 자동 캡처 — 별개 새 프로젝트 씨앗 (기획+starter prompt)
moc/              ← Map of Content (주제 인덱스, Dataview 쿼리) ← 선택적
configs/          ← Claude rule/hook/command/skill 단일 소스 (블로그 표시 + 자동 로드)
  rules/<name>.md          ← Claude 행동 규칙 (평탄)
  hooks/<name>.sh          ← Hook 스크립트 (평탄)
  commands/<name>.md       ← 커스텀 slash command (평탄)
  skills/<name>/SKILL.md   ← Skill 번들 (중첩 — Claude Code 공식 형식)
docs/             ← 셋업 가이드 등 비공개 페이지에서 참조하는 문서
src/
  app/            ← Next.js App Router
    page.jsx                    ← 홈 (Learning Log)
    [slug]/                     ← Entry 상세 페이지
    concept/[slug]/             ← Concept 상세 페이지
    configs/                    ← Configs 인덱스
    configs/[category]/[slug]/  ← Config 상세 페이지
    ideas/, ideas/[slug]/       ← Ideas 인덱스/상세
    seeds/, seeds/[slug]/       ← Seeds 인덱스/상세
  components/
    TabNav.jsx                  ← 공유 탭 네비게이션 (4개 라우트, Link 기반 SPA, pathname-based active)
    PostList.jsx                ← Learning Log 인덱스 (홈)
    PostDetail.jsx              ← Entry 상세
    ConceptDetail.jsx           ← Concept 상세
    ConfigsList.jsx             ← Configs 인덱스
    ConfigDetail.jsx            ← Config 상세
    IdeaList.jsx, IdeaDetail.jsx
    SeedList.jsx, SeedDetail.jsx
  lib/
    posts.js      ← entries/ 파싱 + wikilink 변환 + 백링크 계산
    concepts.js   ← concepts/ 파싱
    ideas.js      ← ideas/ 파싱
    seeds.js      ← seeds/ 파싱 + starter_prompt 추출
    wikilink.js   ← [[wikilink]] → HTML 변환 유틸
    configs.js    ← configs/ 파싱 (skills 중첩 구조 처리, installPath 노출)
scripts/          ← 자동 push 워처, launchd 설치, Desktop 셋업
public/
TEMPLATE.md       ← entry 작성 템플릿
CONCEPT_TEMPLATE.md ← concept 작성 템플릿
```

---

## 제텔카스텐 규칙

### 노트 타입

| 타입 | 폴더 | 파일명 형식 | 설명 |
|---|---|---|---|
| Entry | `entries/` | `YYYY-MM-DD-slug.md` | 날짜 기반 학습 로그 |
| Concept | `concepts/` | `concept-name.md` | 원자적 개념 노트 (날짜 없음) |
| MOC | `moc/` | `topic.md` | 주제별 인덱스 (Dataview 활용) |

### 노트 간 연결 방법 (2가지)

**1. frontmatter `related` / `concepts` 필드** (명시적 연결)
```yaml
related:
  - slug: "2026-05-05-claude-code-setup-and-hooks"
    label: "Claude Code 환경 최적화"
concepts:
  - slug: "claude-code-hooks"
    label: "Claude Code Hooks"
```

**2. 본문 내 `[[wikilink]]`** (Obsidian 호환, 블로그에서 클릭 링크로 변환)
```markdown
[[concept-slug]]              → 개념 노트 링크
[[concept-slug|표시할 레이블]] → 레이블로 표시
[[2026-05-05-entry-slug|글 제목]] → entry 링크
```

### stage 필드 (노트 성숙도)

| 값 | 의미 | 언제 |
|---|---|---|
| `seedling` 🌱 | 초안 | 처음 기록할 때 |
| `budding` 🌿 | 발전 중 | 추가 학습으로 보강 중 |
| `evergreen` 🌲 | 완성 | 안정적으로 정리된 상태 |

---

## 글(Entry) 추가 규칙

**파일 위치**: 반드시 `entries/` 폴더 안에 생성. 루트에 직접 생성 금지.

**파일명 형식**: `YYYY-MM-DD-slug.md`

**Frontmatter 필수 필드**:
```yaml
---
title: "제목"
date: "2026-05-07"
summary: "한 줄 요약"
tags: ["태그1", "태그2"]
related:
  - slug: "slug"
    label: "글 제목"
concepts:
  - slug: "concept-slug"
    label: "개념 이름"
---
```

**Lab Note (프로젝트/실험)일 경우 추가 필드**:
```yaml
type: "lab"
category: "AI"     # AI | DevTools | Infra | Design
stage: "evergreen" # evergreen | budding | seedling
links:
  - label: "GitHub"
    url: "https://..."
```

자세한 글 형식은 `TEMPLATE.md` 참고.

---

## 개념 노트(Concept) 추가 규칙

**파일 위치**: `concepts/` 폴더

**파일명**: `concept-name.md` (날짜 없음, kebab-case)

**Frontmatter 필수 필드**:
```yaml
---
title: "개념 이름"
type: "concept"
stage: "seedling"  # seedling | budding | evergreen
tags: ["태그"]
related:
  - "2026-05-05-related-entry-slug"
created: "2026-05-07"
updated: "2026-05-07"
---
```

---

## Config 추가 규칙

**파일 위치**: `configs/` 하위 카테고리 폴더에 생성. `configs/`는 **블로그 표시 + Claude 자동 로드의 단일 소스**다 (설치 스크립트가 `~/.claude/...`로 심볼릭 링크).

| 카테고리 | 폴더 구조 | 설치 경로 | 용도 |
|---|---|---|---|
| Rule | `configs/rules/<name>.md` | `~/.claude/rules/<name>.md` | Claude 행동 규칙 |
| Hook | `configs/hooks/<name>.sh` | `~/.claude/settings.json`에 항목 등록 (파일 자체는 레포 안 그대로 사용) | PreToolUse / Stop 등 hook 스크립트 |
| Command | `configs/commands/<name>.md` | `~/.claude/commands/<name>.md` | 커스텀 slash command |
| Skill | `configs/skills/<name>/SKILL.md` | `~/.claude/skills/<name>/SKILL.md` | Skill 번들 (중첩 구조) |

> ⚠️ **Skill만 구조가 다르다**: 다른 카테고리는 평탄한 `<category>/<file>.md`이지만, Skill은 `<category>/<name>/SKILL.md`로 중첩된다. 이는 Claude Code의 공식 Skill 발견 경로와 동일한 형식이다.

**Frontmatter 필수 필드**:

Rule / Hook / Command:
```yaml
---
title: "제목"
description: "한 줄 설명"
category: "rules"   # rules | hooks | commands
tags: ["tag1"]
---
```

Skill (`SKILL.md`):
```yaml
---
name: "skill-name"           # kebab-case, 폴더명과 동일
description: "언제 발동하는지 + 무엇을 하는지 (LLM이 매치하는 트리거)"
---
```

### 설치 (각 머신 1회)

```bash
bash scripts/install-claude-config.sh           # ~/.claude/...에 심볼릭 링크 (user 범위)
SCOPE=project bash scripts/install-claude-config.sh   # <repo>/.claude/...에 (project 범위)
```

심볼릭 링크라 `configs/`에서 편집하면 즉시 반영. 제거: `--uninstall`.

---

## 자동 캡처 파이프라인 (Ideas / Seeds / Concepts)

대화 중 휘발되기 쉬운 정보를 즉시 마크다운으로 저장. 세 영역으로 분리:

| 분류 | 폴더 | 무엇을 | 트리거 |
|---|---|---|---|
| 현재 프로젝트 맥락의 메모/생각 | `ideas/` | spark / buildable | thinking에서 발상 — `capture-idea` skill |
| 완전히 별개의 새 프로젝트 씨앗 | `seeds/` | 한 줄 피치 + 기획 + starter prompt | thinking에서 발상 — `capture-idea` skill |
| 새로 알게 된 정의/원리/패턴 | `concepts/` | 원자적 영구 노트 (seedling 상태) | 사용자 학습 시그널 — `capture-concept` skill |

판단 기준:
- "**만들어보면 좋겠다**" → `ideas/` 또는 `seeds/` (실현하려면 새 레포가 필요한가? yes면 seeds)
- "**X가 뭔지 알았다**" → `concepts/`
- "**오늘 한 일 회고**" → `entries/` (사용자가 명시 호출 — `/log-entry` 명령은 향후 추가 예정, [`docs/capture-pipeline-todo.md`](docs/capture-pipeline-todo.md) 참조)

세 영역은 서로 겹치지 않는다. 헷갈리면 저장하지 않는다 — 침묵이 노이즈보다 낫다.

### 구성요소 (하이브리드 — 즉시 캡처 + Stop hook 합성)

| 종류 | 파일 | 역할 |
|---|---|---|
| Skill | `configs/skills/capture-idea/SKILL.md` | thinking 발상 즉시 ideas/·seeds/에 저장 |
| Skill | `configs/skills/capture-concept/SKILL.md` | 학습 시그널 즉시 concepts/에 seedling 저장 |
| Rule | `configs/rules/capture-ideas.md` | capture-idea 발동 강제 |
| Rule | `configs/rules/capture-concepts.md` | capture-concept 발동 강제 |
| Stop hook (안전망) | `configs/hooks/idea-safety-net.sh` | 세션 끝에 thinking 후처리 → `ideas/_unsorted/` |
| Stop hook (합성) | `configs/hooks/concept-synthesis.sh` | 세션 끝에 정의 Q&A 추출 → `concepts/_unsorted/` |
| Desktop 셋업 | `scripts/setup-claude-desktop.sh` | chat app용 filesystem MCP 등록 |

`_unsorted/` 폴더의 후보는 사용자가 검토 후 정식 위치로 옮기거나 삭제한다.

### 캡처 후 흐름

`ideas/`·`seeds/`·`concepts/`에 파일 생성 → 자동 push → S3 배포 → `/ideas`·`/seeds` 페이지에서 열람 (concept은 기존 `/concept/[slug]` 페이지로 노출). seed 페이지의 "📋 프롬프트 복사" 버튼으로 starter prompt를 즉시 새 세션에 사용 가능.

### 머신별 1회 셋업

각 머신에서 한 번씩 등록이 필요하다. 자세한 절차: [`docs/idea-capture-setup.md`](docs/idea-capture-setup.md)

- **Claude Code (CLI)** + **Claude Code Desktop app**:
  ```bash
  bash scripts/install-claude-config.sh
  ```
  → `~/.claude/skills/`, `~/.claude/rules/`에 심볼릭 링크 + Stop hook 자동 등록.
- **Claude Desktop chat app** (claude.ai/download — 별개 제품):
  ```bash
  bash scripts/setup-claude-desktop.sh
  ```
  → filesystem MCP 등록 + Custom Instructions 가이드 작성. 가이드는 수동으로 Settings에 복붙.
- **Claude 모바일앱**: 자동 캡처 불가 (로컬 MCP/Hook/파일 쓰기 모두 미지원). Custom Instructions로 응답에 명시 출력 후 수동 이동만 가능.

> ⚠️ "Claude Code Desktop app"과 "Claude Desktop chat app"은 **다른 제품**이다.  
> 전자는 Claude Code의 GUI 버전(Skills/Hooks 모두 지원), 후자는 claude.ai에서 다운로드하는 채팅 앱(Skills/Hooks 지원 여부 불확실 → MCP + Custom Instructions 우회).

---

## 현재 entries 목록

| 날짜 | slug | 주제 |
|------|------|------|
| 2026-04-24 | ship-tmux-multi-agent | tmux 멀티 에이전트 |
| 2026-04-24 | symlink-single-source | 심볼릭 링크 활용 |
| 2026-05-05 | claude-code-setup-and-hooks | Claude Code 환경 설정 및 Hooks |
| 2026-05-05 | obsidian-git-auto-push | Obsidian 자동 push |
| 2026-05-07 | clickhouse-terminal-access | ClickHouse 터미널 접속 |
| 2026-05-07 | zettelkasten-obsidian-blog | 제텔카스텐 블로그 구축 |

## 현재 concepts 목록

| slug | 주제 | stage |
|------|------|-------|
| tmux-wave-pattern | tmux Wave 패턴 | evergreen |
| claude-code-hooks | Claude Code Hooks | evergreen |
| claude-md-architecture | CLAUDE.md 3계층 아키텍처 | evergreen |
| symlink-single-source | 심볼릭 링크 단일 소스 패턴 | evergreen |
| aws-secrets-manager-pattern | AWS Secrets Manager 자격증명 패턴 | budding |

---

## 공개 저장소 규칙 (중요)

이 저장소는 **외부에 공개**된다. 모든 파일 작성 시 아래를 반드시 준수한다.

**절대 포함 금지:**
- 회사/서비스 고유 명칭 (예: `dahee`, `danble`, `project-hh` 등 내부 식별자)
- AWS Secret ID, ARN 실제 값 → `YOUR_SECRET_ID`로 대체
- 내부 도메인, IP, 계정 ID, 리소스 이름
- API key, token, password 등 자격증명 실제 값

**대체 표기 규칙:**
| 실제 값 | 문서에 쓸 표기 |
|---|---|
| 회사/서비스명 | 생략하거나 `your-app` |
| Secret ID | `YOUR_SECRET_ID` |
| 내부 호스트 | `your-host.region.aws.clickhouse.cloud` |

---

## 배포

`entries/` 또는 `concepts/`에 파일 저장 → Obsidian Git 자동 push → GitHub Actions → S3 → CloudFront 자동 배포.

수동 배포:
```bash
npm run build
```
