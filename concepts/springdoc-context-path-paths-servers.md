---
title: "springdoc에서 context-path가 반영되는 위치 (paths vs servers)"
type: "concept"
stage: "seedling"
summary: "springdoc은 context-path를 OpenAPI의 paths 키가 아니라 servers URL에 넣는다. 그래서 생성된 타입과 경로 키는 그대로 두고 base URL만 바뀐다."
publish: false
tags: ["springdoc", "openapi", "spring-boot"]
related: []
created: "2026-11-13"
updated: "2026-11-13"
source: "llm-capture"
---

## 한 줄 정의
springdoc이 만드는 OpenAPI 문서에서 context-path는 `paths` 키가 아니라 `servers[].url`에 포함된다.

## 핵심
- `paths` 키는 Spring MVC가 등록한 매핑 패턴(`getActivePatterns`)을 그대로 쓴다. Spring MVC는 context-path를 뺀 경로로 매핑을 매칭하므로(`UrlPathHelper.getPathWithinApplication`), 매핑 패턴에는 처음부터 context-path가 없다.
- `servers[].url`은 실제 요청 URL(`request.getRequestURL()`)에서 `/v3/api-docs` 부분만 잘라 만들기 때문에 context-path가 남는다.
- 예외: `@OpenAPIDefinition(servers = ...)`나 `OpenAPI` Bean에서 servers를 직접 지정하면 그 값이 우선이다. 이때 context-path가 servers에 자동으로 붙지 않는다. `paths`는 그대로다.
- 확인 방법: 소스(main 브랜치) 기준으로 파악한 내용이므로, 실제 사용 버전에서는 context-path 적용 후 `/{context-path}/v3/api-docs`의 `paths`와 `servers`를 열어 보고 확인하는 것이 안전하다.

## 예시
context-path가 `/admin`인 앱에서 컨트롤러 매핑이 `/api/auth/login`이면, 문서의 `paths` 키는 `/api/auth/login`이고 `servers[].url`은 `https://<host>/admin`이 된다. 프론트는 base URL 뒤에 `/admin`을 붙이고 기존 `/api/...` 경로와 생성 타입을 그대로 쓸 수 있다.
