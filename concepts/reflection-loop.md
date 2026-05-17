---
title: "Reflection Loop"
type: "concept"
stage: "evergreen"
tags: ["ai-agent", "loop", "llm", "self-critique", "reflection", "reflexion", "self-refine"]
related:
  - "ralph-loop"
  - "hybrid-reflection-loop"
  - "ai-agent-loop-patterns"
created: "2026-05-08"
updated: "2026-05-17"
---

## 정의

LLM이 생성한 출력을 **스스로 비판(reflect)하고 수정**하는 반복 루프 패턴.
단순히 한 번 생성하고 끝내는 대신, "생성 → 반성 → 개선"을 조건이 충족될 때까지 반복한다.
외부 데이터나 추가 학습 없이 단일 모델만으로 품질을 높일 수 있다는 것이 핵심 가치.

---

## 기본 구조

```
[초안 생성]
     ↓
[자기 평가 / 비판] ←────────┐
     ↓                      │
[개선안 생성]                │
     ↓                      │
[종료 조건 판단] → 미충족 ──┘
     ↓ 충족
[최종 출력]
```

### 3가지 핵심 역할

| 역할 | 역할명 | 설명 |
|---|---|---|
| 생성기 | Actor / Generator | 초안 또는 개선안을 생성 |
| 평가기 | Evaluator / Reflector | 결과를 평가하고 자연어 피드백을 생성 |
| 메모리 | Memory | 피드백을 다음 반복에 전달 (컨텍스트 or 외부 저장소) |

동일 모델이 세 역할을 모두 수행할 수도 있고(Self-Refine), 별도 모델이 평가를 맡을 수도 있다(Reflexion).

---

## 대표 연구

### 1. Reflexion (Shinn et al., NeurIPS 2023)

> "Verbal Reinforcement Learning" — 언어 피드백을 강화 신호로 사용

- **구조**: Actor(행동 생성) + Evaluator(보상 점수) + Self-Reflection(언어 피드백 생성)
- **메모리**: 실패 경험을 자연어로 저장 → 다음 에피소드의 컨텍스트로 주입
- **핵심 과정**: 작업 정의 → 궤적 생성 → 평가 → 반성 → 다음 궤적 생성
- **성과**: HumanEval 코딩 벤치마크에서 **91% pass@1** (GPT-4 단독 80% 대비)
- **특징**: RL(강화학습) 없이 언어 피드백만으로 성능 향상. `Short-term memory`(현재 궤적) + `Long-term memory`(과거 반성 내용)를 함께 사용

```
에피소드 1: 실패 → "인덱스 경계 조건을 확인하지 않았다" 저장
에피소드 2: 위 반성 내용을 컨텍스트로 받아 재시도 → 성공
```

### 2. Self-Refine (Madaan et al., NeurIPS 2023)

> "동일 모델이 스스로 피드백을 주고 개선" — 추가 학습 없이

- **구조**: 하나의 LLM이 Generator + Feedback Provider + Refiner 역할 동시 수행
- **루프**: `출력 → 피드백 → 개선 → 피드백 → ...` (종료 조건 만족 시 중단)
- **성과**: 7개 다양한 작업(대화 생성, 수학 추론 등)에서 **평균 ~20%p 절대 성능 향상**
- **장점**: 감독용 학습 데이터, RL, 추가 훈련 불필요. 단일 LLM으로 즉시 적용 가능

### 3. Constitutional AI (Anthropic, 2022)

> "원칙 목록 기반 자기 비판" — 안전성과 도움됨을 동시에

- **구조**: 원칙(Constitution) → 출력 → 원칙에 비춰 자기 비판 → 수정
- **혁신**: 해로움에 대한 인간 레이블을 **AI 피드백으로 대체** ("Pareto improvement")
- **원칙 출처**: UN 인권선언, DeepMind Sparrow Principles, 비서구권 관점 등
- **결과**: 모델이 더 유익하면서 동시에 덜 해로워짐 (tradeoff 없이)

---

## Reflexion 상세 메커니즘

```
[Actor]
  현재 상태 + 단기 메모리(궤적) + 장기 메모리(과거 반성) → 행동 생성

[Evaluator]
  생성된 궤적 → 보상 점수 산출 (작업에 따라 rule-based 또는 LLM 기반)

[Self-Reflection Model]
  보상 신호 + 현재 궤적 + 장기 메모리 → 구체적 언어 피드백 생성
  → 장기 메모리에 저장 → 다음 에피소드 Actor에 주입
```

**핵심**: 실패를 "숫자 점수"가 아니라 "언어적 교훈"으로 저장하기 때문에 LLM이 그 의미를 그대로 이해하고 활용할 수 있다.

---

## 실용적 구현 (LangGraph 기준)

```python
# LangGraph에서 Reflection Loop 구조
graph = StateGraph(State)

graph.add_node("generate", generate_draft)   # 초안 생성
graph.add_node("reflect", critique_draft)    # 비판 생성
graph.add_node("revise", revise_draft)       # 개선

graph.add_edge("generate", "reflect")
graph.add_edge("reflect", "revise")
graph.add_conditional_edges(
    "revise",
    should_continue,  # 반복 횟수 or 품질 조건 판단
    {"continue": "reflect", "end": END}
)
```

### 반복 횟수 기준 (2025 실무 기준)

| 작업 유형 | 권장 반복 횟수 | 이유 |
|---|---|---|
| 코드 생성 | 2~3회 | 3회 이후 개선 효과 감소 |
| 장문 글쓰기 | 2~3회 | 수렴 빠름 |
| 분석 / 리서치 | 3~4회 | 더 많은 반복이 도움됨 |
| 수학적 추론 | 2~3회 | 오류 방향 수정이 핵심 |

> 반복마다 비용이 선형 증가하므로 **token budget tracking + 최대 반복 횟수 hard cap** 설정이 필수.

---

## Ralph Loop와의 비교

| 비교 항목 | Reflection Loop | Ralph Loop |
|---|---|---|
| 피드백 형식 | 자연어 비판 | 코드 실행 결과, 테스트 통과 여부 |
| 종료 조건 | 주관적 품질 판단 | 객관적 기준 충족 (테스트 통과 등) |
| 수렴 보장 | 보장 어려움 | 비교적 명확 |
| 적합한 작업 | 에세이, 계획, 주관적 글쓰기 | 코드, 쿼리, 검증 가능한 출력 |
| 오류 위험 | 반성 방향이 잘못되면 품질 저하 | 낮음 (실행 결과가 ground truth) |

→ 둘을 결합한 것이 [[hybrid-reflection-loop|Hybrid Reflection Loop]]

---

## 잘 맞는 상황

- 정답이 주관적이거나 품질이 다차원적인 작업 (에세이, 설명문, 계획)
- 복잡한 추론이 필요해 한 번에 완성이 어려운 작업
- 인간 피드백 없이 반복 개선이 필요한 경우
- 외부 실행 환경 없이 텍스트만으로 검증해야 하는 경우

## 한계

- **종료 조건 모호성**: Reflector가 "충분하다"고 판단하는 기준이 불명확하면 루프가 수렴하지 않음
- **오염된 반성**: Reflector가 잘못된 방향으로 비판하면 오히려 품질 저하
- **비용 증가**: 반복마다 컨텍스트가 길어지고 토큰 비용이 선형 증가
- **할루시네이션 누적**: 잘못된 반성 내용이 메모리에 쌓이면 이후 반복에 악영향
- **검증 불가 작업의 한계**: 실행 결과로 검증할 수 없는 작업은 수렴 품질을 보장하기 어려움
