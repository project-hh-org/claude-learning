---
title: "Node 내장 fetch는 HTTPS_PROXY를 기본으로 따르지 않음"
type: "concept"
stage: "seedling"
summary: "curl은 HTTPS_PROXY 환경변수를 따라 프록시로 나가지만, Node 내장 http/fetch는 옵션을 켜지 않으면 무시할 수 있다. 같은 요청이 클라이언트에 따라 다르게 막힐 수 있다."
publish: false
tags: ["node", "proxy", "network"]
related: []
created: "2026-11-15"
updated: "2026-11-15"
source: "aside"
---

## 한 줄 정의
프록시가 강제된 환경에서는 HTTP 클라이언트마다 프록시 설정을 따르는지가 다르며, 이 차이 때문에 같은 URL이 어떤 클라이언트에서는 성공하고 다른 클라이언트에서는 차단될 수 있다.

## 핵심
- curl은 HTTPS_PROXY 환경변수를 따라 프록시를 거친다.
- 대화에서 인용한 Node 문서 기준으로, Node 내장 http/https/fetch는 NODE_USE_ENV_PROXY=1 또는 --use-env-proxy를 줄 때만 환경변수 프록시를 따른다. 지원 버전은 문서 기준으로 22.21 이상, 24 이상이며, 그보다 낮은 버전은 undici의 EnvHttpProxyAgent를 전역 dispatcher로 설정하는 방식을 쓴다.
- 프록시를 타지 않은 직접 연결이 샌드박스 정책에 막히면, 정책 403처럼 보일 수 있다.
- 진단법: 같은 URL을 curl과 실제 코드로 각각 호출해 결과가 갈리면 HTTP 클라이언트 경로 문제를 먼저 의심한다.

## 예시
```bash
NODE_USE_ENV_PROXY=1 node script.mjs
```
또는 스크립트 맨 위에서 `setGlobalDispatcher(new EnvHttpProxyAgent())`를 호출한다.
