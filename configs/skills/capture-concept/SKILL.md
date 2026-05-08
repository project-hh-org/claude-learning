---
name: capture-concept
description: "Use proactively whenever the user has just learned, asked about, or had Claude explain a definition / pattern / term / technical concept. Saves the concept as a seedling note to concepts/ in the active claude-learning vault. Distinct from capture-idea (which captures sparks/build-worthy ideas) — this captures durable knowledge."
---

# capture-concept

당신은 사용자가 새로운 **개념/정의/패턴/용어/원리**를 학습한 순간을 감지해 즉시 `concepts/` 폴더에 seedling 노트를 떨어뜨린다. 제텔카스텐의 "원자적 개념 노트"에 해당한다.

## 발동 조건 — "사용자가 무엇을 배웠는가?"

다음 패턴이 보이면 즉시 발동:

- 사용자 질문이 정의/설명을 요구: "X가 뭐야?", "Y는 어떻게 동작해?", "Z 패턴이란?"
- Claude가 본문 응답에서 **명확하게 정의/설명**을 제공한 직후
- 사용자가 "아, 이거 처음 알았다", "신기하네"처럼 학습 시그널을 보임
- 새 도구/라이브러리/명령/프로토콜의 동작을 처음 설명하게 됨
- 디버깅/탐색 도중 **재사용 가능한 일반 원리**가 등장 (특정 버그가 아닌, 그 뒤의 메커니즘)

## 발동 조건 — capture-idea와 구분

| 신호 | 어디로 |
|---|---|
| "이거 만들어보면 좋겠다" / "다른 방법도 있네" | `capture-idea` (ideas/ 또는 seeds/) |
| "X가 뭔지 알았다" / "이런 원리구나" / 정의/패턴/용어 | `capture-concept` (concepts/) |
| "오늘 한 일 정리하고 싶다" | `/log-entry` 슬래시 명령 안내 |

명확하지 않으면 보류 (저장 안 함). 노이즈가 침묵보다 나쁘다.

## 작업 흐름

1. 학습 시그널 감지 → 본 응답 흐름은 끊지 말 것
2. 응답 마무리 직전에 이 스킬 발동
3. 아래 템플릿으로 마크다운 작성
4. **Write 도구**(Claude Code) 또는 **filesystem MCP의 `write_file`**(Desktop chat app)로 저장
5. 사용자에게 한 줄로 알림: `→ concepts/<slug>.md (seedling)에 저장`

## 파일명 규칙

`concepts/<kebab-case-slug>.md` — **날짜 없음**. 개념은 영구 노트라 날짜 식별자를 쓰지 않는다.

슬러그 규칙:
- 영문 소문자 + 숫자 + 하이픈만
- 한글 개념이면 의미 살린 짧은 영문으로 의역 (예: "tmux Wave 패턴" → `tmux-wave-pattern`)
- 이미 같은 슬러그가 존재하면 → **새로 만들지 말고** 기존 파일을 Read해 보강 (stage 갱신, 본문 추가). 중복 생성 금지

## 템플릿

```markdown
---
title: "<개념 이름 (사람이 부르는 자연어 그대로)>"
type: "concept"
stage: "seedling"
tags: ["<관련 태그 1~3개>"]
related:
  - "<연관된 entry slug 또는 다른 concept slug, 0~3개>"
created: "<오늘 날짜 YYYY-MM-DD>"
updated: "<오늘 날짜 YYYY-MM-DD>"
source: "claude-code" | "claude-desktop"
---

## 한 줄 정의

<이 개념이 무엇인지 한 문장.>

## 핵심

<왜 중요한지 / 어떻게 동작하는지 / 언제 쓰는지 — 간결한 1~3문단. 사실 위주, 의견 배제.>

## 예시 (선택)

<코드 / 명령 / 실제 사용 사례 1~2개. 없으면 생략.>

## 더 알아볼 것 (선택)

<- 이 개념을 더 깊이 이해하려면 무엇을 추가 학습해야 하는지>
```

## 작성 시 주의

- **공개 저장소 규칙 준수**: 회사명/내부 식별자/자격증명/내부 도메인 일반화
- **사실 위주**: 사용자의 개인적 어조나 회고는 entries/ 영역. concepts는 사실 정보만
- **stage는 항상 seedling**: 사용자가 발전시키면 직접 budding/evergreen으로 올림. 자동으로 올리지 마라
- **너무 많이 쪼개지 마라**: "X가 뭐야"에 대한 답변이 짧은 사실 하나라면, 굳이 새 concept을 만들지 않는다. 재사용 가치가 있을 때만 저장
- **본문 응답 흐름 보존**: 사용자에게는 짧게 알리고 원래 작업 계속

## 사용자가 캡처를 끄고 싶다고 할 때

"이 세션에서는 capture-concept 발동하지 마"라고 명시하면 그 세션 동안 발동하지 않는다.
