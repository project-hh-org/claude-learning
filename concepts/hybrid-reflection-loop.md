---
title: "Hybrid Reflection Loop"
type: "concept"
stage: "evergreen"
tags: ["ai-agent", "loop", "pipeline", "verification", "multi-agent"]
related:
  - "reflection-loop"
  - "ralph-loop"
  - "ai-agent-loop-patterns"
created: "2026-05-12"
updated: "2026-05-08"
---

## 정의

AI 생성 단계 사이에 **코드 기반 검증 단계**를 삽입하고, **안전 브레이커**와 **에스컬레이션** 메커니즘을 갖춘 복합 루프 패턴.

순수 Reflection Loop(AI가 AI를 비판)나 Ralph Loop(코드 검증만)와 달리, 두 가지를 층위별로 결합한다.

## 구조

```
Analyst (AI)
    ↓ 탐지 결과
Generator (AI)
    ↓ 생성물
TestRunner (코드) ──── FAIL → Generator 재시도
    ↓ PASS
Reviewer (AI) ──────── RETRY_GEN → Generator
              ├─────── RETRY_AN  → Analyst → Generator
              ├─────── PASS      → 종료
              └─────── ESCALATE  → 종료 (수동 처리)

안전 브레이커: 동일 피드백 N회 연속 → 강제 ESCALATE
```

## 순수 Reflection Loop와의 차이

| 항목 | Reflection Loop | Hybrid Reflection Loop |
|---|---|---|
| 피드백 주체 | AI (자연어 비판) | AI + **코드** (이중 검증) |
| 검증 방식 | 주관적 판단 | 기계적(코드) + 의미적(AI) 분리 |
| 종료 조건 | AI 판단 "충분하다" | 코드 PASS + AI PASS 모두 필요 |
| 역할 분리 | Generator / Reflector | Analyst / Generator / TestRunner / Reviewer |
| 무한루프 방지 | 최대 반복 횟수 | 동일 피드백 감지 → 강제 ESCALATE |
| 미해결 케이스 | 루프 반복 | ESCALATE → 사람에게 이관 |

## 핵심 설계 원칙

### 1. 역할 엄격 분리
각 에이전트는 한 가지 역할만 수행한다.
- **Analyst**: 탐지/분석 전용. SQL 생성 금지.
- **Generator**: 생성 전용. 탐색 금지.
- **TestRunner**: 코드로 구조 검증. AI 판단 없음.
- **Reviewer**: 의미/도메인 검증 + 판정.

역할 혼재를 허용하면 추적이 불가능해지고 재시도 로직이 복잡해진다.

### 2. AI 단계 앞에 코드 단계
Reviewer(AI) 전에 TestRunner(코드)를 먼저 통과시킨다.

- 기계적으로 잡을 수 있는 오류는 AI 토큰을 쓰기 전에 걸러냄
- TestRunner FAIL → Reviewer를 거치지 않고 바로 Generator 재시도
- 비용 절감 + 빠른 피드백 루프

### 3. 이력 누적 (iteration_log)
매 반복의 결과를 누적 로그에 기록해 다음 단계에 전달한다.

```
iteration_log = [
  { attempt: 1, analyst: ..., generator: ..., test: FAIL, reason: ... },
  { attempt: 2, analyst: ..., generator: ..., test: PASS, reviewer: RETRY_GEN, feedback: ... },
  { attempt: 3, generator: ..., test: PASS, reviewer: PASS }
]
```

각 에이전트가 "이전에 뭘 시도했는데 왜 안 됐는지"를 알 수 있어 같은 실수를 반복하지 않는다.

### 4. 안전 브레이커
Reviewer가 동일한 피드백을 N회 연속으로 내면 강제로 ESCALATE한다.

루프가 수렴하지 않는 상황(AI끼리 의견이 맞지 않거나 구조적으로 해결 불가)을 무한 반복 대신 사람에게 이관하는 탈출구.

## 판정 유형 (Reviewer)

| 판정 | 의미 | 다음 단계 |
|---|---|---|
| `PASS` | 검증 통과 | 종료 |
| `RETRY_GEN` | SQL/생성물만 재작성 | Generator |
| `RETRY_AN` | 분석부터 다시 | Analyst → Generator |
| `ESCALATE` | 구조적 한계, 사람 판단 필요 | 종료 (수동 처리 큐) |

## 잘 맞는 상황

- 생성물의 정확도 기준이 엄격하고 오류 비용이 높은 경우 (예: DB 수정 SQL)
- 기계적 검증(FK, 구문, 단위 테스트)과 의미적 검증(도메인 판단)이 모두 필요한 경우
- 루프를 완전히 자동화하되 미해결 케이스는 사람에게 넘겨야 하는 경우

## 맞지 않는 상황

- 검증 기준이 주관적이어서 코드 테스트로 PASS/FAIL을 내기 어려운 경우
- 역할이 1~2개로 단순한 경우 (오버엔지니어링)
- 빠른 프로토타이핑 단계 (Reflection Loop로 충분)

## 관련 개념

- [[reflection-loop]] — AI가 AI를 비판하는 기본 루프
- [[ralph-loop]] — 코드 검증 기반 자율 루프
