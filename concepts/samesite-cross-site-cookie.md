---
title: "same-site와 same-origin의 차이, 그리고 쿠키 전송"
type: "concept"
stage: "seedling"
summary: "same-site는 eTLD+1 기준이고 same-origin은 scheme·host·port까지 같아야 한다. localhost에서 다른 도메인 API를 부르면 cross-site가 되어 SameSite=Lax 쿠키가 전송되지 않는다."
publish: false
tags: ["cookie", "cors", "security"]
related: []
created: "2026-11-13"
updated: "2026-11-13"
source: "llm-capture"
---

## 한 줄 정의
same-origin은 scheme, host, port가 모두 같은 경우이고, same-site는 등록 도메인(eTLD+1) 기준으로 같은 경우다. 브라우저의 쿠키 전송 규칙은 same-site 여부에 따라 달라진다.

## 핵심
- 같은 상위 도메인의 서브도메인끼리는 same-site다. 포트나 서브도메인이 달라도 same-site로 본다.
- `localhost`와 실제 운영 도메인은 서로 다른 사이트다. 로컬 프론트에서 외부 API를 부르면 cross-site 요청이 된다.
- `SameSite=Lax` 쿠키는 cross-site 요청에 실리지 않는다. 로그인 후 재발급용 Refresh 쿠키가 로컬에서 안 붙는 원인이 된다.
- `SameSite=None`을 쓰려면 `Secure`가 함께 필요하다.
- cross-site에서 쿠키를 보내려면 프론트에서 `credentials: 'include'`를 설정하고, 서버는 정확한 Origin을 허용해야 한다.

## 예시
프론트 `http://localhost:3000`이 `https://dev-api.your-app.example`에 `SameSite=Lax` 쿠키를 기대하며 요청하면, 쿠키가 전송되지 않아 재발급이 실패한다.
