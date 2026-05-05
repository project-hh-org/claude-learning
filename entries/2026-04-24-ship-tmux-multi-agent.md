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

> 📚 **설치·사용법·tmux 설정 등 실전 가이드는 공식 문서에서 정리해두었다.**
>
> 이 글은 "ship을 **왜** 이렇게 설계했는지", "내부에서 **어떻게** 움직이는지"에 집중한다. 그대로 따라 해보고 싶다면 아래 문서부터 읽는 걸 권한다.
>
> - 🧭 **개요** — [ship-overview](https://project-hh-com.github.io/tmux/ship/ship-overview.html)
> - 🛠 **튜토리얼 (설치 + 사용법)** — [ship-tutorial](https://project-hh-com.github.io/tmux/ship/ship-tutorial.html)
> - 💻 **리포지토리** — [project-hh-com/tmux](https://github.com/project-hh-com/tmux)

---

## 왜 만들었나

개발 과정에서 사람의 개입을 최대한 줄이고 싶었다. AI가 코드를 잘 짜는 건 이제 당연한 얘기인데, 정작 **"AI에게 일을 시키고 결과를 받는 과정"** 자체는 여전히 사람 손이 많이 간다.

- 브랜치를 따고
- 요구사항을 정리해서 에이전트에게 넘기고
- 결과물에 대고 타입체크 / 린트 / 테스트 / 빌드를 돌리고
- 실패하면 로그를 다시 에이전트에게 붙여 넣고
- 커밋, 푸시, PR 생성까지 사람이 하나씩 클릭

결국 AI는 "코드 생성기"로만 쓰이고, 그 앞뒤 흐름은 사람이 매번 수동으로 연결해주는 구조였다. 특히 **에이전트를 여러 개 동시에 돌리고 싶을 때** 터미널을 여러 개 열고 각 터미널에 프롬프트를 붙여 넣는 작업은 "내가 왜 AI의 조수 역할을 하고 있지?" 싶을 정도로 번거로웠다.

그리고 또 하나 — 에이전트가 내놓은 결과를 **사람이 다시 검수하는 시간**이 생각보다 컸다. 중간에 에러가 남아있지는 않은지, 요구사항과 다르게 개발하지는 않았는지 사람이 일일이 확인하는 경우가 많았다. 그래서 사람이 입력하는 건 **"무엇을 만들지" 한 줄뿐**이고, 브랜치 생성부터 PR까지 — **검증 단계까지 에이전트가 스스로 돌리도록** — 전부 한 커맨드로 묶어버렸다. 그게 `ship`이다.

## `ship`이 내부에서 하는 일

`ship "..."` 한 줄을 실행하면 내부적으로 다음 단계가 순차로 돈다.

- 🌿 `feat/{slug}-{timestamp}` 브랜치 생성 (main/master/prd/develop에서만 자동 분기, 그 외엔 현재 브랜치 사용)
- 🤖 **architect 에이전트**가 요청을 분석해 필요한 하위 에이전트 목록을 `agents.txt`로 뽑는다
- 🗣️ 설계 단계에서 **red → blue → judge** 3자 토론으로 계획의 허점을 검증
- ⚡ tmux 창을 쪼개 **Wave A (구현) → Wave B (검증)** 두 단계로 에이전트를 순차 실행
- 🗣️ 구현 후에도 red/blue/judge 토론을 한 번 더 — judge가 `REWORK` 판정하면 Wave를 재실행
- 💾 Wave 완료마다 중간 커밋 + 푸시
- 🔍 CI 게이트 4단계: `tsc --noEmit` → `eslint --max-warnings 0` → `npm test` → `npm run build`
- 🔄 게이트 실패 시 자동 수정 에이전트가 로그를 읽고 수정, 최대 3라운드 재시도
- 📬 `release-manager` 에이전트가 PR 생성 (게이트 실패면 Draft, `Claude Agent` 라벨 부착)

> **Wave A / Wave B**는 이 프로젝트에서 쓰는 자체 용어다. tmux나 Claude의 표준 용어가 아니라 "구현 단계(A)와 검증 단계(B)를 나눈 내부 단위"라는 의미로 쓴다.

## 핵심 아이디어: tmux 창 분할 + 파일 플래그로 동기화

멀티 에이전트를 안정적으로 돌리는 데 가장 큰 걸림돌은 **충돌**과 **동기화**다. 두 에이전트가 같은 파일을 동시에 고치면 서로의 작업을 덮어쓰고, "언제 다음 단계로 넘어갈지"를 판단할 방법도 필요했다.

구현에서 쓴 두 가지 장치:

**1. tmux `split-window`로 창을 쪼개 에이전트마다 독립 창을 준다**

tmux가 이미 붙어있으면 같은 window 안에서 `split-window -h`로 오른쪽에 새 컬럼을 만들고, 같은 Wave의 나머지 에이전트는 그 컬럼 안에서 `split-window -v`로 세로 분할한다. 마지막에 `select-layout main-vertical`로 정리하면 왼쪽에 메인 창, 오른쪽에 Wave별로 세로 배치된 에이전트 창이 떨어진다.

**2. 완료 신호는 파일 플래그(`<agent>.done`)로 주고받는다**

각 에이전트 프롬프트 끝에 `touch ${FLAG_DIR}/<name>.done` 한 줄을 박아둔다. 메인 스크립트는 5초 간격으로 `.done` 파일 개수를 세다가, Wave 안의 전원이 끝나면 다음 단계로 넘어간다.

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

Wave A가 끝나 전원이 `.done`을 남기면 메인 스크립트가 중간 커밋을 찍고, 같은 방식으로 오른쪽에 Wave B 컬럼을 새로 만든 뒤 검증 에이전트들을 띄운다.

## red / blue / judge 토론

에이전트가 만든 결과물을 사람이 다시 읽는 시간을 줄이려고 끼워 넣은 장치. `ship`에서 두 번 돈다.

- **설계 직후**: architect가 쓴 `plan.md`를 대상으로
- **Wave B(검증) 직후**: 구현된 코드나 테스트 로그를 대상으로

한 라운드 안에서 세 에이전트가 차례로 돈다.

| 역할 | 역할 |
|------|------|
| **red** | 허점·위험요소·누락된 엣지케이스만 지적 (해결책 제시 금지) |
| **blue** | red의 지적을 ACCEPT / MITIGATE / REJECT로 판정, ACCEPT·MITIGATE 항목은 실제 파일 수정 |
| **judge** | 라운드 결과를 `CONSENSUS` / `CONTINUE` / `REWORK` 중 하나로 판정 |

`CONSENSUS`면 다음 단계로, `CONTINUE`면 한 라운드 더 (최대 2라운드), `REWORK`면 Wave 에이전트 전체를 처음부터 다시 돌린다.

## 배우면서 깨달은 것들

- **에이전트는 많을수록 좋은 게 아니다.** 작업이 작으면 1명이 훨씬 빠르고 디버깅도 쉽다. architect의 진짜 일은 **최소한의 에이전트**를 고르는 것.
- **Wave 경계 = 체크포인트.** 중간 커밋을 Wave 단위로 남기니까 실패해도 어디서 꼬였는지 바로 보인다.
- **CI 게이트가 없으면 에이전트는 자기 말만 믿는다.** "다 했다"고 말하는 에이전트도 `tsc --noEmit`에서 한 방에 사실이 드러난다.
- **프롬프트에 로그 내용을 임베드하지 말고 파일 경로만 넘긴다.** ship은 에이전트에게 "`${FLAG_DIR}/tsc.log`를 Read 툴로 읽어라"고만 지시한다. 그래야 프롬프트 크기가 커지지 않고 에이전트가 필요한 부분만 골라 읽는다.

## 앞으로 `ship`을 어떻게 더 발전시킬 것인가

`ship`을 설계할 때 가장 신경 쓴 건 **확장성**이다. **커맨드 · Wave · 에이전트를 분리된 층위**로 만들어뒀다 — 새 커맨드를 추가할 때 tmux 분할/CI 게이트/PR 자동화 로직을 다시 짤 필요 없이, **어떤 에이전트를 어떤 Wave에 태울지**만 정의하면 된다.

앞으로 붙여볼 방향들:

- **`fix` 커맨드** — 버그 수정 특화. Wave A에 debugger + test만 태워서 원인 분석 → 수정 → 회귀 테스트 작성까지 가볍게 돌린다.
- **`review` 커맨드** — PR 리뷰 자동화. reviewer + security가 레이어 규칙 · 타입 안전성 · 보안 취약점을 검토하고 `gh pr comment`로 코멘트까지 단다.
- **스택 중립화** — CI 게이트를 `.ship.json` 설정 파일로 분리해서 React Native · Python · Go 프로젝트에서도 동일 워크플로우 적용.
- **비용 가시화** — Wave별/토론별 토큰 사용량을 집계해서 PR 설명에 자동으로 붙이기.
- **실행할수록 똑똑해지는 지식 베이스** — red·blue·judge 토론 로그, 실패/성공 패턴, 최종 수정 diff를 장기 저장소에 쌓아 다음 번 architect가 계획을 짤 때 맥락으로 참고하게 만들기.

---

_2026-04-24_
