---
title: "yarn vs pnpm 패키지 매니저 비교"
type: "concept"
stage: "evergreen"
tags: ["npm", "yarn", "pnpm", "node", "package-manager", "monorepo"]
related: []
created: "2026-05-09"
updated: "2026-05-09"
---

## 핵심 차이: node_modules 저장 방식

| | yarn classic | yarn berry (PnP) | pnpm |
|---|---|---|---|
| 구조 | flat hoisting | `.pnp.cjs` (파일 없음) | 격리된 중첩 구조 |
| 유령 의존성 | 있음 | 없음 | 없음 |
| 디스크 | 프로젝트마다 복사 | `.yarn/cache` 공유 | 전역 store + 하드링크 |
| 호환성 | 최고 | 일부 패키지 불호환 | 높음 |

## pnpm의 핵심 메커니즘: content-addressable store

```
~/.pnpm-store/          ← 전역 저장소 (패키지 1개만 보관)
  └── react@18.2.0/

프로젝트A/node_modules/react  →  하드링크 → store
프로젝트B/node_modules/react  →  하드링크 → store  (복사 없음)
```

10개 프로젝트가 같은 패키지를 쓰면 pnpm은 1번만 저장. yarn은 10번 복사.

## 유령 의존성(Phantom Dependency)

`package.json`에 선언하지 않은 패키지를 코드에서 `require`할 수 있는 버그. yarn classic의 flat hoisting이 원인.

```js
// package.json에 lodash가 없어도 동작해버림 (yarn classic)
import _ from 'lodash'; // 다른 패키지의 의존성으로 끌려온 것
```

pnpm은 격리 구조라 이를 차단 → 의존성 선언 강제 → 장기적으로 더 안전.

## 설치 속도 (캐시 있을 때 기준)

**pnpm > yarn berry > yarn classic**

하드링크는 파일 복사 비용이 없기 때문에 pnpm이 빠름.

## 모노레포에서의 차이

pnpm workspace가 특히 유리:
- 패키지 간 로컬 참조를 하드링크로 처리
- `pnpm -r run build` 로 전체 워크스페이스 일괄 실행
- 디스크 절약 효과가 레포 수에 비례해 커짐

## 언제 뭘 쓸까

**pnpm 선택**: 새 프로젝트, 모노레포, 디스크/속도 최적화가 중요할 때

**yarn 유지**: 기존 yarn 프로젝트 유지보수, yarn berry Zero-install(`.yarn/cache` git 커밋) 전략을 쓸 때

## 마이그레이션 (npm/yarn → pnpm)

```bash
rm -rf node_modules package-lock.json yarn.lock
pnpm import   # 기존 lock 파일 읽어서 pnpm-lock.yaml 생성
pnpm install
```
