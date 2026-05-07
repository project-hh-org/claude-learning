---
title: "CLAUDE.md 3계층 아키텍처"
type: "concept"
stage: "evergreen"
tags: ["claude-code", "claude-md", "configuration"]
related:
  - "2026-05-05-claude-code-setup-and-hooks"
created: "2026-05-05"
updated: "2026-05-05"
---

## 핵심 아이디어

CLAUDE.md는 3계층으로 관리된다. 아래로 갈수록 좁은 범위에 적용되고, 하위 계층이 상위를 오버라이드한다.

## 계층 구조

```
~/.claude/CLAUDE.md          ← 전역: 모든 프로젝트에 항상 적용
[project-root]/CLAUDE.md     ← 프로젝트: 해당 레포에서만 적용
Skills CLAUDE.md             ← 스킬: 특정 스킬 호출 시 로드
```

## 작성 원칙

- **WHAT / WHY / HOW** 프레임워크로 작성
- **200줄 이내** 유지 (길면 Claude가 중요 부분을 놓침)
- 금지 규칙은 구체적인 패턴으로 (`any 금지`보다 `unknown 후 타입 좁히기`)

## iCloud 메모리 연동 패턴

전역 CLAUDE.md에 iCloud 경로를 명시하면 세션 간 컨텍스트 유지가 된다:

```markdown
## MEMORY
세션 시작 시 다음 파일을 읽어 컨텍스트를 파악한다:
- ~/Library/Mobile Documents/com~apple~CloudDocs/claude/MEMORY.md
```

## 연결

- [[2026-05-05-claude-code-setup-and-hooks]] — 실제 설정 과정 전체
