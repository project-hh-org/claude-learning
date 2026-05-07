# claude/learn 프로젝트

다희의 개발 학습 로그 블로그. Next.js SSG + AWS S3/CloudFront로 배포됨.
URL: https://claude-learning.project-hh.com

## 폴더 구조

```
entries/          ← 학습 로그 글 원본 마크다운
configs/          ← Claude rule/hook/command 파일
  rules/          ← ~/.claude/rules/ 에 설치되는 규칙 파일
  hooks/          ← Claude hooks 스크립트
  commands/       ← 커스텀 Claude 명령어
src/
  app/            ← Next.js App Router
    configs/[category]/[slug]/  ← Config 상세 페이지
  components/     ← PostList, PostDetail, ConfigDetail
  lib/
    posts.js      ← entries/ 마크다운 파싱
    configs.js    ← configs/ 마크다운 파싱
scripts/          ← 자동 push 워처, launchd 설치
public/
TEMPLATE.md       ← 글 작성 템플릿
README.md         ← 프로젝트 전체 설명
```

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

## 글 추가 규칙

**파일 위치**: 반드시 `entries/` 폴더 안에 생성. 루트에 직접 생성 금지.

**파일명 형식**: `YYYY-MM-DD-slug.md`
- 예: `2026-05-07-clickhouse-terminal-access.md`

**Frontmatter 필수 필드**:
```yaml
---
title: "제목"
date: "2026-05-07"
summary: "한 줄 요약"
tags: ["태그1", "태그2"]
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

## 현재 entries 목록

| 날짜 | slug | 주제 |
|------|------|------|
| 2026-04-24 | ship-tmux-multi-agent | tmux 멀티 에이전트 |
| 2026-04-24 | symlink-single-source | 심볼릭 링크 활용 |
| 2026-05-05 | claude-code-setup-and-hooks | Claude Code 환경 설정 및 Hooks |
| 2026-05-05 | obsidian-git-auto-push | Obsidian 자동 push |
| 2026-05-07 | clickhouse-terminal-access | ClickHouse 터미널 접속 |

## 배포

`entries/`에 파일 저장 → fswatch 감지 → git push → GitHub Actions → S3 → CloudFront 자동 배포.

수동 배포:
```bash
npm run build
```
