---
title: "Vite 모드별 env 파일과 VITE_ 접두사"
type: "concept"
stage: "seedling"
summary: "Vite는 --mode 값에 따라 .env.[mode] 파일을 읽고, VITE_ 접두사 변수만 클라이언트 코드에 노출한다. 이 값은 빌드 시점에 번들에 박히므로 비밀값을 넣으면 안 된다."
publish: false
tags: ["vite", "env", "build"]
related: []
created: "2026-11-13"
updated: "2026-11-13"
source: "llm-capture"
---

## 한 줄 정의
Vite는 `--mode`로 지정한 이름에 해당하는 `.env.[mode]` 파일을 읽어 환경변수를 주입한다. 클라이언트 코드에서는 `VITE_`로 시작하는 변수만 `import.meta.env`로 접근할 수 있다.

## 핵심
- `vite build --mode dev`는 `.env.dev`를, `--mode prod`는 `.env.prod`를 읽는다. 파일 이름의 모드와 빌드 명령의 모드가 맞아야 한다.
- `VITE_` 접두사가 없는 변수는 클라이언트 번들에 들어가지 않는다.
- `VITE_` 변수 값은 빌드 시점에 번들에 그대로 치환된다. 따라서 API 키나 토큰 같은 비밀값을 넣으면 누구나 번들에서 읽을 수 있다.
- 스테이지 구분을 env 값으로 따로 두면(예: `VITE_STAGE`) 파일 이름과 값이 어긋날 수 있다. 이 불일치는 빌드 단계에서 검사하는 편이 안전하다.

## 예시
```
# .env.dev
VITE_STAGE=dev
VITE_API_BASE_URL=https://dev.example.com
```
`vite build --mode dev`를 실행하면 이 파일이 읽히고 `import.meta.env.VITE_STAGE`는 `"dev"`가 된다.
