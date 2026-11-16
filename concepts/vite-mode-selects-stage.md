---
title: "Vite mode로 배포 스테이지 고르기"
type: "concept"
stage: "seedling"
summary: "빌드 스테이지를 환경변수 값 대신 `--mode`로 고르면, Vite가 해당 mode의 `.env.<mode>` 파일을 읽어 스테이지별 설정을 자동으로 나눌 수 있다."
publish: false
tags: ["vite", "build", "env"]
related: []
created: "2026-11-16"
updated: "2026-11-16"
source: "llm-capture"
---

## 한 줄 정의
빌드 명령에 `--mode`를 주면 Vite가 그 이름에 맞는 `.env.<mode>` 파일을 읽으므로, 스테이지(dev/prod)를 별도 `VITE_STAGE` 같은 변수 없이 mode 하나로 정할 수 있다.

## 핵심
- 스테이지를 `VITE_STAGE=...` 변수로 적던 방식에서, 빌드 스크립트의 mode(`build:dev`는 dev, `build:prod`는 prod)로 옮겼다.
- 스테이지마다 다른 값은 `.env.dev`, `.env.prod`에 둔다. 값이 같으면 파일을 만들지 않아도 env 모듈의 기본값으로 같은 결과가 나온다.
- mode를 주지 않으면 스테이지 값이 기본값(이번 대화에서는 `local`)으로 떨어진다. 그래서 운영 배포는 반드시 prod mode 스크립트로 빌드해야 한다.

## 예시
```
pnpm build:dev   # vite build --mode dev  → .env.dev 로드
pnpm build:prod  # vite build --mode prod → .env.prod 로드
```
