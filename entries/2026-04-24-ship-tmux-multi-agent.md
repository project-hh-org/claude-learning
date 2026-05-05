---
title: "tmux + Claude Agent로 기획부터 PR까지 원커맨드 자동화하기"
date: "2026-04-24"
summary: "`ship` 한 줄로 브랜치 생성 · 멀티 에이전트 병렬 실행 · CI 게이트 · PR 생성까지. tmux Wave 패턴으로 설계한 AI 개발 워크플로우 이야기."
tags: ["Claude Code", "tmux", "Multi-Agent", "Automation", "Bash"]
links:
  - label: "GitHub"
    url: "https://github.com/project-hh-com/tmux"
  - label: "문서 사이트"
    url: "https://project-hh-com.github.io/tmux"
  - label: "튜토리얼"
    url: "https://project-hh-com.github.io/tmux/ship/ship-tutorial.html"
  - label: "개요"
    url: "https://project-hh-com.github.io/tmux/ship/ship-overview.html"
references:
  - label: "Claude Code 공식 문서"
    url: "https://docs.claude.com/en/docs/claude-code/overview"
  - label: "Anthropic — Building effective agents"
    url: "https://www.anthropic.com/engineering/building-effective-agents"
  - label: "tmux Wiki"
    url: "https://github.com/tmux/tmux/wiki"
---

