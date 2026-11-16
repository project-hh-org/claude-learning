---
title: "localStorage 스위치로 로딩·빈·오류 상태 재현하기"
date: "2026-11-13"
kind: "spark"
scope: "current-project"
stage: "seedling"
summary: "개발·퍼블리싱 모드에서 localStorage 값 하나로 목록을 빈 상태, 오류, 로딩으로 강제해 사용자 행동 없이 상태 화면을 검토한다."
tags: ["dev-tooling", "testing", "local-storage"]
source: "aside"
---

## 발상
목록 화면의 상태(빈 목록, 오류, 로딩)는 데이터 조건을 만들기 어려워 검토가 번거롭다. 개발 환경에서만 읽는 localStorage 키 하나(예: 값이 empty, error, loading 중 하나)를 두면, 공용 목록 컴포넌트가 그 값을 보고 해당 상태를 그린다. 오류 화면에서 다시 시도를 누르면 키를 지워 정상 목록으로 돌아가게 하면 검토 흐름이 자연스럽다.

## 적용 위치
- 목록 공용 프레임을 쓰는 여러 화면에 한 번에 적용되는 공용 훅이나 프레임 컴포넌트.
- 퍼블리싱 모드 같은 개발 전용 분기 안에서만 읽도록 제한해 운영 동작에 영향이 없게 한다.
