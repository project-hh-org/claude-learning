---
title: "AI Safety Debate Loop"
type: "concept"
stage: "seedling"
tags: ["ai-agent", "loop", "debate", "adversarial", "multi-agent", "ai-safety"]
related:
  - "generator-critic-loop"
  - "mixture-of-agents-loop"
  - "ai-agent-loop-patterns"
created: "2026-05-20"
updated: "2026-05-20"
---

## 정의

두 AI 에이전트가 **반대 입장**에서 논쟁하고, 제3의 판정자(Judge — 인간 또는 약한 AI)가 토론 내용을 보고 최종 판단하는 패턴. 핵심 가정: **두 강한 AI가 논쟁하면, 약한 판정자도 진실을 식별할 수 있다.**

```
[문제/질문]
     ↓
[Agent A: 주장] → "X가 옳습니다. 왜냐하면..."
     ↓
[Agent B: 반론] → "A의 주장에 오류가 있습니다. Y 이유로..."
     ↓
[Agent A: 재반박] → "B의 반론은 Z를 놓쳤습니다..."
     ↓
     ... (N 라운드)
     ↓
[Judge: 토론 전체를 보고 판정]
     ↓
[최종 답]
```

---

## 기원

**Irving et al., 2018 (OpenAI)** — "AI Safety via Debate"

AI Safety 맥락에서 제안된 패턴. 핵심 문제의식:
> 미래의 초지능 AI가 거짓 정보를 설득력 있게 주장할 때, 인간이 이를 어떻게 검증할 수 있는가?

해결책: 두 AI를 경쟁시키면 하나가 거짓을 주장할 때 **다른 하나가 반증할 인센티브**가 생긴다.

---

## 구조 상세

### 역할

| 역할 | 목표 | 전략 |
|---|---|---|
| **Agent A (Proponent)** | Judge를 설득해 자신의 답이 옳다고 인정받기 | 증거 제시, 논리 구성 |
| **Agent B (Opponent)** | A의 논증 오류를 찾아 Judge를 자신 쪽으로 끌어오기 | 반례, 결함 지적, 대안 제시 |
| **Judge** | 토론 내용만 보고 어느 쪽이 맞는지 판단 | 논거의 품질과 일관성 평가 |

Judge는 의도적으로 **약하게 설정** (인간, 또는 작은 LLM). 이것이 패턴의 핵심: 강한 AI들의 토론이 약한 판정자를 보조.

### 라운드 구조

```
라운드 0: 각 Agent가 초기 입장 제출
라운드 1-N: 번갈아가며 반론 + 재반박
종료: 라운드 한도 도달 또는 Judge 조기 판정 가능
최종: Judge가 전체 토론 트랜스크립트 검토 → 판정
```

---

## Generator-Critic Loop와 차이

| 항목 | Generator-Critic | AI Debate |
|---|---|---|
| 역할 수 | 2개 (Generator + Critic) | 3개 (Proponent + Opponent + Judge) |
| 상호작용 | 단방향 (Generator → Critic) | **양방향** (A ↔ B 논쟁) |
| Critic의 목표 | 중립 평가 | **상대 주장 기각** (경쟁적) |
| Judge 역할 | Critic 자체가 판정 | 별도 약한 판정자 |
| 핵심 아이디어 | 독립성 | **경쟁적 반증 인센티브** |

---

## 강점

1. **거짓 주장 억제**: A가 거짓을 주장하면 B가 반증할 동기 → 거짓 논증 비용 증가.
2. **약한 Judge 활용**: 강한 AI들이 토론하면 인간도 판단 가능 → 확장성.
3. **논증 투명성**: 전체 토론 트랜스크립트로 판단 근거 추적 가능.
4. **다각도 검토**: 동일 주제를 최소 두 가지 관점에서 강제 분석.

---

## 한계

- **담합 위험**: 두 Agent가 같은 모델 기반이면 유사한 편향 공유 → 진짜 반증 못 함.
- **비용**: 라운드마다 2회 LLM 호출 + Judge 호출 → 라운드 × 3 비용.
- **Judge 편향**: Judge도 LLM이면 position bias, verbosity bias 존재.
- **수렴 불보장**: 논쟁이 끝나도 어느 쪽이 맞는지 명확하지 않을 수 있음.
- **주관적 주제**: 객관적 정답 없는 주제는 판정 기준 자체가 문제.

---

## LLM 구현에서의 응용

원래 AI Safety 연구에서 출발했지만 현재 다음 용도로 실용화:

| 응용 | 설명 |
|---|---|
| **팩트 체킹** | 주장 → 반증 찾기 에이전트 → 판정 |
| **논문 피어 리뷰** | 저자 응답 vs 리뷰어 비판 구조 모델링 |
| **코드 리뷰** | PR 작성자 vs 리뷰어 에이전트 |
| **의사결정 지원** | 찬성 에이전트 vs 반대 에이전트 → 경영진 판단 |
| **RLHF 데이터 생성** | 토론 결과로 선호도 데이터 자동 생성 |

---

## 패턴 선택

```
주장의 진위/품질을 검증해야 하는가?
├── 단순 품질 평가 → Generator-Critic
└── 강한 AI의 거짓 주장을 감지해야 함 → Debate
    또는 반대 입장에서 철저한 검토 필요 → Debate
```

---

## 관련 개념

- [[generator-critic-loop]] — 경쟁 없는 독립 Critic (Debate의 단순 버전)
- [[mixture-of-agents-loop]] — 경쟁 아닌 협력으로 답을 합성
- [[ai-agent-loop-patterns]] — 루프 패턴 전체 비교
