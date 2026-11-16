---
title: "Vite 환경변수 우선순위와 번들 노출"
type: "concept"
stage: "seedling"
summary: "셸 환경변수는 .env 파일보다 우선하고, VITE_ 접두사 변수는 빌드 결과물에 그대로 들어가므로 비밀값을 넣으면 안 된다."
publish: false
tags: ["vite", "env", "security"]
related: []
created: "2026-11-13"
updated: "2026-11-13"
source: "llm-capture"
---

## 한 줄 정의
Vite는 셸 환경변수를 `.env` 파일보다 우선 적용하며, `VITE_` 접두사 변수는 클라이언트 번들에 값이 그대로 박힌다.

## 핵심
- 우선순위: 셸 환경변수 > `.env.<mode>` > `.env`. 파일을 고치지 않고 한 번만 다른 값으로 빌드할 수 있다.
- `VITE_` 변수는 번들에 문자열로 인라인된다. 누구나 열어볼 수 있으니 키나 토큰은 넣지 않는다.
- 공개돼도 되는 값(스테이지 이름, 공개 API 주소)만 `.env.*`에 두고, 파일은 커밋 대상으로 본다.

## 예시
```bash
VITE_API_BASE_URL=https://example.test pnpm build:dev
```
