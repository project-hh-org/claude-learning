---
title: "thinking 자동 캡처 파이프라인"
date: "2026-05-07"
kind: "buildable"
scope: "current-project"
source: "claude-code"
source_session_project: "claude-learning"
stage: "seedling"
tags: ["ideation", "automation"]
---

## 발상

Claude의 thinking 과정에서 떠오르는 곁가지 발상이 휘발되는 문제. Claude Code는 JSONL에 thinking이 자동 저장되지만 표면에 드러나지 않고, Desktop은 아예 사용자가 접근 불가.

## 적용 위치

이 레포(claude-learning)에 다음 구성을 두어 양쪽 환경 모두에서 자동 캡처되게 한다:

- `configs/skills/capture-idea/` 스킬 — thinking에서 ideation 패턴 발견 즉시 발동
- `configs/rules/capture-ideas.md` 룰 — 스킬 발동을 강제하는 글로벌 지침
- `configs/hooks/idea-safety-net.sh` Stop hook — JSONL 후처리로 누락분 보강 (Code 한정)
- `scripts/setup-claude-desktop.sh` — Desktop에 공식 filesystem MCP 1회 등록

결과물은 `ideas/`(현재 프로젝트 메모) 또는 `seeds/`(별개 프로젝트 씨앗)에 마크다운으로 누적되며, `/ideas`와 `/seeds` 페이지에서 열람.
