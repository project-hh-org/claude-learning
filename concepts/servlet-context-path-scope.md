---
title: "서블릿 context-path가 요청 경로 전체에 미치는 영향"
type: "concept"
stage: "seedling"
summary: "context-path를 설정하면 업무 API뿐 아니라 Swagger, Actuator까지 모든 경로에 prefix가 붙고, 보안 매처와 URI 검사 코드가 서로 다른 경로 기준으로 동작할 수 있다."
publish: false
tags: ["spring", "servlet", "routing"]
related: []
created: "2026-11-13"
updated: "2026-11-13"
source: "llm-capture"
---

## 한 줄 정의
서블릿 컨테이너의 context-path는 애플리케이션 전체 경로의 앞에 붙는 공통 prefix다. 컨트롤러 매핑 하나를 바꾸는 것과 달리 서버 전체 경로가 바뀐다.

## 핵심
- prefix는 컨트롤러만이 아니라 Swagger, Actuator 등 서버에 노출된 모든 엔드포인트에 적용된다. 헬스체크 경로와 문서 경로도 함께 바뀐다.
- 보안 설정의 매처는 context-path를 뺀 경로로 비교하는 경우가 있다. 그래서 prefix를 일괄로 추가하면 인증 규칙이 어긋날 수 있다.
- `getRequestURI()`는 context-path를 포함한 전체 경로를 돌려준다. 요청 URI를 직접 문자열로 비교하는 필터는 prefix를 반영해 고쳐야 한다.
- 쿠키 Path처럼 URI를 기준으로 정한 값도 prefix를 포함해야 브라우저가 쿠키를 보낸다.

## 예시
`server.servlet.context-path=/admin` 을 설정하면 `/api/auth/login` 매핑은 `/admin/api/auth/login`으로 노출된다. 같은 설정이 Actuator 헬스체크 경로도 `/admin/actuator/health`로 바꾼다.
