---
title: "Tree of Thoughts (ToT)"
type: "concept"
stage: "seedling"
tags: ["ai-agent", "loop", "tree-search", "planning", "backtracking", "beam-search"]
related:
  - "react-loop"
  - "mcts-loop"
  - "reflection-loop"
  - "ai-agent-loop-patterns"
created: "2026-05-20"
updated: "2026-05-20"
---

## 정의

추론을 **선형 체인이 아닌 트리**로 펼치는 패턴. 각 단계에서 여러 "사고 후보(Thought)"를 동시에 생성하고 LLM이 각각을 평가해 유망한 경로만 탐색 계속 → 막히면 **백트래킹**해 다른 경로 시도.

```
                    [문제]
                   /   |   \
               [T1]  [T2]  [T3]   ← 후보 사고 생성
              ✓ promising  ✗ dead end
              /   \
           [T1a] [T1b]             ← 유망한 경로만 확장
           ✓ promising
           /   \
        [T1a1] [T1a2]             ← 계속 확장
                  ↓
               [답]
```

---

## 기원

**Yao et al., 2023** — "Tree of Thoughts: Deliberate Problem Solving with Large Language Models" (NeurIPS 2023)

Chain-of-Thought의 한계:
- 단방향 체인: 한 번 잘못된 방향으로 가면 되돌아올 수 없음
- 단일 경로: 여러 가능성 탐색 불가
- 지역 최적해: 전역적으로 좋은 해를 놓칠 수 있음

ToT는 **고전 탐색 알고리즘(BFS/DFS/beam search)** 을 LLM 추론에 도입.

---

## 구성 요소

| 요소 | 역할 | 구현 방식 |
|---|---|---|
| **Thought Generator** | 현재 상태에서 k개 후보 사고 생성 | sampling 또는 propose prompt |
| **State Evaluator** | 각 사고의 유망함 평가 | LLM vote 또는 value scoring |
| **Search Algorithm** | 탐색 전략 결정 | BFS / DFS / beam search |
| **Backtracking** | 막힌 경로에서 복귀 | 트리 구조 유지 |

### 탐색 전략 비교

| 전략 | 특징 | 적합한 작업 |
|---|---|---|
| **BFS** | 같은 깊이 전체 탐색, 최단 경로 보장 | 단계 수가 적고 폭이 넓은 문제 |
| **DFS** | 빠르게 깊이 들어감, 메모리 효율 | 경로가 길고 백트래킹 비용이 낮은 경우 |
| **Beam Search** | 상위 k개만 유지, 효율적 | 실용적 균형 (대부분의 적용 사례) |

---

## Chain-of-Thought / Reflection Loop와 차이

| 항목 | Chain-of-Thought | Reflection Loop | Tree of Thoughts |
|---|---|---|---|
| 탐색 구조 | 선형 | 선형 + 자기 비판 | **트리** |
| 백트래킹 | 없음 | 없음 | **있음** |
| 병렬 경로 | 없음 | 없음 | **있음** |
| 비용 | 낮음 | 중간 | **높음** |
| 강점 | 빠른 단순 추론 | 품질 개선 | 복잡한 계획/퍼즐 |

---

## 강점

1. **글로벌 탐색**: 여러 경로를 동시에 시도해 지역 최적 함정 회피.
2. **백트래킹**: 막힌 경로에서 정확하게 복귀 — CoT 불가 능력.
3. **명시적 평가**: 각 사고를 LLM이 점수화해 투명한 의사결정.
4. **고난도 작업 적합**: 24-point 게임, 창의적 글쓰기, 수학 증명에서 CoT 대비 큰 성능 향상 입증.

---

## 한계

- **비용 폭발**: 각 단계마다 k개 사고 생성 + k개 평가 LLM 호출 → 반복 횟수에 지수적 증가.
- **평가자 신뢰도**: LLM evaluator도 틀릴 수 있어 잘못된 가지치기 발생.
- **단순 작업 과잉**: 직선적으로 풀 수 있는 문제에 오버엔지니어링.
- **상태 표현**: 추론 상태를 어떻게 표현할지 작업마다 설계 필요.

---

## 실제 적용 판단 기준

```
문제가 선형 추론으로 해결되지 않는가?
├── No  → Chain-of-Thought / ReAct
└── Yes → 중간 상태를 평가하고 되돌아올 필요가 있는가?
          ├── No  → Reflection Loop (선형 자기 개선)
          └── Yes → 탐색 공간이 관리 가능한가?
                    ├── Yes → Tree of Thoughts
                    └── 매우 큼 → MCTS (확률적 탐색 + 가치 추정)
```

---

## 관련 개념

- [[react-loop]] — 선형 추론 + 행동 루프 (ToT보다 단순)
- [[mcts-loop]] — 확률적 트리 탐색 (UCB1 + Rollout, 더 정교)
- [[reflection-loop]] — 선형 자기 비판 (백트래킹 없음)
- [[ai-agent-loop-patterns]] — 루프 패턴 전체 비교
