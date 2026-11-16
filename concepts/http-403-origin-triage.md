---
title: "403 응답은 프록시 차단인지 원 서버 응답인지 먼저 구분"
type: "concept"
stage: "seedling"
summary: "같은 403이라도 중간 프록시가 막은 것인지 서버가 보낸 응답인지 헤더와 본문으로 나눠 봐야 잘못된 원인 진단을 피할 수 있다."
publish: false
tags: ["http", "debugging", "proxy"]
related: []
created: "2026-11-15"
updated: "2026-11-15"
source: "aside"
---

## 한 줄 정의
상태 코드 403만 보고 원인을 단정하지 않고, 응답이 어느 계층(프록시 또는 원 서버)에서 왔는지 확인한 뒤 원인을 정한다.

## 핵심
- CONNECT 단계에서 거부되면 프록시가 응답한 것이다. 프록시 차단은 x-deny-reason 같은 헤더로 드러날 수 있다.
- CONNECT가 200으로 연결되고 서버 헤더(예: x-fb-*)와 JSON 에러 본문이 오면 원 서버가 보낸 응답이다. 본문의 code, error_subcode로 이유를 본다.
- 본문이 프록시 형식이 아니고 서버 형식의 JSON이면 서버 거부로 본다.
- 에이전트 안내문처럼 "403은 정책 차단이니 재시도하지 말라"는 규칙을 출처 확인 없이 적용하면 서버 거부를 정책 차단으로 잘못 보고할 수 있다.

## 예시
```bash
curl -sv -X POST "$URL" -d ... 2>&1 | grep -iE "< HTTP|x-deny|x-fb|proxy-error|\{\""
```
이 출력에서 CONNECT 줄, 응답 헤더, 본문을 같이 보고 출처를 가린다。
