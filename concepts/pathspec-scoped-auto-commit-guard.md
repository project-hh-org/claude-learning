---
title: "자동 커밋 워처의 범위 제한과 push 보류 조건"
type: "concept"
stage: "seedling"
summary: "자동으로 커밋·push하는 스크립트는 지정 경로만 stage하고, 사람이 만든 미push 커밋이 있으면 push를 보류해야 한다. 그렇지 않으면 작업 중인 코드가 노트와 함께 배포된다."
publish: false
tags: ["git", "automation", "safety"]
related: []
created: "2026-11-11"
updated: "2026-11-11"
source: "llm-capture"
---

## 한 줄 정의
자동 커밋·push 워처는 노트 경로만 커밋하고, 브랜치에 아직 push하지 않은 다른 커밋이 있으면 push를 멈춰야 안전하다.

## 핵심
- `git add -A`는 작업 중인 무관한 파일까지 커밋에 섞는다. 경로를 지정해 커밋하면 다른 stage 항목이 있어도 섞이지 않는다.
- `git push`는 현재 브랜치에서 원격에 없는 커밋을 전부 올린다. 자동 push가 코드 커밋을 함께 배포할 수 있으므로, origin보다 앞선 커밋이 있으면 push를 보류한다.
- 원격이 앞서 있을 때는 먼저 push를 시도하고, 거절됐을 때만 pull --rebase를 한다. 작업 트리에 미커밋 변경이 있으면 rebase를 건너뛰고 경고만 남긴다.
- rebase가 충돌하면 자동으로 abort해서 레포가 중간 상태로 남지 않게 한다.
- 여러 실행이 겹치지 않도록 lock을 둔다.
- 검증은 버려도 되는 원격 쌍 테스트 레포를 시나리오마다 새로 만들어 실제 스크립트를 돌리는 방식이 확실하다. 가짜 이벤트로 흉내 낼 때는 그 한계를 함께 기록한다.
