---
title: "로컬 개발 서버 프록시로 로컬에서도 same-site 쿠키 맞추기"
date: "2026-11-13"
kind: "spark"
scope: "current-project"
stage: "seedling"
summary: "로컬 프론트 개발 서버의 프록시 기능으로 API 요청을 중계하면, 브라우저 입장에서 로컬 프론트와 API가 같은 출처가 되어 쿠키 문제를 피할 수 있다."
tags: ["local-dev", "proxy", "cookie"]
source: "llm-capture"
---

## 발상
로컬 프론트 개발 서버(예: Vite)의 proxy 설정으로 `/api/*` 요청을 dev API 서버로 넘기면, 브라우저는 로컬 프론트 주소로만 요청한다. 그러면 Refresh 쿠키가 cross-site 제약에 걸리지 않고 로컬에서도 로그인과 재발급을 그대로 테스트할 수 있다.

## 적용 위치
- 프론트 프로젝트의 개발 서버 설정 (프록시 규칙 추가)
- 프론트 API base URL을 로컬에서는 상대경로로 두는 빌드/실행 분기
- 로컬 전용 CORS 허용 목록을 따로 관리하지 않아도 되는지 확인하는 용도
