---
title: "Vite --mode와 import.meta.env.DEV 분리"
type: "concept"
stage: "seedling"
summary: "vite build --mode dev도 production 빌드라서 import.meta.env.DEV는 false다. 스테이지 구분은 DEV 플래그 대신 커스텀 VITE_ 변수로 해야 한다."
publish: false
tags: ["vite", "build", "env"]
related: []
created: "2026-11-13"
updated: "2026-11-13"
source: "llm-capture"
---

## 한 줄 정의
`vite build --mode <이름>`으로 스테이지를 나눠도 `import.meta.env.DEV`는 항상 `false`이므로, 스테이지 판별은 커스텀 `VITE_` 변수로 한다.

## 핵심
- `vite build`는 `NODE_ENV`가 production이라 `--mode dev`를 줘도 `import.meta.env.DEV`는 `false`다.
- 그래서 개발용 기능(화면 강제 전환 등)을 `DEV`로 막고 있었다면, dev 스테이지 빌드에도 그 기능이 남지 않는다.
- 스테이지는 `.env.<mode>` 파일의 `VITE_STAGE` 같은 변수로 구분하고, 앱 코드는 그 값만 본다.
- 모드 이름을 `development`/`production` 대신 `dev`/`prod`처럼 정하면 `NODE_ENV`와 헷갈리지 않는다.

## 예시
```bash
vite build --mode dev   # .env.dev 로드, VITE_STAGE=dev
vite build --mode prod  # .env.prod 로드, VITE_STAGE=prod
```
