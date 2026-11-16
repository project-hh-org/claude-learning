---
title: "콘텐츠 준비와 외부 게시 요청 분리"
date: "2026-11-15"
kind: "spark"
scope: "current-project"
stage: "seedling"
summary: "AI 실행 환경은 글과 이미지 URL만 준비하고, 실제 게시 POST는 외부 엔드포인트(예: Cloudflare Worker)가 보내는 구조로 나누는 발상이다."
tags: ["architecture", "relay", "automation"]
source: "aside"
---

## 발상
AI 실행 환경에서 외부 API로 나가는 POST만 막히는 경우가 있다. 이때 AI는 게시할 글, 이미지 공개 URL, 메타데이터까지만 만들고, 실제 게시 요청은 외부에 둔 작은 엔드포인트가 대신 보내게 한다. AI와 게시 로직을 분리하면 실행 환경의 네트워크 정책에 덜 묶인다.

## 적용 위치
- Cloudflare Worker에 게시용 엔드포인트를 두고, AI는 그 주소로 글 데이터만 POST한다. Worker가 SNS API 키를 가지고 실제 게시를 호출한다.
- Worker 주소 자체도 실행 환경의 프록시에 막히는지 먼저 확인해야 한다.
- 키는 Worker 쪽 환경 변수로만 보관하고, AI 실행 환경에는 넣지 않는다.
- 대안으로 GitHub Actions에서 게시하는 방식도 같은 분리 구조로 볼 수 있다.
