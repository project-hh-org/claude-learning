---
title: "AI 에이전트 루프 패턴 전체 비교"
type: "concept"
stage: "evergreen"
tags: ["ai-agent", "loop", "reflection", "ralph-loop", "hybrid", "react", "mcts", "debate", "moa", "design-pattern"]
related:
  - "reflection-loop"
  - "ralph-loop"
  - "hybrid-reflection-loop"
  - "generator-critic-loop"
  - "react-loop"
  - "tree-of-thoughts-loop"
  - "plan-and-execute-loop"
  - "debate-loop"
  - "self-play-loop"
  - "mcts-loop"
  - "mixture-of-agents-loop"
created: "2026-05-17"
updated: "2026-05-20"
---

## 개요

AI 에이전트가 한 번에 완벽한 결과를 내기 어렵기 때문에 "생성 → 검증 → 재시도" 루프를 설계하는 것이 핵심 과제다. 패턴은 피드백 주체, 탐색 구조, 에이전트 수에 따라 다양하게 분류된다.

| 패턴 | 핵심 아이디어 | 피드백 주체 | 구조 |
|---|---|---|---|
| [[reflection-loop\|Reflection Loop]] | AI가 스스로 비판하고 개선 | AI (자기 자신) | 선형 |
| [[generator-critic-loop\|Generator-Critic]] | 독립된 Critic이 평가 — 생성 맥락 모름 | 별도 Critic | 선형 (역할 분리) |
| [[ralph-loop\|Ralph Loop]] | 코드 실행 결과로 자동 검증 | 코드 (객관) | 선형 |
| [[hybrid-reflection-loop\|Hybrid Reflection Loop]] | 코드 검증 + AI 의미 검증 이중 레이어 | 코드 + AI | 선형 (이중) |
| [[react-loop\|ReAct Loop]] | 추론 + 행동 + 관찰 인터리빙 | 외부 도구 결과 | 선형 (도구 연동) |
| [[plan-and-execute-loop\|Plan-and-Execute]] | 전체 계획 먼저, 순차 실행 | 단계별 결과 | 선형 (계획 분리) |
| [[tree-of-thoughts-loop\|Tree of Thoughts]] | 다중 경로 트리 탐색 + 백트래킹 | LLM evaluator | 트리 |
| [[mcts-loop\|MCTS for LLMs]] | UCB1 기반 트리 탐색 + rollout | PRM / 코드 실행 | 트리 (확률적) |
| [[debate-loop\|Debate Loop]] | 두 에이전트 논쟁 + Judge 판정 | 경쟁 에이전트 | 선형 (경쟁) |
| [[self-play-loop\|Self-Play Loop]] | 과거 자신과 경쟁하며 훈련 | 이전 버전 모델 | 훈련 루프 |
| [[mixture-of-agents-loop\|Mixture of Agents]] | 다수 모델 병렬 생성 + 합성 | 앙상블 | 병렬 |

---

## 3대 분류 축

### 축 1: 피드백 방향

```
자기 피드백 (Self):
  Reflection Loop — 같은 모델이 비판
  Self-Play Loop — 이전 버전이 Discriminator

외부 피드백 (External):
  Ralph Loop — 코드 실행 결과
  ReAct Loop — 도구 관찰 결과
  Generator-Critic — 독립 Critic 인스턴스

경쟁 피드백 (Adversarial):
  Debate Loop — 반대 에이전트
  Self-Play Loop — 이전 자신과 경쟁

앙상블 합성 (Aggregation):
  Mixture of Agents — 다수 모델 결과 합성
```

### 축 2: 탐색 구조

```
선형 (단일 경로):
  Reflection, Ralph, Hybrid, ReAct, Plan-and-Execute

트리 (다중 경로):
  Tree of Thoughts — BFS/DFS/beam
  MCTS — UCB1 + rollout
```

### 축 3: 에이전트 수

```
단일 에이전트:
  Reflection Loop, Ralph Loop, ReAct Loop

듀얼 에이전트:
  Generator-Critic, Hybrid Reflection, Debate Loop, Self-Play

멀티 에이전트:
  Mixture of Agents, Plan-and-Execute (Planner + N Executors)
```

---

## 패턴별 상세 비교

### 종료 조건과 수렴

| 패턴 | 종료 조건 | 수렴 보장 |
|---|---|---|
| Reflection Loop | AI가 "충분하다" 판단 또는 최대 반복 | 약함 — 주관적 |
| Generator-Critic | Critic PASS | 중간 — Critic 기준에 의존 |
| Ralph Loop | 테스트/타입/린터 모두 PASS | 강함 — 명확한 기준 |
| Hybrid | 코드 PASS + AI PASS | 강함 + 안전 브레이커 |
| ReAct Loop | Finish 액션 또는 최대 단계 | 중간 — Finish 결정 주관적 |
| Plan-and-Execute | 모든 단계 완료 | 강함 (계획이 맞으면) |
| Tree of Thoughts | 평가 기준 충족 또는 최대 확장 | 중간 — evaluator 의존 |
| MCTS | rollout 수렴 또는 시간 제한 | 강함 — UCB1 이론적 보장 |
| Debate Loop | N 라운드 종료 | 중간 — Judge 판단 |
| Self-Play Loop | 분포 수렴 또는 반복 횟수 | 강함 — Nash Equilibrium |
| Mixture of Agents | Aggregator 단일 생성 | 강함 (항상 종료) |

### 비용 구조

