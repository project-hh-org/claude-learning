---
title: "Claude 프로젝트 메모리 패턴 (.claude/memory/)"
type: "concept"
stage: "evergreen"
tags: ["claude-code", "memory", "productivity", "session-persistence"]
related:
  - slug: "claude-md-architecture"
    label: "CLAUDE.md 3계층 아키텍처"
  - slug: "2026-05-05-claude-code-setup-and-hooks"
    label: "Claude Code 환경 최적화"
created: "2026-05-17"
updated: "2026-05-17"
---

## 핵심 아이디어

Claude Code는 세션이 끊기면 이전 대화를 기억하지 못한다.
`.claude/memory/` 디렉토리에 마크다운 파일을 두고, `CLAUDE.md`에서 이를 로드하도록 지시하면 세션 간 컨텍스트를 유지할 수 있다.

단순히 "기억해줘"라고 말하는 것과의 차이: **git으로 버전 관리**되고, 다른 머신에서도 동일한 컨텍스트를 가져올 수 있다.

---

## 구조

```
project-root/
  .claude/
    memory/
      MEMORY.md          ← 인덱스 (새 세션 시작 시 이것만 먼저 읽음)
      project_status.md  ← 프로젝트 현황, 미완료 작업
      feedback_style.md  ← Claude에게 줬던 피드백 누적
      domain_logic.md    ← 도메인 핵심 지식 (코드에서 바로 못 읽는 것들)
      ...
  CLAUDE.md              ← 세션 시작 시 자동 로드됨
```

`CLAUDE.md`에 다음을 추가:

```markdown
## Claude 메모리 (.claude/memory/)

새 세션 시작 시 `.claude/memory/MEMORY.md` 인덱스를 읽고, 관련 파일을 로드한다.
```

---

## 메모리 파일 4가지 타입

| 타입 | 저장할 내용 | 예시 파일명 |
|---|---|---|
| **user** | 역할, 전문성, 선호 스타일 | `user_profile.md` |
| **feedback** | "이렇게 하지 마", "이게 좋았다" 누적 | `feedback_code_style.md` |
| **project** | 현재 상태, 미완료 작업, 결정 이유 | `project_status.md` |
| **reference** | 외부 시스템 위치 (슬랙 채널, DB, 문서) | `reference_external.md` |

---

## MEMORY.md 인덱스 형식

```markdown
# Memory Index

- [프로젝트 현황](project_status.md) — 현재 버전, 미완료 커밋 (2026-05-17)
- [피드백: 코드 스타일](feedback_code_style.md) — "any 쓰지 마", PR 단위 선호
- [도메인 로직](domain_logic.md) — 검색 파이프라인 핵심 흐름
```

한 줄에 파일명 + 핵심 한 줄 요약만. 인덱스가 200줄 넘으면 Claude가 잘라버린다.

---

## 실전 gotcha 2가지

### 1. Write tool이 `.claude/` 경로를 차단한다

Claude의 Write/Edit 툴은 `.claude/`(숨김 디렉토리) 경로에 파일을 쓰려 하면 차단된다:

```
blocked in this session — it resolves to a protected location
```

**우회법**: bash heredoc으로 직접 작성한다.

```bash
cat > .claude/memory/project_status.md << 'EOF'
---
name: 프로젝트 현황
type: project
---

## 현재 버전: v14
...
EOF
```

파일이 크면 Python inline script가 편하다:

```bash
python3 - << 'EOF'
content = """...(긴 내용)..."""
with open(".claude/memory/domain_logic.md", "w") as f:
    f.write(content)
EOF
```

### 2. `.gitignore`에 `.claude/`가 있을 수 있다

일부 프로젝트 템플릿이 `.claude/`를 gitignore한다. 메모리 파일을 커밋하기 전에 반드시 확인:

```bash
grep "claude" .gitignore
```

포함돼 있으면 memory 디렉토리만 예외 처리:

```
.claude/
!.claude/memory/
```

---

## iCloud MEMORY.md vs .claude/memory/ 차이

| | iCloud MEMORY.md | .claude/memory/ |
|---|---|---|
| 범위 | 전역 (모든 프로젝트) | 프로젝트별 |
| 버전 관리 | 별도 설정 필요 | git으로 자동 |
| 세션 로드 | 수동으로 CLAUDE.md에 경로 명시 | CLAUDE.md에서 로드 지시 |
| 적합한 내용 | 선호 스타일, 반복 피드백 | 도메인 지식, 프로젝트 상태 |

두 가지를 조합하는 게 가장 효과적이다: 전역 선호는 iCloud, 프로젝트 지식은 `.claude/memory/`.

---

## 연결

- [[claude-md-architecture]] — CLAUDE.md 3계층 구조 전체
