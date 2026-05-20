---
title: "Generator-Critic 패턴"
type: "concept"
stage: "seedling"
tags: ["ai-agent", "loop", "multi-agent", "llm-as-judge", "gan", "rl", "evaluation"]
related:
  - "reflection-loop"
  - "hybrid-reflection-loop"
  - "ralph-loop"
  - "ai-agent-loop-patterns"
created: "2026-05-20"
updated: "2026-05-20"
---

## 정의

**Generator**가 출력을 생성하고, 생성 과정에 참여하지 않은 **독립적인 Critic**이 평가하는 이중 역할 구조. 핵심은 **독립성(independence)** — Critic은 Generator가 왜 그런 선택을 했는지 모르기 때문에 앵커링 편향 없이 평가할 수 있다.

```
Generator → [출력] → Critic → [판정 + 피드백]
                        ↓ 실패
               Generator (개선) → Critic → ...
                        ↓ 통과
                    최종 출력
```

---

## 기원

### 1. GAN (Goodfellow et al., 2014)

딥러닝에서의 원형. Generator는 가짜 데이터를 생성하고, Discriminator(Critic)는 진짜/가짜를 구별한다. 둘이 경쟁하며 Generator의 품질이 높아진다.

```
Generator: 노이즈 → 가짜 이미지 생성
Critic:    진짜 이미지 분포와 비교 → 점수 반환
           → Generator는 Critic을 속이도록 학습
```

Wasserstein GAN에서는 Discriminator를 명시적으로 "Critic"이라 부른다. 단순 이진 분류 대신 연속적인 점수를 반환하기 때문.

### 2. Actor-Critic in RL

강화학습의 기본 구조.

| 역할 | 역할명 | 학습 목표 |
|---|---|---|
| Generator | Actor (Policy) | 최대 보상 행동 선택 |
| Critic | Value Function | 상태/행동의 가치 추정 |

Actor는 "무엇을 할지" 결정하고, Critic은 "그 선택이 얼마나 좋은지"를 평가한다. Critic의 평가(Advantage)가 Actor 학습의 기준이 된다.

RLHF(Reinforcement Learning from Human Feedback)도 이 구조 — 인간 피드백으로 학습된 Reward Model이 Critic 역할.

---

## Reflection Loop와의 핵심 차이

| 항목 | Reflection Loop | Generator-Critic |
|---|---|---|
| Critic의 정체 | Generator 자신 (self-critique) | 별도 독립 인스턴스 |
| 앵커링 편향 | 있음 — 자신이 만든 것을 긍정 평가하는 경향 | 없음 — 생성 맥락 모름 |
| 평가 기준 | 암묵적 (자연어로 추론) | 명시적 (체크리스트, 루브릭, 규칙) |
| 역할 수 | 1개 (Generator = Critic) | 2개 (분리) |
| 강점 | 단일 모델로 빠른 개선 | 편향 없는 독립 평가 |

> **왜 독립성이 중요한가?**
> Generator는 자신의 결정에 대한 "이유"를 알기 때문에 스스로 평가하면 그 이유를 정당화하는 방향으로 편향된다. 독립 Critic은 결과물만 보기 때문에 같은 편향이 없다.

---

## LLM에서의 적용

### LLM-as-a-Judge (Zheng et al., 2023)

강력한 LLM(GPT-4 등)을 Critic으로 사용해 다른 LLM의 출력을 평가하는 패턴. MT-Bench와 Chatbot Arena에서 사용됐고, 인간 평가와의 일치율이 높다는 것이 검증됨.

```
Generator LLM → [응답]
                    ↓
Critic LLM (GPT-4) → "이 응답은 3점/5점. 이유: 근거가 부족하고..."
```

**주의**: Critic도 LLM이므로 Position Bias(앞에 나온 답변을 선호), Verbosity Bias(긴 답변을 선호)가 존재. 이를 완화하려면 순서를 바꿔 두 번 평가(swap augmentation)하거나 CoT 피드백을 강제한다.

### CRITIC (Gou et al., 2023)

Critic이 **도구(코드 실행, 검색)**를 사용해 생성물을 검증하는 패턴. 순수 LLM 판단보다 factual accuracy가 높다.

```
Generator → 수학 풀이 생성
Critic    → Python으로 직접 계산해서 결과 검증
           → 틀리면 오류 메시지와 함께 재생성 요청
```

