---
title: "ReAct Loop (Reasoning + Acting)"
type: "concept"
stage: "seedling"
tags: ["ai-agent", "loop", "react", "tool-use", "grounding", "reasoning"]
related:
  - "reflection-loop"
  - "ralph-loop"
  - "ai-agent-loop-patterns"
created: "2026-05-20"
updated: "2026-05-20"
---

## 정의

**Reasoning**과 **Acting**을 한 턴 안에 번갈아 수행하는 루프. 생각(Thought) → 행동(Action) → 관찰(Observation) 3단계를 반복하며, LLM이 외부 도구를 사용해 추론을 실제 세계에 **접지(ground)**한다.

```
Thought: 질문에 답하려면 최신 주가 데이터가 필요하다.
Action:  search("AAPL stock price 2026")
Observation: AAPL = $197.43 (as of 2026-05-20)

Thought: 검색 결과를 얻었다. 이제 계산할 수 있다.
Action:  calculate("197.43 * 1000")
Observation: 197430

Thought: 계산 완료. 답을 줄 수 있다.
Action:  Finish("1000주 가치는 $197,430")
```

---

## 기원

**Yao et al., 2023 (Google Brain)** — "ReAct: Synergizing Reasoning and Acting in Language Models" (ICLR 2023)

이전 접근의 문제:
- **Chain-of-Thought (Wei et al., 2022)**: 순수 언어 추론 — 환각(hallucination) 발생, 최신 정보 없음
- **Tool-use (WebGPT 등)**: 행동만, 언어 추론과 분리 — 중간 판단 불가

ReAct는 두 가지를 **동일 컨텍스트 스트림에 인터리빙**해 서로 보완.

---

## 구조

```
[Think] → [Act] → [Observe] → [Think] → [Act] → ... → [Finish]
```

| 단계 | 역할 | 형식 |
|---|---|---|
| Thought | 현재 상황 분석 + 다음 행동 계획 | 자연어 추론 |
| Action | 도구 호출 (검색, 코드 실행, DB 쿼리 등) | 함수 호출 |
| Observation | 도구 결과를 컨텍스트에 추가 | 도구 반환값 |

핵심: **Thought가 Action을 결정하고, Observation이 다음 Thought를 결정한다.** 추론과 행동이 서로를 가이드하는 피드백 루프.

---

## 기존 패턴과의 차이

| 항목 | Chain-of-Thought | ReAct |
|---|---|---|
| 외부 정보 | 없음 (학습 데이터만) | 실시간 도구 결과 |
| 환각 위험 | 높음 | 낮음 (관찰로 교정) |
| 추론 가시성 | Thought 있음 | Thought 있음 |
| 종료 조건 | 모델이 답 생성 | Finish 액션 또는 최대 단계 |

| 항목 | Reflection Loop | ReAct |
|---|---|---|
| 피드백 원천 | 자기 비판 (언어) | 외부 도구 결과 (객관) |
| 정보 확장 | 없음 | 실시간 검색/계산/실행 |
| 활용 사례 | 글쓰기, 추론 개선 | QA, 데이터 수집, 코드 실행 |

---

## 강점

1. **환각 억제**: 모든 Fact를 Action → Observation으로 검증. 학습 데이터 의존 최소화.
2. **추론 투명성**: Thought 단계가 디버깅 가능한 중간 추론을 남김.
3. **도구 유연성**: 검색, 코드 실행, 계산기, DB 쿼리 등 어떤 도구도 연결 가능.
4. **복잡 작업 분해**: 단일 LLM 호출로 불가능한 다단계 작업을 자연스럽게 처리.

---

## 한계

- **긴 컨텍스트**: Thought+Action+Observation이 쌓이면 토큰 비용 증가.
- **도구 오류 처리**: Action이 실패하거나 관련 없는 결과를 반환하면 루프가 표류.
- **종료 조건 불명확**: 언제 Finish를 결정할지 모델이 주관적으로 판단.
- **순차 처리**: 각 Action이 이전 Observation에 의존하므로 병렬화 불가.

---

## 실제 구현 예시

**LangChain Agent** / **OpenAI Function Calling** / **Claude tool_use** 모두 ReAct 구조를 기본으로 사용.

```python
# Pseudocode
while not finished:
    thought = llm.think(context)
    action = llm.decide_action(thought)
    
    if action == "Finish":
        return action.answer
    
    observation = tools[action.name](action.input)
    context.append(thought, action, observation)
    
    if len(context) > MAX_STEPS:
        raise MaxStepsExceeded
```

**적용 사례**:
- 검색 QA (HotpotQA, Fever 벤치마크에서 CoT 대비 성능 향상 입증)
- 코드 디버깅 (코드 실행 → 에러 관찰 → 수정)
- 데이터 수집 파이프라인

---

## 패턴 선택 가이드

```
답을 생성하는 데 외부 정보/계산이 필요한가?
├── No  → Chain-of-Thought (순수 추론으로 충분)
└── Yes → 도구 실행 결과가 다음 행동에 영향을 미치는가?
          ├── No  → 단순 Tool-use (단일 호출)
          └── Yes → ReAct Loop
```

---

## 관련 개념

- [[reflection-loop]] — 외부 도구 없이 자기 비판으로 개선
- [[ralph-loop]] — 코드 실행 결과(테스트/타입)가 Observation 역할
- [[plan-and-execute-loop]] — 먼저 전체 계획 수립 후 순차 실행
- [[ai-agent-loop-patterns]] — 루프 패턴 전체 비교
