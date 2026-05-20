---
title: "Mixture of Agents (MoA)"
type: "concept"
stage: "seedling"
tags: ["ai-agent", "loop", "ensemble", "mixture-of-agents", "multi-agent", "aggregation"]
related:
  - "generator-critic-loop"
  - "debate-loop"
  - "ai-agent-loop-patterns"
created: "2026-05-20"
updated: "2026-05-20"
---

## 정의

**다수의 다양한 LLM이 병렬로 답을 생성**하고, 그 결과를 **Aggregator 모델이 합성**해 최종 답을 만드는 패턴. 단일 모델보다 집합 지성이 우월하다는 원리 — 앙상블(Ensemble)의 LLM 버전.

```
[질문]
   ↓
   ├──→ [LLM-A: GPT-4o]     → 응답 A
   ├──→ [LLM-B: Claude 3.5] → 응답 B    (병렬)
   ├──→ [LLM-C: Gemini 1.5] → 응답 C
   └──→ [LLM-D: Llama 3]    → 응답 D
                                 ↓
                         [Aggregator LLM]
                         응답 A, B, C, D 모두 참고
                                 ↓
                           [최종 통합 답]
```

여러 레이어로 구성 가능: 1레이어 출력 → 2레이어 입력 → ... → 최종 Aggregator.

---

## 기원

**Wang et al., 2024 (Together AI)** — "Mixture-of-Agents Enhances Large Language Model Capabilities"

핵심 발견:
> LLM은 다른 모델이 생성한 응답을 보면 자신의 답을 개선하는 능력이 있다 (**Complementary Collaboration**).

GPT-4 단독보다 여러 모델 조합이 AlpacaEval, MT-Bench에서 더 좋은 성능을 보임.

---

## 계층 구조 (Layered MoA)

```
Layer 1 (Proposers — 다양성 최대화):
   LLM-A → 초기 답 A1
   LLM-B → 초기 답 B1
   LLM-C → 초기 답 C1

Layer 2 (Refiners — 집합 지식 활용):
   LLM-A (A1, B1, C1 참고) → 개선 답 A2
   LLM-B (A1, B1, C1 참고) → 개선 답 B2
   LLM-C (A1, B1, C1 참고) → 개선 답 C2

Layer N (Aggregator):
   강한 LLM (모든 이전 답 참고) → 최종 통합 답
```

레이어가 깊어질수록 품질 향상 (비용도 선형 증가).

---

## Debate Loop와의 차이

| 항목 | Debate Loop | Mixture of Agents |
|---|---|---|
| 에이전트 관계 | **경쟁적** (반론/반박) | **협력적** (상호 참고) |
| 상호작용 방식 | 순차 (A→B→A→B) | **병렬** (동시 생성 후 합성) |
| 수렴 메커니즘 | 논리적 반증 | **앙상블 평균화** |
| 다양성 목적 | 오류 발견 | 관점 확장 |
| 최종 판정 | Judge | **Aggregator** |

---

## 강점

1. **상한 향상**: 개별 모델 중 가장 좋은 것보다 더 좋은 결과 가능.
2. **강건성**: 한 모델이 틀려도 다른 모델이 보완 (오류 평균화).
3. **다양성 활용**: 각 모델의 강점과 지식 영역이 달라 보완적.
4. **병렬 효율성**: 레이어 내 LLM 호출이 병렬 → latency 최소화.
5. **유연한 구성**: 레이어 수, 모델 조합, Aggregator 선택 자유.

---

## 비용 구조

```
단일 LLM: 1 호출
MoA (1 레이어, 4 모델): 4 + 1 = 5 호출
MoA (2 레이어, 4 모델): 4 + 4 + 1 = 9 호출
MoA (N 레이어, k 모델): k×N + 1 호출
```

비용이 크지만 레이어 내 병렬이라 **latency는 N×(단일 LLM latency)**에만 의존.

---

## Aggregator 설계 원칙

Aggregator는 단순히 투표가 아니라 **합성(synthesis)** 역할:

```
좋은 Aggregator 프롬프트:
"다음은 여러 전문가의 응답입니다:
[응답 A] ...
[응답 B] ...
[응답 C] ...

각 응답의 강점을 활용해 최고의 통합 답을 작성하세요.
의견이 충돌하면 근거가 가장 강한 쪽을 선택하고 이유를 밝히세요."
```

Aggregator 선택 기준:
- 가장 강한 모델 사용 (GPT-4o, Claude 3.5 Sonnet 등)
- 모든 Proposer 답을 컨텍스트에 포함 → 긴 컨텍스트 처리 능력 필요

---

## 실제 적용 사례

| 시스템 | MoA 방식 |
|---|---|
| **Together AI MoA** | 공개 구현, Qwen/Llama/WizardLM 조합 |
| **GPT-4 Best-of-N** | 여러 샘플 생성 후 Reward Model로 최적 선택 |
| **Mixture of Experts (MoE)** | 모델 내부의 전문가 라우팅 (MoA는 외부 앙상블) |

---

## 패턴 선택

```
여러 모델 또는 관점으로 답을 개선하고 싶은가?
├── 반론으로 오류를 찾아야 함 → Debate Loop
└── 다양한 관점을 종합해야 함 → Mixture of Agents
    ├── 비용 민감 → 단일 모델 Best-of-N
    └── 품질 최우선 → 다층 MoA
```

---

## 관련 개념

- [[generator-critic-loop]] — 독립 Critic이 평가 (MoA의 단순 2-에이전트 버전)
- [[debate-loop]] — 경쟁적 다에이전트 (MoA의 대조)
- [[reflection-loop]] — 단일 모델 자기 개선 (MoA의 단일 에이전트 버전)
- [[ai-agent-loop-patterns]] — 루프 패턴 전체 비교