### Constitutional AI (Anthropic, 2022)

원칙(Constitution)이 Critic의 평가 기준. Generator가 응답 생성 → Critic이 원칙에 비춰 평가 → Generator가 수정.

이 패턴에서 Critic은 결국 원칙 목록을 받은 같은 모델이라 엄밀히는 Generator-Critic의 경계가 흐리지만, 평가 기준이 명시적으로 외재화됐다는 점에서 Generator-Critic 정신에 가깝다.

---

## Critic의 유형

| Critic 유형 | 구현 방식 | 강점 | 약점 |
|---|---|---|---|
| **Rule-based** | 체크리스트, 정규식 | 일관성, 빠름, 비용 없음 | 유연성 없음, 예외 처리 어려움 |
| **Code-based** | 테스트, 타입 체커, 린터 | 객관적, 재현 가능 | 검증 가능한 작업만 가능 |
| **LLM-as-Judge** | 별도 LLM 인스턴스 | 유연, 언어적 판단 가능 | 비용, 편향 위험 |
| **Human** | 실제 사람 평가 | 가장 신뢰 가능 | 느림, 확장 불가 |
| **Hybrid** | Rule + LLM 조합 | 빠른 1차 필터 + 유연한 2차 판단 | 복잡도 증가 |

---

## 좋은 Critic의 설계 원칙

1. **명시적 평가 기준**: "좋은 출력이 무엇인지"를 사전에 정의 (체크리스트, 루브릭, 테스트)
2. **독립성 유지**: Critic에게 Generator의 의도나 배경을 주지 않는다 — 결과물만 평가
3. **실행 가능한 피드백**: "틀렸다"가 아니라 "왜 틀렸고 무엇을 바꿔야 하는지"를 반환
4. **판정 유형 분리**: PASS / RETRY / ESCALATE 등 다음 행동으로 바로 이어지는 판정 체계
5. **무한루프 방지**: 동일 피드백 반복 시 ESCALATE로 탈출

---

## 실제 적용 사례: 프론트엔드 구현 품질 루프

프론트엔드 기능 구현에 적용한 Generator-Critic 구조.

```
Generator (frontend agent, ROUND 2/4)
  - 분석 리포트 기반 코드 구현
  - tracking, user state, edge case 전부 커버

Critic (QA agent, ROUND 3)
  - figma-qa.md 체크리스트 기반 독립 평가
  - Generator의 구현 의도를 모르는 채로 결과물만 검사
  - 위반 항목 리포트 → Generator에게 전달

종료 조건: 체크리스트 5개 축 모두 위반 0건
```

Critic의 평가 기준이 **외재화된 문서(체크리스트)**라는 점이 핵심 — Critic이 바뀌어도, Generator가 바뀌어도 같은 기준으로 평가되므로 **재현 가능성**이 보장된다.

---

## 패턴 선택 기준

```
평가 기준을 명시적으로 정의할 수 있는가?
├── No  → Reflection Loop (자기 비판이 더 유연)
└── Yes → 평가자가 생성자와 독립돼야 하는가?
          ├── No  → Reflection Loop (동일 모델 OK)
          └── Yes → Generator-Critic
                    ├── 코드 실행으로 검증 가능 → Code-based Critic
                    ├── 언어적/의미적 판단 필요 → LLM-as-Judge Critic
                    └── 체크리스트 기반 → Rule-based Critic
```

---

## 한계

- **Critic도 틀릴 수 있다**: LLM Critic은 Position Bias, Verbosity Bias 등 자체 편향 보유
- **평가 기준 작성 비용**: 명시적 Critic일수록 체크리스트/루브릭 작성에 초기 비용 발생
- **두 모델 비용**: Generator + Critic 각각 LLM 호출이면 반복당 비용 2배
- **기준이 고정되면 창의성 억제**: 체크리스트에 없는 좋은 시도도 실패 처리될 수 있음

---

## 관련 개념

- [[reflection-loop]] — Critic이 Generator 자신인 경우
- [[hybrid-reflection-loop]] — Code-based Critic + LLM Critic 이중 레이어
- [[ralph-loop]] — Critic이 테스트/타입체커인 특수 케이스
- [[ai-agent-loop-patterns]] — 루프 패턴 전체 비교
