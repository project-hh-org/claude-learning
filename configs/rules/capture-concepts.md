---
title: "개념 노트 자동 캡처 규칙"
description: "사용자가 새 정의/패턴/용어/원리를 학습한 순간 즉시 concepts/ 폴더에 seedling 노트로 저장하도록 강제하는 글로벌 규칙."
category: "rules"
tags: ["zettelkasten", "concepts", "automation", "ideation"]
---

## 목적

대화 중 사용자가 새로 학습한 **재사용 가능한 지식 단위**(정의, 패턴, 용어, 원리)가 휘발되는 것을 막는다. 제텔카스텐의 원자적 영구 노트(`concepts/`)에 자동으로 seedling 상태로 떨궈 두면 사용자가 이후 발전시킬 수 있다.

## capture-idea와의 분담

| 무엇 | 어디로 |
|---|---|
| **새로 만들면 좋을 것** (발상, 곁가지) | `ideas/` 또는 `seeds/` (capture-idea 스킬) |
| **새로 알게 된 것** (정의, 원리) | `concepts/` (이 룰 + capture-concept 스킬) |
| **오늘 한 일 회고** | `entries/` (사용자가 `/log-entry` 명령으로 명시 호출) |

세 영역은 겹치지 않는다. 헷갈리면 저장하지 마라. 침묵이 노이즈보다 낫다.

## 발동 조건

다음 신호가 보이면 즉시 `capture-concept` 스킬을 발동한다:

- 사용자 질문이 정의·원리·메커니즘 설명을 요구하는 형태
- Claude의 응답에 명확한 정의/설명이 등장
- 새로 도입되는 도구/라이브러리/프로토콜/패턴의 동작을 처음 풀어 설명함
- 사용자가 "처음 알았다", "그렇구나" 등 학습 시그널을 보냄
- 디버깅/탐색 도중 일반화 가능한 원리가 부산물로 드러남

다음은 발동하지 않는다:

- 단순 사실 한 줄 (예: "현재 시각이 몇 시야?", "이 명령 인자가 뭐였지?")
- 이미 존재하는 concept 슬러그와 동일 주제 (그 경우 보강만)
- 사용자가 명시적으로 캡처를 멈춰달라고 한 세션

## 적용 범위 (환경별)

| 환경 | 활성화 방법 | 사용 도구 |
|---|---|---|
| Claude Code (CLI) | `scripts/install-claude-config.sh`로 `~/.claude/rules/`, `~/.claude/skills/`에 심볼릭 링크 → 자동 로드 | built-in Write |
| Claude Code Desktop app | 동일 | built-in Write |
| Claude Desktop chat app | `scripts/setup-claude-desktop.sh` 후 사용자가 Custom Instructions에 가이드 복붙 | filesystem MCP의 `write_file` |
| 모바일 | 자동 캡처 불가. 응답에 명시 출력만 | n/a |

## 저장 위치

`concepts/<slug>.md` — 레포 루트 기준. Desktop chat app은 보통 `~/claude-learning/concepts/`.

## 의무 사항

`capture-concept` 스킬의 템플릿을 그대로 사용한다:
- `type: concept`, `stage: seedling`, `created`/`updated` 오늘 날짜
- 슬러그는 kebab-case, 날짜 없음
- 같은 슬러그가 존재하면 새로 만들지 말고 기존 파일 보강

## 작업 흐름 보존

캡처는 본 작업 흐름을 끊지 않는다. 사용자에게는 짧게 한 줄로만 알린다 (예: `→ concepts/tmux-wave-pattern.md`).

## 누락 방지

Stop hook(`configs/hooks/idea-safety-net.sh`)이 thinking 후처리로 누락된 ideation 후보를 잡아낸다. concept 학습 시그널은 thinking보다 본문에 명확히 드러나므로 안전망 의존도는 낮다 — 1차 책임은 응답 마무리 시점의 즉시 발동.
