---
title: "prod 번들에 dev 전용 마커가 없는지 자동 검사"
date: "2026-11-16"
kind: "spark"
scope: "current-project"
stage: "seedling"
summary: "dev 전용 표시 요소를 마커 문자열로 정해 두고, prod 빌드 산출물에 그 문자열이 없는지 스크립트로 검사하는 발상이다."
tags: ["ci", "build", "bundle"]
source: "llm-capture"
---

## 발상
개발용 표시(예: 스테이지 배지, 테스트용 디버그 문구)에 고유한 마커 문자열을 붙여 두고, prod 빌드 번들을 검색해 마커가 0개인지 확인한다. 실수로 dev 전용 코드가 prod에 섞이면 빌드 단계에서 바로 잡을 수 있다.

## 적용 위치
- 빌드 후 실행하는 검사 스크립트나 CI의 prod 빌드 단계.
- 스테이지 판정을 `import.meta.env.MODE` 한 곳으로 모은 프로젝트라면 마커는 배지 컴포넌트 등 분기 지점 근처에 두면 된다.
