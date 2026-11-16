---
title: "환경변수 읽기를 한 모듈로 모으기"
type: "concept"
stage: "seedling"
summary: "import.meta.env를 앱 코드 여러 곳에서 직접 읽지 않고, 검사된 값을 내보내는 단일 모듈을 통해서만 읽는다."
publish: false
tags: ["env", "typescript", "pattern"]
related: []
created: "2026-11-13"
updated: "2026-11-13"
source: "llm-capture"
---

## 한 줄 정의
`import.meta.env`를 한 파일에서만 읽고, 타입과 검사를 거친 객체를 나머지 코드가 import해서 쓰는 패턴이다.

## 핵심
- 값이 없거나 잘못됐을 때의 처리를 한 곳에 모은다.
- 스테이지 같은 값은 `'local' | 'dev' | 'prod'`처럼 좁은 유니언 타입으로 두면 오타를 컴파일 단계에서 잡는다.
- 빌드 설정(vite.config)과 앱 코드가 같은 검사 함수를 공유하면 두 곳의 규칙이 어긋나지 않는다.
- 런타임 검사 라이브러리(예: Zod)를 쓸지는 의존성 추가 여부를 먼저 정한 뒤 고른다.

## 예시
```ts
export const env = { stage: parseStage(import.meta.env.VITE_STAGE), apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '' };
```
