---
title: "Vite 밖에서 실행되는 테스트의 import.meta.env 값"
type: "concept"
stage: "seedling"
summary: "Vite 없이 Node로 모듈을 직접 불러오는 테스트 러너는 import.meta.env를 채워주지 않는다. 새 env 키를 추가하면 러너의 define에도 직접 넣어야 한다."
publish: false
tags: ["vite", "testing", "env"]
related: []
created: "2026-11-13"
updated: "2026-11-13"
source: "llm-capture"
---

## 한 줄 정의

Vite 변환 없이 Node에서 소스를 직접 불러오는 테스트는, Vite가 주입하던 `import.meta.env` 값을 러너가 따로 제공해야 한다.

## 핵심

- 러너가 `define`으로 키마다 값을 채워주는 구조라면, 소스에 새 `import.meta.env.KEY`를 추가할 때 러너에도 같은 키를 넣어야 한다.
- 빠지면 해당 키 접근 시점에 `TypeError` 같은 런타임 오류가 난다.
- 테스트 검증 내용(assertion)을 바꾸지 않고 러너가 채우는 값만 고치는 것이 원칙이다.
- 같은 설정을 쓰는 실제 빌드와 테스트 러너의 키 목록이 어긋나지 않는지 확인한다.

## 예시

```
// 소스에 새 키 추가
stage: import.meta.env.VITE_STAGE

// 러너 define 에도 추가 (없으면 테스트가 TypeError로 깨짐)
'import.meta.env.VITE_STAGE': JSON.stringify(undefined)
```
