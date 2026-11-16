---
title: "CDN 경로 분기로 API를 같은 출처에 두는 패턴"
type: "concept"
stage: "seedling"
summary: "정적 파일을 제공하는 CDN에 API용 원본을 추가하고 경로 규칙으로 전달하면, 브라우저는 한 도메인만 호출해 CORS와 cross-site 쿠키 문제를 피할 수 있다."
publish: false
tags: ["cdn", "cors", "architecture"]
related: []
created: "2026-11-13"
updated: "2026-11-13"
source: "llm-capture"
---

## 한 줄 정의
CDN 배포판의 경로별 동작(behavior)으로 `/api/*` 요청을 API 원본에 넘기면, 프론트와 API가 같은 출처처럼 동작한다.

## 핵심
- 브라우저는 화면과 API를 같은 도메인으로만 요청한다. 그래서 CORS 허용 설정이 필요 없다.
- 같은 출처이므로 쿠키도 same-site로 취급되어 SameSite 제약을 받지 않는다.
- API 경로 behavior는 캐시를 끄고, 인증 헤더, 쿠키, 쿼리 문자열, 필요한 HTTP 메서드를 원본으로 전달하도록 설정해야 한다.
- 원본으로 넘어갈 때 Host 헤더가 바뀌므로, 원본 쪽 라우팅 규칙이 전달된 Host와 경로에 맞아야 한다.
- 직접 호출 방식에 비해 CDN 설정이 늘고, API 응답이 CDN을 한 번 더 거친다.

## 예시
`new-admin.your-app.example/api/admin/*`을 API 원본 `dev-api.your-app.example`으로 전달하면, 로그인 요청은 `new-admin` 도메인 기준 same-origin 요청이 된다.
