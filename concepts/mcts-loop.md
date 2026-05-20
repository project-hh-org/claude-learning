---
title: "MCTS for LLMs (Monte Carlo Tree Search)"
type: "concept"
stage: "seedling"
tags: ["ai-agent", "loop", "mcts", "tree-search", "process-reward-model", "planning"]
related:
  - "tree-of-thoughts-loop"
  - "self-play-loop"
  - "ai-agent-loop-patterns"
created: "2026-05-20"
updated: "2026-05-20"
---

## 정의

**Monte Carlo Tree Search (MCTS)** 를 LLM 추론에 적용한 패턴. 각 추론 단계를 트리 노드로 표현하고, UCB1(Upper Confidence Bound) 기반으로 탐색·활용 균형을 맞추며 최적 추론 경로를 찾는다.

Tree of Thoughts가 LLM evaluator로 사지가지기를 하는 반면, MCTS는 **Monte Carlo rollout + backpropagation** 으로 더 정교하게 트리를 탐색한다.

```
         [루트: 문제]
        /      |      \
      [A]     [B]     [C]    ← Selection (UCB1으로 유망한 노드 선택)
      / \
   [A1] [A2]                 ← Expansion (선택된 노드 확장)
        |
      [A2']                  ← Simulation (rollout으로 가치 추정)
        ↓
   backpropagation           ← 결과를 루트까지 역전파
   (모든 상위 노드 값 갱신)
```

---

## 기원

### 원형: AlphaGo (DeepMind, 2016)
- MCTS + Policy/Value Network 결합으로 바둑 인간 챔피언 최초 격파
- Policy Network: 다음 수 후보 생성 (트리 분기)
- Value Network: 현재 상태의 승리 확률 추정 (평가)
- Monte Carlo rollout: 끝까지 시뮬레이션해 가치 추정

### LLM 적용: Process Reward Model (PRM)
- **Lightman et al., 2023 (OpenAI)** — "Let's Verify Step by Step"
- 최종 답이 아닌 **각 추론 단계(step)를 평가**하는 보상 모델
- MCTS + PRM = 단계별로 가치를 추정하며 최적 추론 경로 탐색

### AlphaCode 2 / AlphaProof (DeepMind, 2023-2024)
- 코드 생성과 수학 증명에 MCTS 적용
- 테스트 통과 여부가 보상 신호 역할

---

## 4단계 사이클

```
[Selection]
현재 트리에서 UCB1 점수가 가장 높은 노드 선택
UCB1 = 평균 가치 + C × √(ln(부모 방문 횟수) / 자신 방문 횟수)
         (활용)                    (탐색)

[Expansion]
선택된 노드에서 LLM으로 k개 다음 추론 단계 생성
→ 트리에 자식 노드 추가

[Simulation (Rollout)]
각 자식에서 끝까지 시뮬레이션 (빠른 정책으로)
또는 PRM으로 현재 단계 가치 직접 추정

[Backpropagation]
시뮬레이션 결과를 루트까지 역전파
→ 경로 상 모든 노드의 방문 횟수 + 가치 업데이트
```

---

## Tree of Thoughts와의 차이

| 항목 | Tree of Thoughts | MCTS for LLMs |
|---|---|---|
| 노드 선택 | LLM evaluator가 유망함 평가 | **UCB1 수식** (탐색/활용 균형) |
| 가치 추정 | LLM vote/score | **Monte Carlo rollout 또는 PRM** |
| 방문 기록 | 없음 | **있음** (방문 횟수 추적) |
| 백트래킹 | 있음 | 있음 |
| 탐색/활용 균형 | 수동 (beam width) | **자동** (UCB1) |
| 이론적 수렴 | 없음 | **있음** (무한 rollout 시 최적해 수렴 보장) |
| 비용 | 높음 | **더 높음** |

---

## Process Reward Model (PRM)

LLM MCTS의 핵심 구성 요소. 최종 답(Outcome Reward)이 아닌 **각 추론 단계**를 평가:

```
문제: "24 = ? (4, 5, 6, 7 사용)"

step 1: "7 - 5 = 2"         → PRM 점수: 0.72 (유망)
step 2: "2 * 4 = 8"         → PRM 점수: 0.81 (더 유망)
step 3: "8 * 3 = 24"        → PRM 점수: 0.95 (거의 완성)
        (하지만 3이 입력에 없음 → 최종 틀림)
```

PRM 없이는 각 단계 가치를 끝까지 rollout해야 알 수 있음 → 비용 폭발.
PRM이 있으면 단계별 빠른 가치 추정 가능.

---

## 강점

1. **수학적 수렴 보장**: UCB1은 최적 탐색/활용 균형의 이론적 보장 있음.
2. **자동 균형**: 탐색(새 경로 시도)과 활용(좋은 경로 심화) 자동 조절.
3. **복잡 추론 강세**: 수학 증명, 코드 생성, 다단계 계획에서 ToT 대비 성능 향상.
4. **방문 이력 활용**: 많이 방문된 좋은 경로는 더 신뢰 → 샘플 효율성.

---

## 한계

- **PRM 학습 비용**: 단계별 보상 모델을 따로 훈련해야 함 → 초기 투자 큼.
- **높은 계산 비용**: Rollout × 반복 × 노드 수 → 실시간 응용 어려움.
- **상태 표현 의존**: 추론 "상태"를 어떻게 정의할지 작업마다 설계 필요.
- **실시간 응용 제한**: 주로 오프라인 추론/훈련에 적합.

---

## 현재 적용 사례

| 시스템 | MCTS 역할 |
|---|---|
| **AlphaCode 2** | 코드 후보 생성 + 테스트 기반 MCTS로 최적 코드 선택 |
| **AlphaProof** | 수학 정리 증명 단계별 MCTS |
| **OpenAI o1 / o3 (추정)** | MCTS 기반 Test-Time Compute 스케일링 |
| **Qwen-QwQ** | Extended thinking with tree search |

---

## 패턴 선택

```
복잡한 다단계 추론이 필요한가?
├── No  → Chain-of-Thought / ReAct
└── Yes → 탐색 공간이 크고 최적 경로 보장이 중요한가?
          ├── No  → Tree of Thoughts (단순, 더 빠름)
          └── Yes → MCTS for LLMs
                    (PRM 있으면 더 효율적)
```

---

## 관련 개념

- [[tree-of-thoughts-loop]] — 단순 트리 탐색 (UCB1/rollout 없음)
- [[self-play-loop]] — AlphaGo 기반 자기 개선 훈련 루프
- [[ralph-loop]] — 테스트/타입체커가 보상 신호 (MCTS의 단순 버전 아날로그)
- [[ai-agent-loop-patterns]] — 루프 패턴 전체 비교
