---
title: "tmux Wave 패턴"
type: "concept"
stage: "evergreen"
tags: ["tmux", "multi-agent", "automation", "parallelism"]
related:
  - "2026-04-24-ship-tmux-multi-agent"
created: "2026-04-24"
updated: "2026-04-24"
---

## 핵심 아이디어

여러 에이전트를 **Wave** 단위로 묶어 병렬 실행하고, 파일 플래그(`.done`)로 동기화하는 패턴. IPC 없이 안정적인 멀티 에이전트 조율이 가능하다.

## 구조

```
Wave A (구현) ──┐
                ├──→ 전원 .done 확인 후 Wave B 시작
Wave B (검증) ──┘
```

tmux `split-window`로 에이전트마다 독립 창을 열고, 완료 신호는 `touch {FLAG_DIR}/{agent}.done`으로 남긴다. 메인 스크립트가 5초 간격으로 `.done` 파일 수를 세다가 Wave 전원 완료 시 다음 단계로 진행.

## 왜 파일 플래그인가

- 복잡한 IPC(소켓, 파이프) 불필요
- 에이전트 프로세스가 죽어도 플래그는 남아 있어 재시작 가능
- `ls {FLAG_DIR}/*.done | wc -l`로 진행 상황을 사람이 실시간으로 볼 수 있음

## 연결

- [[2026-04-24-ship-tmux-multi-agent]] — 이 패턴을 실제로 구현한 `ship` 커맨드
