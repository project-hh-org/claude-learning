---
title: "제텔카스텐으로 학습 로그 업그레이드 — Obsidian + 블로그 동기화"
date: "2026-05-07"
summary: "날짜 로그만 있던 블로그에 제텔카스텐 구조를 얹었다. concepts/ 폴더, [[wikilink]] 파서, 빌드 타임 백링크 계산까지."
tags: ["zettelkasten", "obsidian", "next.js", "knowledge-management", "blog"]
readTime: 5
related:
  - slug: "2026-05-05-obsidian-git-auto-push"
    label: "Obsidian Git 자동 push 설정"
  - slug: "2026-05-05-claude-code-setup-and-hooks"
    label: "Claude Code 환경 최적화"
concepts:
  - slug: "claude-md-architecture"
    label: "CLAUDE.md 3계층 아키텍처"
---

## 🔍 배경 / 맥락

학습 로그가 쌓이면서 "예전에 이거 어디서 봤더라?" 현상이 생기기 시작했다. 날짜순 목록만으로는 지식 간 연결이 보이지 않았다. Obsidian을 기본 편집기로 쓰고 있었기 때문에 제텔카스텐 방식을 그대로 블로그에 투영하는 방법을 찾았다.

---

## 💡 배운 것

### 제텔카스텐의 두 레이어

| 레이어 | 폴더 | 성격 |
|---|---|---|
| Entry | `entries/` | 날짜 기반 서사 — "그날 무슨 일이 있었나" |
| Concept | `concepts/` | 원자적 영구 노트 — "이 개념은 무엇인가" |

Entry는 계속 쌓이고, Concept은 계속 다듬어진다. `stage: seedling → budding → evergreen`으로 성숙도를 표시한다.

### Obsidian ↔ 블로그 브릿지: [[wikilink]]

Obsidian에서 `[[slug]]`로 연결하면 빌드 시 자동으로 HTML 링크로 변환된다.

```markdown
[[claude-code-hooks]]              → 개념 노트 링크
[[2026-05-05-claude-code-setup-and-hooks|글 제목]] → entry 링크
```

`src/lib/wikilink.js`에서 정규식으로 처리:

```js
content.replace(/\[\[([^\]]+)\]\]/g, (_, inner) => {
  const [ref, label] = inner.split('|')
  return `<a href="/${ref}" class="wikilink">${label || ref}</a>`
})
```

### 백링크 — 빌드 타임에 역방향 인덱스 계산

"이 글을 참조하는 노트들" 섹션을 만들기 위해 빌드 시 전체 파일을 스캔해서 역방향 맵을 만든다.

```js
// posts.js buildBacklinkMap()
// 모든 entry의 related + [[wikilink]]를 스캔 →
// { targetSlug: [{ slug, title, summary }] }
```

런타임이 아닌 빌드 타임에 계산하므로 SSG와 완벽히 호환된다.

### Obsidian 설정 포인트

- **Dataview 플러그인**: `concepts/` 폴더를 쿼리해 MOC 자동 생성
- **Templater 플러그인**: `TEMPLATE.md`, `CONCEPT_TEMPLATE.md` 자동 삽입
- **Graph View**: `[[wikilink]]`가 자동으로 시각적 연결선을 그려줌

---

## ✅ 적용한 것

**추가된 파일:**
- `concepts/` 5개 노트 — 기존 entry에서 핵심 개념 추출
- `src/lib/wikilink.js` — wikilink 파서
- `src/lib/concepts.js` — concepts/ 파싱
- `src/components/ConceptDetail.jsx` — 개념 노트 페이지
- `src/app/concept/[slug]/page.jsx` — `/concept/slug` 라우트
- `CONCEPT_TEMPLATE.md` — 개념 노트 템플릿

**업데이트된 파일:**
- `src/lib/posts.js` — wikilink 변환 + 백링크 계산 추가
- `src/components/PostDetail.jsx` — 개념 칩 / 관련 글 / 백링크 섹션
- 기존 5개 entry — `related`, `concepts` frontmatter + `[[wikilink]]` 추가
- `TEMPLATE.md`, `CLAUDE.md`, `README.md` — 새 규칙 반영

---

## 🔀 연결된 노트

자동 push 파이프라인: [[2026-05-05-obsidian-git-auto-push|Obsidian Git 자동 push]]
Claude Code 환경과 연계: [[2026-05-05-claude-code-setup-and-hooks|Claude Code 환경 최적화]]
CLAUDE.md 구조: [[claude-md-architecture|CLAUDE.md 3계층 아키텍처]]

---

_2026-05-07_
