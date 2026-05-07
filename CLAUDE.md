# claude/learn 프로젝트

다희의 개발 학습 로그 블로그. Next.js SSG + AWS S3/CloudFront로 배포됨.
URL: https://claude-learning.project-hh.com

## 폴더 구조

```
entries/          ← 날짜 기반 학습 로그 (서사형, "무엇을 했나")
concepts/         ← 원자적 개념 노트 (영구 노트, "무엇인가") ← 제텔카스텐
moc/              ← Map of Content (주제 인덱스, Dataview 쿼리) ← 선택적
configs/          ← Claude rule/hook/command 파일
  rules/          ← ~/.claude/rules/ 에 설치되는 규칙 파일
  hooks/          ← Claude hooks 스크립트
  commands/       ← 커스텀 Claude 명령어
src/
  app/            ← Next.js App Router
    [slug]/       ← Entry 상세 페이지
    concept/[slug]/ ← Concept 상세 페이지
    configs/[category]/[slug]/  ← Config 상세 페이지
  components/     ← PostDetail, ConceptDetail, PostList, ConfigDetail
  lib/
    posts.js      ← entries/ 파싱 + wikilink 변환 + 백링크 계산
    concepts.js   ← concepts/ 파싱
    wikilink.js   ← [[wikilink]] → HTML 변환 유틸
    configs.js    ← configs/ 파싱
scripts/          ← 자동 push 워처, launchd 설치
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

**파일 위치**: `configs/` 하위 카테고리 폴더에 생성

| 카테고리 | 폴더 | 용도 |
|---|---|---|
| Rule | `configs/rules/` | Claude 행동 규칙 (→ `~/.claude/rules/` 설치) |
| Hook | `configs/hooks/` | PreToolUse 등 hook 스크립트 |
| Command | `configs/commands/` | 커스텀 slash command |

**Frontmatter 필수 필드**:
```yaml
---
title: "제목"
description: "한 줄 설명"
category: "rules"   # rules | hooks | commands
tags: ["tag1"]
---
```

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
