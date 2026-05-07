---
title: "Claude Code Hooks"
type: "concept"
stage: "evergreen"
tags: ["claude-code", "hooks", "security", "automation"]
related:
  - "2026-05-05-claude-code-setup-and-hooks"
  - "2026-04-24-ship-tmux-multi-agent"
created: "2026-05-05"
updated: "2026-05-05"
---

## 핵심 아이디어

Claude Code는 18개 이벤트에서 훅을 실행할 수 있다. **PreToolUse**가 핵심 — 도구 실행을 아예 막을(`exit 2`) 수 있는 유일한 훅이다.

## exit 코드 의미

```bash
exit 0  → 허용 (진행)
exit 2  → 차단 (PreToolUse 전용)
```

## 주요 용도 2가지

**1. 보안 가드레일 (PreToolUse)**
```bash
# main 직접 push 차단
# .env 파일 읽기 차단
# rm -rf / 같은 파괴 명령 차단
```

**2. 자동화 (PostToolUse)**
```bash
# 파일 저장 후 Prettier 자동 실행
# macOS 알림 연동 (osascript)
```

## 연결

- [[2026-05-05-claude-code-setup-and-hooks]] — 실제 설정 과정 전체
- [[2026-04-24-ship-tmux-multi-agent]] — ship에서 hook을 활용한 CI 게이트