> 📚 이 글은 `ship`을 **왜** 이렇게 설계했는지, 내부에서 **어떻게** 움직이는지에 집중한다.
> 설치·사용법·tmux 설정 등 실전 가이드는 아래 문서를 먼저 읽는 걸 권한다.
>
> - 🧭 **개요** — [ship-overview](https://project-hh-com.github.io/tmux/ship/ship-overview.html)
> - 🛠 **튜토리얼 (설치 + 사용법)** — [ship-tutorial](https://project-hh-com.github.io/tmux/ship/ship-tutorial.html)
> - 💻 **리포지토리** — [project-hh-com/tmux](https://github.com/project-hh-com/tmux)

---

## 🔍 배경 / 맥락

### 문제: AI의 조수가 되는 개발자

개발 과정에서 사람의 개입을 최대한 줄이고 싶었다. AI가 코드를 잘 짜는 건 이제 당연한 얘기인데, 정작 **"AI에게 일을 시키고 결과를 받는 과정"** 자체는 여전히 사람 손이 많이 간다.

```
브랜치 따기 → 요구사항 정리 → 에이전트에 전달
→ 타입체크 / 린트 / 테스트 / 빌드 실행
→ 실패 로그 다시 에이전트에 붙여넣기
→ 커밋 → 푸시 → PR 생성
```

특히 **에이전트를 여러 개 동시에 돌릴 때** — 터미널을 여러 개 열고 각각 프롬프트를 붙여넣는 작업은 "내가 왜 AI의 조수 역할을 하고 있지?" 싶을 정도였다.

### 해결: `ship` 한 줄

사람이 입력하는 건 **"무엇을 만들지" 한 줄뿐**이다. 브랜치 생성부터 PR까지, 검증 단계까지 에이전트가 스스로 돌린다.

```bash
ship "로그인 페이지에 소셜 로그인 버튼 추가"
```

---

## 💡 배운 것

### `ship`이 내부에서 하는 일

`ship "..."` 한 줄을 실행하면 다음 단계가 순서대로 진행된다.

| 단계 | 내용 |
|------|------|
| 🌿 **브랜치 생성** | `feat/{slug}-{timestamp}` — main/master/prd/develop에서만 자동 분기 |
| 🤖 **architect 에이전트** | 요청 분석 → 필요한 하위 에이전트 목록을 `agents.txt`로 출력 |
| 🗣️ **설계 토론** | red → blue → judge 3자 토론으로 계획의 허점 검증 |
| ⚡ **Wave A (구현)** | tmux 창 분할 후 구현 에이전트 병렬 실행 |
| ⚡ **Wave B (검증)** | Wave A 완료 후 검증 에이전트 병렬 실행 |
| 🗣️ **구현 후 토론** | judge가 `REWORK` 판정하면 Wave 전체 재실행 |
| 💾 **중간 커밋** | Wave 완료마다 자동 commit + push |
| 🔍 **CI 게이트** | `tsc` → `eslint` → `npm test` → `npm run build` 4단계 |
| 🔄 **자동 수정** | 게이트 실패 시 로그를 읽고 수정, 최대 3라운드 |
| 📬 **PR 생성** | `release-manager` 에이전트가 PR 생성 (실패 시 Draft) |

---

### 핵심 아이디어: tmux 분할 + 파일 플래그 동기화

멀티 에이전트를 안정적으로 돌리는 데 가장 큰 걸림돌은 **충돌**과 **동기화**다.

#### 1. tmux `split-window`로 에이전트마다 독립 창

tmux가 이미 붙어있으면 `split-window -h`로 새 컬럼, 같은 Wave의 나머지 에이전트는 `split-window -v`로 세로 분할한다. `select-layout main-vertical`로 정리하면 아래 구조가 만들어진다.

```
┌─────────────────────────────────────────────────┐
│  main pane  │  Wave A (구현)  │  Wave B (검증)  │
│             │  ┌───────────┐  │  ┌───────────┐  │
│  ship       │  │ backend   │  │  │ reviewer  │  │
│  (스크립트)  │  ├───────────┤  │  ├───────────┤  │
│             │  │ frontend  │  │  │ test      │  │
│             │  ├───────────┤  │  ├───────────┤  │
│             │  │ debugger  │  │  │ security  │  │
│             │  └───────────┘  │  └───────────┘  │
└─────────────────────────────────────────────────┘
```

#### 2. 완료 신호는 `.done` 파일 플래그

각 에이전트 프롬프트 끝에 아래 한 줄을 박아둔다.

```bash
touch ${FLAG_DIR}/<agent-name>.done
```

메인 스크립트는 5초 간격으로 `.done` 파일 개수를 세다가, Wave 안의 전원이 완료되면 다음 단계로 넘어간다.

> **💡 핵심**: 에이전트 간 상태 공유를 파일 시스템으로 해결하면 복잡한 IPC 없이 안정적인 동기화가 된다.

---

### red / blue / judge 토론

에이전트 결과물을 사람이 다시 읽는 시간을 줄이기 위한 장치. `ship`에서 두 번 돈다 — **설계 직후**, **Wave B(검증) 직후**.

| 역할 | 할 일 |
|------|------|
| 🔴 **red** | 허점·위험요소·누락된 엣지케이스만 지적 (해결책 제시 금지) |
| 🔵 **blue** | red의 지적을 `ACCEPT` / `MITIGATE` / `REJECT`로 판정, 수락·완화 항목은 실제 파일 수정 |
| ⚖️ **judge** | 라운드 결과를 `CONSENSUS` / `CONTINUE` / `REWORK` 중 하나로 판정 |

```
CONSENSUS → 다음 단계로 진행
CONTINUE  → 한 라운드 더 (최대 2라운드)
REWORK    → Wave 에이전트 전체 처음부터 재실행
```

---

## ✅ 적용한 것

### 배우면서 깨달은 것들

| 발견 | 내용 |
|------|------|
| **에이전트는 적을수록 빠르다** | 작업이 작으면 1명이 훨씬 빠르고 디버깅도 쉽다. architect의 진짜 일은 **최소한의 에이전트**를 고르는 것. |
| **Wave 경계 = 체크포인트** | 중간 커밋을 Wave 단위로 남기니 실패해도 어디서 꼬였는지 바로 보인다. |
| **CI 게이트가 없으면 에이전트는 자기 말만 믿는다** | "다 했다"고 말하는 에이전트도 `tsc --noEmit`에서 한 방에 사실이 드러난다. |
| **프롬프트에 로그 내용을 임베드하지 않는다** | 에이전트에게 파일 경로만 넘기고 `Read` 툴로 읽게 한다. 프롬프트 크기가 줄고 에이전트가 필요한 부분만 골라 읽는다. |

### 앞으로 붙여볼 방향들

- **`fix` 커맨드** — 버그 수정 특화. Wave A에 `debugger` + `test`만 태워 원인 분석 → 수정 → 회귀 테스트 작성
- **`review` 커맨드** — PR 리뷰 자동화. `reviewer` + `security`가 레이어 규칙·타입 안전성·보안 취약점 검토 후 `gh pr comment`까지
- **스택 중립화** — CI 게이트를 `.ship.json` 설정 파일로 분리해서 React Native·Python·Go에서도 동일 워크플로우 적용
- **비용 가시화** — Wave별/토론별 토큰 사용량을 집계해 PR 설명에 자동으로 붙이기
- **자기 학습 지식 베이스** — red·blue·judge 토론 로그, 실패/성공 패턴, 최종 수정 diff를 장기 저장소에 쌓아 다음 번 architect가 계획 시 맥락으로 참고

---

## 🔗 참고 자료

- [Claude Code 공식 문서](https://docs.claude.com/en/docs/claude-code/overview)
- [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [tmux Wiki](https://github.com/tmux/tmux/wiki)

---

_2026-04-24_
