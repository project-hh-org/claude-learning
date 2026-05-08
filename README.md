# 📚 Claude Learning Log

다희의 개발 학습 기록 — [claude-learning.project-hh.com](https://claude-learning.project-hh.com)

Obsidian으로 작성하는 제텔카스텐 기반 학습 로그. 날짜 기반 **Entry**(학습 서사)와 원자적 **Concept**(영구 노트)으로 구성되며, `[[wikilink]]`로 노트 간 연결을 표현한다.

---

## 구조

```
entries/          ← 날짜 기반 학습 로그 (YYYY-MM-DD-slug.md)
concepts/         ← 원자적 개념 노트 (concept-name.md)
moc/              ← Map of Content — 주제별 인덱스 (선택적)
configs/          ← Claude rule/hook/command 파일
  rules/          ← 행동 규칙
  hooks/          ← PreToolUse 등 hook 스크립트
  commands/       ← 커스텀 slash command
src/
  app/
    [slug]/                     ← Entry 상세 페이지
    concept/[slug]/             ← Concept 상세 페이지
    configs/[category]/[slug]/  ← Config 상세 페이지
  components/
    PostDetail.jsx    ← Entry 렌더링 (관련 글 · 백링크 · 개념 칩)
    ConceptDetail.jsx ← Concept 렌더링
    PostList.jsx      ← 홈 목록
    ConfigDetail.jsx  ← Config 렌더링
  lib/
    posts.js      ← entries/ 파싱 + wikilink 변환 + 백링크 계산
    concepts.js   ← concepts/ 파싱
    wikilink.js   ← [[wikilink]] → HTML 링크 변환 유틸
    configs.js    ← configs/ 파싱
scripts/
.github/workflows/deploy.yml  ← S3 배포 파이프라인
TEMPLATE.md         ← Entry 작성 템플릿
CONCEPT_TEMPLATE.md ← Concept 작성 템플릿
```

---

## 노트 작성

### Entry (학습 로그)

`entries/YYYY-MM-DD-slug.md` 생성. 자세한 형식은 `TEMPLATE.md` 참고.

```yaml
---
title: "제목"
date: "2026-05-07"
summary: "한 줄 요약"
tags: ["태그1", "태그2"]
related:
  - slug: "2026-05-05-related-slug"
    label: "관련 글 제목"
concepts:
  - slug: "concept-slug"
    label: "개념 이름"
---
```

본문에서 `[[wikilink]]` 사용 — Obsidian에서 클릭 탐색, 블로그에서 링크로 렌더링.

```markdown
[[concept-slug|레이블]]              ← 개념 노트 링크
[[2026-05-05-slug|글 제목]]          ← 다른 entry 링크
```

### Concept (개념 노트)

`concepts/concept-name.md` 생성. 자세한 형식은 `CONCEPT_TEMPLATE.md` 참고.

```yaml
---
title: "개념 이름"
type: "concept"
stage: "seedling"   # seedling | budding | evergreen
tags: ["태그"]
related:
  - "2026-05-07-entry-slug"
created: "2026-05-07"
updated: "2026-05-07"
---
```

### Stage 의미

| 값 | 아이콘 | 의미 |
|---|---|---|
| `seedling` | 🌱 | 초안 |
| `budding` | 🌿 | 발전 중 |
| `evergreen` | 🌲 | 완성 |

---

## 로컬 개발

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # 정적 빌드 → out/
```

---

## 배포 파이프라인

```
entries/ 또는 concepts/ 파일 저장
  → Obsidian Git 자동 commit + push
  → GitHub Actions (Next.js SSG 빌드)
    - [[wikilink]] → HTML 링크 변환
    - 백링크 빌드 타임 계산
  → AWS S3 sync
  → CloudFront 캐시 무효화
  → https://claude-learning.project-hh.com
```

수동 push가 필요한 경우:

```bash
brew install fswatch
bash scripts/install-launchd.sh   # 로그인 시 자동 시작
tail -f /tmp/claude-learn-watcher.log
```

---

## 아이디어 자동 캡처

thinking 중 떠오른 발상을 즉시 마크다운으로 저장하는 파이프라인이 포함되어 있다.

- `ideas/` — 현재 프로젝트 맥락의 메모/생각
- `seeds/` — 별개 새 프로젝트 씨앗 (간단 기획 + starter prompt 포함)
- 웹: `/ideas`, `/seeds`

머신별 1회 셋업이 필요하다:

- **Claude Code (CLI/Desktop app)**: `bash scripts/install-claude-config.sh` — `configs/`의 skills/rules를 `~/.claude/...`로 심볼릭 링크 + Stop hook 등록
- **Claude Desktop chat app**: `bash scripts/setup-claude-desktop.sh` — filesystem MCP 등록 + Custom Instructions 가이드 작성

자세한 절차는 [`docs/idea-capture-setup.md`](docs/idea-capture-setup.md).

---

## 인프라

| 항목 | 값 |
|------|-----|
| 호스팅 | AWS S3 + CloudFront |
| 리전 | ap-northeast-2 (서울) |
| CI/CD | GitHub Actions |
