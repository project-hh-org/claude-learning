---
title: "빌드 시점 env 불일치 차단"
type: "concept"
stage: "seedling"
summary: "빌드 모드와 주입된 스테이지 값이 다르면 vite.config에서 빌드를 실패시켜, .env 누락이나 오타가 엉뚱한 스테이지 배포로 이어지지 않게 한다."
publish: false
tags: ["vite", "build", "guard"]
related: []
created: "2026-11-13"
updated: "2026-11-13"
source: "llm-capture"
---

## 한 줄 정의
`--mode`로 선언한 스테이지와 실제로 로드된 `VITE_STAGE` 값이 다르면 빌드 단계에서 에러를 내서 멈추는 검사다.

## 핵심
- 파일이 빠지거나 값이 틀리면 기본값(예: `local`)으로 조용히 빌드되는 문제를 막는다.
- 검사는 런타임이 아니라 `vite.config`의 빌드 단계에서 한다. 잘못된 번들이 만들어지지 않는다.
- 확인 방법: 정상 경로, 파일 누락, 모드 불일치, 오타 값 네 경우를 각각 빌드해서 종료 코드를 본다.

## 예시
```ts
// vite.config.ts 개념
const mode = process.argv.includes('dev') ? 'dev' : 'prod';
if (env.VITE_STAGE !== mode) throw new Error(`--mode ${mode}인데 VITE_STAGE=${env.VITE_STAGE}`);
```
