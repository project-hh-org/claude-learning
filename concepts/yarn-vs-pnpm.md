---
title: "yarn vs pnpm 패키지 매니저 비교"
type: "concept"
stage: "evergreen"
category: "DevTools"
summary: "yarn classic·yarn berry·pnpm이 node_modules를 저장하는 방식의 차이. pnpm은 전역 content-addressable store와 하드링크로 디스크를 아끼고 유령 의존성을 막는다."
publish: true
tags: ["npm", "yarn", "pnpm", "node", "package-manager", "monorepo"]
related:
  - "pnpm-project-root-lookup"
  - "npm-yarn-root-lookup"
  - "corepack-package-manager-field"
created: "2026-05-09"
updated: "2026-11-10"
---

## 핵심 차이: node_modules 저장 방식

| | yarn classic | yarn berry (PnP) | pnpm |
|---|---|---|---|
| 구조 | flat hoisting | `.pnp.cjs` (node_modules 없음) | 격리된 중첩 구조 |
| 유령 의존성 | 있음 | 없음 | 없음 |
| 디스크 | 프로젝트마다 복사 | `.yarn/cache`에 zip으로 보관 | 전역 store + 하드링크 |
| 호환성 | 최고 | 일부 패키지 불호환 | 높음 |

## pnpm의 핵심 메커니즘: content-addressable store

store는 패키지 단위가 아니라 **파일 내용의 해시** 단위로 저장한다. 같은 파일은 버전이 달라도 한 번만 저장된다.

```
~/Library/pnpm/store/v10/   ← 전역 store (macOS 기본 위치, `pnpm store path`로 확인)
  ├── files/                ← 파일 내용 해시로 저장
  └── index/

프로젝트A/node_modules/.pnpm/react@18.2.0/...  →  하드링크 → store의 파일
프로젝트B/node_modules/.pnpm/react@18.2.0/...  →  하드링크 → store의 파일  (복사 없음)
```

10개 프로젝트가 같은 패키지를 쓰면 pnpm은 1번만 저장. yarn classic은 10번 복사.

## 유령 의존성(Phantom Dependency)

`package.json`에 선언하지 않은 패키지를 코드에서 `require`할 수 있는 문제. yarn classic의 flat hoisting이 원인.

```js
// package.json에 lodash가 없어도 동작해버림 (yarn classic)
import _ from 'lodash'; // 다른 패키지의 의존성으로 끌려온 것
```

pnpm은 격리 구조라 이를 차단 → 의존성 선언 강제 → 장기적으로 더 안전.

## 설치 속도 (캐시 있을 때 기준)

일반적으로 **pnpm > yarn berry > yarn classic** 순으로 알려져 있다. [검증 필요] 프로젝트 규모와 캐시 상태에 따라 달라진다. 각 매니저의 공식 벤치마크 페이지나 직접 측정한 결과로 확인할 것.

하드링크는 파일 복사 비용이 없기 때문에 pnpm이 빠름.

## 모노레포에서의 차이

pnpm workspace가 특히 유리:
- workspace 안의 패키지끼리는 **심볼릭 링크**로 연결된다(`"dep": "workspace:*"` → `node_modules/dep -> ../../dep`). 외부 패키지는 store에서 하드링크.
- `pnpm -r run build` 로 전체 워크스페이스 일괄 실행
- 디스크 절약 효과가 레포 수에 비례해 커짐

## 언제 뭘 쓸까

**pnpm 선택**: 새 프로젝트, 모노레포, 디스크/속도 최적화가 중요할 때

**yarn 유지**: 기존 yarn 프로젝트 유지보수, yarn berry Zero-install(`.yarn/cache` git 커밋) 전략을 쓸 때

## 마이그레이션 (npm/yarn → pnpm)

`pnpm import`는 기존 lock 파일(`package-lock.json`, `npm-shrinkwrap.json`, `yarn.lock`)을 읽어서 `pnpm-lock.yaml`을 만든다. **lock 파일은 import 뒤에 지운다.**

```bash
pnpm import   # 기존 lock 파일을 읽어서 pnpm-lock.yaml 생성
rm -rf node_modules package-lock.json yarn.lock
pnpm install
```

## 관련 노트

- [[pnpm-project-root-lookup|pnpm이 프로젝트 루트를 찾는 방식]]
- [[npm-yarn-root-lookup|npm·yarn의 루트 탐색 비교]]
- [[corepack-package-manager-field|corepack과 packageManager 필드로 버전 고정]]