```
낮음:
  Reflection Loop — 선형, 같은 모델
  Chain-of-Thought (베이스라인)

중간:
  Ralph Loop — 실행 비용 있지만 컨텍스트 낮음
  ReAct Loop — 도구 호출 × N
  Plan-and-Execute — Planner 1회 + Executor × N

높음:
  Generator-Critic — 2× LLM 호출
  Hybrid — 코드 + AI 이중
  Debate Loop — 2 에이전트 × N 라운드 + Judge
  Tree of Thoughts — k 분기 × D 깊이 × LLM evaluator

매우 높음:
  MCTS — k × rollout × 반복
  Mixture of Agents — k 모델 × N 레이어
  Self-Play — 반복 fine-tuning
```

---

## 선택 가이드 (전체)

```
작업 유형은?
│
├── 추론/생성 (단일 출력 개선)
│   ├── 외부 도구가 필요한가?
│   │   ├── No  → Reflection Loop
│   │   └── Yes → ReAct Loop
│   │
│   └── 객관적 검증 기준이 있는가?
│       ├── No  → Reflection Loop
│       └── Yes → Ralph Loop / Hybrid
│
├── 복잡한 계획/다단계
│   ├── 탐색이 중요한가?
│   │   ├── No  → Plan-and-Execute
│   │   ├── 가벼운 트리 탐색 → Tree of Thoughts
│   │   └── 최적 경로 보장 필요 → MCTS
│   └── 독립적 역할 분리 필요 → Generator-Critic
│
├── 검증/품질 강화
│   ├── 자기 검증 → Reflection Loop
│   ├── 독립 Critic → Generator-Critic
│   ├── 반론으로 오류 발견 → Debate Loop
│   └── 다양한 관점 통합 → Mixture of Agents
│
└── 모델 훈련 (추론 아님)
    ├── 인간 레이블 있음 → RLHF / Fine-tuning
    └── 인간 레이블 없음 → Self-Play Loop
```

### 구체적 예시

| 작업 | 권장 패턴 | 이유 |
|---|---|---|
| 블로그 글 다듬기 | Reflection | 주관적 기준 |
| TypeScript 타입 오류 수정 | Ralph | `tsc --noEmit`으로 명확히 검증 |
| 실시간 웹 검색 QA | ReAct | 최신 정보 접근 필요 |
| DB 수정 SQL 자동 생성 | Hybrid | 구문 + 의미 이중 검증 |
| 연구 보고서 작성 | Plan-and-Execute | 다단계, 명확한 구조 |
| 수학 문제 (24-point) | Tree of Thoughts / MCTS | 백트래킹 탐색 필요 |
| AI 생성 답변 팩트체킹 | Debate | 경쟁적 반증으로 오류 검출 |
| 다양한 모델 의견 통합 | Mixture of Agents | 앙상블 합성 |
| 레이블 없이 모델 개선 | Self-Play | 자동화된 훈련 루프 |

---

## 공통 설계 원칙

모든 패턴이 공유하는 핵심 원칙:

1. **무한루프 방지**: 최대 반복 횟수 또는 안전 브레이커 필수
2. **이력 누적**: 이전 시도와 실패 이유를 다음 반복에 전달
3. **명확한 종료 조건**: "언제 멈출지"를 사전에 정의
4. **비용 의식**: 반복마다 비용이 증가한다는 것을 설계에 반영
5. **실패 처리**: 도구 오류, 타임아웃, 무한 루프에 대한 탈출구

---

## 진화 방향

```
Chain-of-Thought (순수 추론)
    ↓ 자기 검증 추가
Reflection Loop
    ↓ 객관적 검증 추가
Ralph Loop
    ↓ 의미 검증 + 역할 분리
Hybrid Reflection Loop / Generator-Critic
    ↓ 외부 도구 연결
ReAct Loop
    ↓ 계획 분리
Plan-and-Execute
    ↓ 다중 경로 탐색
Tree of Thoughts → MCTS
    ↓ 다중 에이전트
Debate / Mixture of Agents
    ↓ 훈련 루프화
Self-Play Loop
    ↓ (다음 단계?)
Multi-Agent Orchestration + Tool Networks
    여러 전문 에이전트가 동적으로 협력·경쟁·합의
```

---

## 관련 연구

| 연구 | 패턴 연결 |
|---|---|
| Reflexion (Shinn et al., NeurIPS 2023) | Reflection Loop — 언어 강화학습 |
| Self-Refine (Madaan et al., NeurIPS 2023) | Reflection Loop — 단일 모델 자기 개선 |
| Constitutional AI (Anthropic, 2022) | Generator-Critic — 원칙이 Critic의 평가 기준 |
| LLM-as-a-Judge (Zheng et al., 2023) | Generator-Critic — 별도 LLM이 Critic |
| CRITIC (Gou et al., 2023) | Generator-Critic — 도구 실행으로 검증하는 Critic |
| GAN (Goodfellow et al., 2014) | Generator-Critic — 원형, Discriminator가 Critic |
| ReAct (Yao et al., ICLR 2023) | ReAct Loop — Reasoning + Acting |
| AlphaCode 2 (DeepMind, 2023) | Ralph Loop / MCTS — 테스트 통과 기반 코드 생성 |
| Plan-and-Solve (Wang et al., 2023) | Plan-and-Execute — Zero-shot CoT 개선 |
| Tree of Thoughts (Yao et al., NeurIPS 2023) | Tree of Thoughts — 트리 탐색 |
| Let's Verify Step by Step (Lightman et al., 2023) | MCTS — Process Reward Model |
| AI Safety via Debate (Irving et al., 2018) | Debate Loop — 경쟁적 반증 |
| SPIN (Chen et al., 2024) | Self-Play Loop — LLM Self-Play Fine-Tuning |
| Mixture-of-Agents (Wang et al., 2024) | Mixture of Agents — 앙상블 합성 |
