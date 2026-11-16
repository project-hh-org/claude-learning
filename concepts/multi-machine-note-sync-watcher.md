---
title: "여러 기기에서 쓰는 노트 저장소의 자동 push 흐름"
type: "concept"
stage: "seedling"
summary: "기기마다 워처가 노트를 자동으로 push하고, 원격이 앞서면 rebase 후 다시 올린다. 코드 작업은 사용자가 직접 pull해야 한다."
publish: false
tags: ["git", "동기화", "자동화"]
related: []
created: "2026-11-11"
updated: "2026-11-11"
source: "llm-capture"
---

## 한 줄 정의
여러 기기가 같은 원격 저장소에 노트를 자동으로 올리되, 충돌 위험이 있는 상황에서는 자동 작업을 보류하는 흐름이다.

## 핵심
- 각 기기의 워처가 새 노트를 커밋하고 push한다.
- push가 거부되면(원격이 앞섬) fetch 후 rebase하고 다시 push한다.
- 작업 트리에 커밋되지 않은 변경이 있으면 rebase를 건너뛰고 로그에 경고만 남긴다.
- 워처는 push만 하고 pull은 하지 않는다. 코드 작업을 시작하기 전에는 사용자가 직접 pull한다.
- 처리 기준점은 기기마다 따로 관리해, 같은 대화를 두 기기가 중복 처리하지 않게 한다.

## 예시
기기 A가 먼저 push한다. 기기 B의 push가 거부되면 rebase 후 다시 올린다. 기기 B에 커밋되지 않은 코드 변경이 남아 있으면 rebase를 건너뛰고 경고를 기록한다.
