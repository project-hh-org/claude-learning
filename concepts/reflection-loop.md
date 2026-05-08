---
title: "Reflection Loop"
type: "concept"
stage: "evergreen"
tags: ["ai-agent", "loop", "llm", "self-critique", "reflection"]
related:
  - "ralph-loop"
created: "2026-05-08"
updated: "2026-05-08"
---

## 정의

LLM이 생성한 출력을 다시 스스로 비판(reflect)하고 수정하는 반복 루프 패턴. 단순히 한 번 생성하고 끝내는 대신, "생성 → 반성 → 개선"을 조건 충족까지 반복한다.

## 구조

```
Generate → Reflect → Refine → [Reflect → Refine → ...] → 완료
```

- **Generator**: 초안 또는 개선안을 생성
- **Reflector**: 결과를 평가하고 자연어 피드백 생성 (동일 모델이거나 별도 모델)
- **Memory**: 피드백을 텍스트로 저장해 다음 반복에 전달 (컨텍스트 내 또는 외부 저장소)

## 핵심 특성

- **피드백 형식**: 자연어 비판 ("이 부분은 근거가 약하다", "논리적 비약이 있다")
- **종료 조건**: 주관적 품질 판단 — Reflector가 "충분하다"고 판단하거나 최대 반복 횟수 도달
- **적용 범위**: 텍스트 생성, 코드, 추론, 계획 등 도메인 무관
- **메모리 방식**: 이전 반성 내용을 컨텍스트 창에 누적하거나 외부 메모리에 저장

## 대표 연구

| 논문 | 특징 |
|---|---|
| Reflexion (Shinn et al., 2023) | 실패 경험을 언어 피드백으로 저장 → 다음 시도에 활용. RL 없이 언어 강화만으로 성능 향상 |
| Self-Refine (Madaan et al., 2023) | 동일 모델이 Generator + Reflector 역할. 외부 데이터 없이 자기 개선 |
| Constitutional AI (Anthropic) | 원칙 목록을 기반으로 출력의 해로움을 자기 비판 후 수정 |

## 잘 맞는 상황

- 정답이 주관적이거나 품질이 다차원적인 작업
- 복잡한 추론이 필요해 한 번에 완성이 어려운 작업
- 인간 피드백 없이 반복 개선이 필요한 경우

## 한계

- 종료 조건이 모호하면 루프가 수렴하지 않을 수 있음
- Reflector가 잘못된 방향으로 비판하면 오히려 품질이 저하됨
- 반복마다 컨텍스트가 길어져 비용 증가
