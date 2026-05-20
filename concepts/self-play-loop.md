---
title: "Self-Play Loop"
type: "concept"
stage: "seedling"
tags: ["ai-agent", "loop", "self-play", "fine-tuning", "rlhf", "spin", "training"]
related:
  - "generator-critic-loop"
  - "debate-loop"
  - "ai-agent-loop-patterns"
created: "2026-05-20"
updated: "2026-05-20"
---

## 정의

모델이 **과거 버전의 자기 자신**을 상대로 경쟁하거나 피드백을 받으며 반복적으로 개선되는 훈련 루프. 각 반복에서 현재 모델이 새 데이터를 생성하고, 이전 모델이 Critic 역할을 하거나 기준점이 된다.

```
[Model v0 (초기)]
     ↓
[v0가 응답 생성] → [v0를 Critic으로 피드백 생성]
     ↓
[fine-tuning] → [Model v1]
     ↓
[v1가 응답 생성] → [v1을 Critic으로 피드백]
     ↓
[fine-tuning] → [Model v2]
     ↓
     ... (수렴까지 반복)
```

핵심: **인간 레이블 없이** 모델 스스로 학습 신호를 생성.

---

## 기원

### AlphaGo / AlphaZero (DeepMind, 2016-2018)
가장 유명한 구현. 체스/바둑에서 자기 자신을 상대로 무한 대국 → 인간 챔피언 초월.

```
Policy Network (행동 선택)
Value Network (상태 평가)
     ↓
자기 대국 → 결과 → 정책 업데이트 → 더 강한 상대가 됨
```

### SPIN: Self-Play Fine-Tuning (Chen et al., 2024)
LLM에 Self-Play 적용한 핵심 논문.

**핵심 아이디어**: 
- Generator (현재 모델)가 응답 생성
- Discriminator = **이전 반복 모델**이 생성 응답과 실제 인간 데이터를 구별
- Generator는 Discriminator를 속이도록 (= 인간 데이터처럼 생성하도록) 학습

```
목표: p_model(y|x) ≈ p_human(y|x)

반복 t:
  Generator_t → 응답 y_gen 생성
  Discriminator = Generator_{t-1} (이전 버전)
  손실 = Generator_t가 Discriminator를 속이는 정도
  → Generator_{t+1}로 업데이트
```

**이론적 보장**: 수렴하면 Generator 분포가 인간 데이터 분포에 수렴 (Nash Equilibrium).

---

## 왜 효과적인가?

### 인간 레이블 병목 해소
- RLHF: 매 반복마다 인간 피드백 필요 → 느리고 비쌈
- Self-Play: 이전 모델이 Discriminator → 자동화

### 난이도 자동 조절
- 초기: 약한 상대(이전 모델) → 달성 가능한 목표
- 진행: 상대(이전 모델)가 강해짐 → 자동으로 난이도 상승
- Curriculum Learning 효과

### GAN과의 연결
SPIN은 본질적으로 언어 모델에 적용한 GAN:
- GAN Generator ↔ SPIN 현재 모델
- GAN Discriminator ↔ SPIN 이전 모델

---

## Reflection Loop와의 차이

| 항목 | Reflection Loop | Self-Play Loop |
|---|---|---|
| 적용 시점 | 추론/생성 시점 | **훈련 시점** |
| 피드백 주체 | 같은 모델 (자기 비판) | **이전 버전 모델** |
| 결과 | 한 번의 더 나은 출력 | **모델 가중치 업데이트** |
| 인간 레이블 | 불필요 | 불필요 (SPIN 기준) |
| 확장성 | 무한 | 수렴 후 정체 |

---

## 현재 LLM에서의 응용

| 시스템 | Self-Play 방식 |
|---|---|
| **Constitutional AI (Anthropic)** | 모델이 자신의 응답을 원칙으로 평가 후 재작성 (일부 self-play) |
| **RLHF with Self-Reward** | 모델이 스스로 reward 부여해 학습 |
| **Iterative DPO** | 이전 버전 모델 기준으로 선호 쌍 생성 → DPO 학습 |
| **STaR (Self-Taught Reasoner)** | 정답 맞춘 CoT만 선별해 fine-tuning, 반복 |
| **Gemini / Claude 훈련** | 다양한 self-play 변형 적용 (미공개 세부 사항) |

---

## 한계

- **모드 붕괴**: 모델이 다양성 잃고 특정 패턴에 수렴 (GAN과 동일 문제).
- **수렴 한계**: 이전 모델 대비 개선이 인간 데이터 분포 이상으로 가지 않음.
- **평가 지표 해킹**: Discriminator를 속이는 방향으로 최적화 → 진짜 품질 향상과 괴리.
- **훈련 전용**: 추론 시점에는 적용 불가 (훈련 루프).

---

## 패턴 선택

```
인간 레이블 없이 모델을 개선하고 싶은가?
├── 추론/생성 시점 개선 → Reflection Loop / ReAct
└── 훈련 시점 개선 →
    ├── 라벨 있음 → 표준 Fine-tuning / RLHF
    └── 라벨 없음 → Self-Play Loop (SPIN, Iterative DPO 등)
```

---

## 관련 개념

- [[generator-critic-loop]] — Generator + 독립 Critic (Self-Play의 추론 버전 아날로그)
- [[debate-loop]] — 두 에이전트가 경쟁 (Self-Play의 멀티에이전트 버전)
- [[reflection-loop]] — 추론 시점 자기 개선 (Self-Play와 유사하지만 가중치 업데이트 없음)
- [[ai-agent-loop-patterns]] — 루프 패턴 전체 비교
