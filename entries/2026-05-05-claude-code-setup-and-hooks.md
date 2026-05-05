---
title: "Claude Code 환경 최적화 — Hooks, CLAUDE.md, 플러그인 생태계"
date: "2026-05-05"
summary: "Claude Code의 Hooks 시스템으로 main push 차단·.env 보호·Prettier 자동화를 설정하고, 8개 플러그인과 실측 기반 대시보드를 구축했다."
tags: ["claude-code", "hooks", "claude-md", "productivity", "developer-tools", "security", "automation"]
readTime: 6
---

## 🔍 배경 / 맥락

Claude Code CLI를 본격 활용하기 위해 전체 설정을 점검하고 최적화하는 작업을 진행했다. 앤트로픽의 최신 업데이트(2026년 기준)를 반영해서 개발 생산성 워크플로우를 세팅했다.

---

## 💡 배운 것

### Hooks 시스템

Claude Code의 Hooks는 18개 이벤트에서 동작한다. 핵심은 **PreToolUse** — 유일하게 도구 실행을 **차단(exit 2)**할 수 있는 훅이다.

```bash
exit 0  → 허용
exit 2  → 차단 (PreToolUse에서만 동작)
```

**차단 가능한 위험 패턴:**
- `git push origin main` / `git push -f` → main 브랜치 직접 push
- `rm -rf /`, `DROP DATABASE` → 시스템 파괴 명령어
- `.env` 파일 읽기 → 시크릿 노출 방지

**PostToolUse로 자동화:**
- 파일 저장 후 Prettier 자동 포맷 (`.ts/.tsx/.js/.jsx/.json/.css/.md`)
- macOS 알림 (osascript) 연동 — 승인 대기·작업 완료 알림

### CLAUDE.md 3계층 아키텍처

```
~/.claude/CLAUDE.md        ← 전역 (모든 프로젝트에 적용)
[project]/CLAUDE.md        ← 프로젝트별 오버라이드
Skills CLAUDE.md           ← 특정 스킬에서 불러오는 것
```

WHAT/WHY/HOW 프레임워크로 작성하고 **200줄 이내** 유지 권장.

### 워크플로우 모드 키워드

| 키워드 | 모드 | 동작 |
|--------|------|------|
| "vibe", "빠르게" | vibe | any 타입 허용, 주석 최소, 작동 우선 |
| "production", "배포" | production | strict TS, 완전한 에러 처리, 테스트 필수 |
| "버그", "에러" | debug | 원인 파악, 단계별 로그 분석 |
| "리팩토링", "정리" | refactor | 테스트 먼저 확인, 동작 변경 없이 구조 개선 |

### Feature Flags 중요 발견사항

- `tengu_destructive_command_warning: false` — 위험 명령어 경고 비활성화됨 (기본값 주의)
- `tengu_ultraplan_config.enabled: true` + `visual_plan` — 복잡한 태스크 전 자동 계획 생성
- `tengu_worktree_mode: true` — 격리된 git worktree에서 실험 가능
- `tengu_review_bughunter_config.fleet_size: 5` — `/ultrareview` 시 5개 에이전트 동시 실행, $5~20
- `tengu_prompt_cache_1h` — 1시간 캐시 윈도우. 최근 세션 74% 히트율 달성

### iCloud 메모리 시스템

세션 간 컨텍스트 유지: `~/.claude/CLAUDE.md`에 iCloud 경로를 명시하면 Claude가 매 세션 시작 시 MEMORY.md를 자동으로 읽는다.

```bash
# ~/.claude/CLAUDE.md에 추가
## MEMORY
세션 시작 시 다음 파일을 읽어 컨텍스트를 파악한다:
- /Users/hwangdahee/Library/Mobile Documents/com~apple~CloudDocs/claude/MEMORY.md
```

---

## ✅ 적용한 것

```bash
# iCloud에 저장된 파일들
iCloud/claude/
├── MEMORY.md                 ← 사용자 컨텍스트
├── SESSION_LOG.md            ← 작업 이력
├── CLAUDE_GLOBAL.md          ← ~/.claude/CLAUDE.md 원본
├── hooks-guardrails.json     ← settings.json 병합 원본
├── dashboard.html            ← 실시간 현황 대시보드
└── learn/                    ← 러닝 로그 (이 프로젝트)
```

**적용 명령어:**

```bash
# 1. 전역 CLAUDE.md 설치
cp "iCloud/claude/CLAUDE_GLOBAL.md" ~/.claude/CLAUDE.md

# 2. Hooks 가드레일 적용
python3 - <<'EOF'
import json, shutil
s = "/Users/hwangdahee/.claude/settings.json"
h = "iCloud/claude/hooks-guardrails.json"
shutil.copy(s, s + ".bak")
with open(s) as f: settings = json.load(f)
with open(h) as f: hooks = json.load(f)
settings["hooks"] = hooks["hooks"]
with open(s, "w") as f: json.dump(settings, f, indent=2, ensure_ascii=False)
print("✅ 완료!")
EOF
```

---

## 🔗 참고 자료

- [Claude Code Hooks 공식 문서](https://docs.anthropic.com/claude-code/hooks)
- [CLAUDE.md 베스트 프랙티스](https://docs.anthropic.com/claude-code/memory)
- [superpowers 플러그인](https://github.com/obra/superpowers)

---

_2026-05-05_
