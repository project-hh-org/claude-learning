---
title: "Plan-and-Execute Loop"
type: "concept"
stage: "seedling"
tags: ["ai-agent", "loop", "planning", "orchestration", "multi-step", "task-decomposition"]
related:
  - "react-loop"
  - "hybrid-reflection-loop"
  - "ai-agent-loop-patterns"
created: "2026-05-20"
updated: "2026-05-20"
---

## 정의

**Planner**가 전체 작업을 단계별 계획으로 분해하고, **Executor**가 각 단계를 순서대로 실행하는 패턴. 계획과 실행을 명시적으로 분리하는 것이 핵심.

```
[Task]
   ↓
[Planner] → 전체 계획 생성
   ↓          ┌─────────────────────────────────┐
   └───────→  │ 1. 검색: "현재 날씨 API 찾기"    │
              │ 2. 코드: "API 호출 코드 작성"    │
              │ 3. 실행: "코드 실행 및 검증"     │
              │ 4. 요약: "결과 정리"             │
              └─────────────────────────────────┘
                           ↓
              [Executor] 단계별 순차 실행
                step 1 → 결과 → step 2 → 결과 → ...
                           ↓
                        [결과]
```

---

## 기원

**Wang et al., 2023** — "Plan-and-Solve Prompting: Improving Zero-Shot Chain-of-Thought Reasoning by Large Language Models"

**LangChain Plan-and-Execute Agent** (2023) — 실용적 프레임워크 구현

기존 ReAct의 문제:
- 매 단계에서 즉흥적 결정 → 전체 그림을 잃기 쉬움
- 복잡한 작업에서 루프가 표류하거나 중간에 방향 전환

---

## ReAct Loop와의 핵심 차이

| 항목 | ReAct Loop | Plan-and-Execute |
|---|---|---|
| 계획 수립 | 없음 (매 단계 즉흥) | **앞에서 전체 계획** |
| 유연성 | 높음 (관찰에 즉각 반응) | 낮음 (계획 변경이 비쌈) |
| 방향 일관성 | 표류 위험 | **일관성 보장** |
| 적합 작업 | 탐색적, 예측 불가 | **구조적, 단계가 명확한** |
| Planner LLM | 없음 | **별도 강력한 LLM** 사용 가능 |

---

## 변형: Re-Planning

실행 중 단계 실패 또는 예상치 못한 상황 발생 시 Planner를 다시 호출해 계획을 갱신:

```
Plan → Execute step 1 → Execute step 2 → FAIL
                                            ↓
                                        [Re-Planner]
                                            ↓
                                    수정된 계획 생성
                                            ↓
                                     Execute step 2' → ...
```

Re-Planning 트리거:
- 단계 실패 (도구 에러, 빈 결과)
- 관찰 결과가 가정과 크게 다를 때
- 남은 단계가 현재 상황과 맞지 않을 때

---

## 강점

1. **전체 일관성**: 단계들이 공통 목표를 향해 설계됨.
2. **병렬화 가능성**: 의존 관계 없는 단계는 병렬 실행 가능.
3. **역할 분리**: Planner(강한 LLM)와 Executor(작은 LLM 또는 도구)를 분리해 비용 최적화.
4. **디버깅 용이**: 계획이 명시적이어서 어느 단계가 실패했는지 추적 쉬움.
5. **복잡 작업 적합**: 연구 보고서 작성, 소프트웨어 개발, 데이터 파이프라인 등.

---

## 한계

- **초기 계획 의존도**: 계획이 잘못되면 모든 실행이 잘못됨.
- **유연성 부족**: 실행 중 새 정보로 방향을 바꾸려면 Re-Planning 비용 발생.
- **Planner 품질**: 좋은 계획을 세우려면 강력한 LLM이 Planner 역할 필요.
- **선형 실행**: 의존 관계가 복잡하면 순서 보장이 어려움.

---

## 실제 적용 사례

```
작업: "2026년 AI 트렌드 보고서 작성 (10페이지)"

Plan:
  1. 주요 AI 트렌드 5개 검색 및 요약
  2. 각 트렌드별 사례 수집 (검색 × 5)
  3. 경쟁 분석: 주요 AI 기업 현황 조사
  4. 섹션 구조 설계 (목차 생성)
  5. 각 섹션 초안 작성 (×10)
  6. 전체 리뷰 및 일관성 검토

Execute:
  step 1 → [검색 도구] → 트렌드 목록
  step 2 → [검색 도구 × 5] → 사례 수집
  ...
```

**LangChain Plan-and-Execute**: 오픈소스 구현체. Planner에 GPT-4, Executor에 GPT-3.5 조합으로 비용 절감.

---

## 실무 구현 워크플로우에 연결

[`/implement` 스킬](.claude/plans/drafts/implement-skill.md)은 Plan-and-Execute 변형:
- **ROUND 0 (Planner)**: 스펙 확정 — Figma + 코드 분석으로 전체 계획 수립
- **ROUND 1 (분석)**: 구현 전 분석 리포트 생성
- **ROUND 2 (Executor)**: 분석 리포트 기반 순차 구현
- **ROUND 3 (Critic)**: QA 실행 → 위반 리포트
- **ROUND 4 (수정)**: 위반만 타겟 수정

이는 Plan-and-Execute + Generator-Critic 하이브리드.

---

## 패턴 선택

```
작업이 여러 단계로 명확히 분해되는가?
├── No  → ReAct (탐색적 실행)
└── Yes → 단계들이 고정적인가 (순서가 변하지 않는가)?
          ├── Yes → Plan-and-Execute
          └── No  → ReAct with Re-planning
```

---

## 관련 개념

- [[react-loop]] — 즉흥적 Think-Act-Observe (계획 없음)
- [[generator-critic-loop]] — Critic이 별도 역할로 분리
- [[hybrid-reflection-loop]] — 코드 + AI 이중 검증
- [[ai-agent-loop-patterns]] — 루프 패턴 전체 비교
