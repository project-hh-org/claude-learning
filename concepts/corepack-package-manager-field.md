---
title: "corepack과 packageManager 필드로 패키지 매니저 버전 고정"
type: "concept"
stage: "seedling"
category: "DevTools"
summary: "corepack은 pnpm·yarn 명령을 가로채는 shim이다. 상위로 올라가며 packageManager 필드가 있는 package.json을 찾고, 거기 적힌 버전을 받아서 실행한다. 같은 pnpm 명령이 폴더마다 다른 버전으로 도는 이유다."
publish: false
tags: ["corepack", "pnpm", "package-manager"]
related:
  - "pnpm-project-root-lookup"
  - "npm-yarn-root-lookup"
  - "yarn-vs-pnpm"
created: "2026-11-10"
updated: "2026-11-10"
source: "claude-code"
---

## 한 줄 정의

corepack은 Node.js에 딸려 오는 **패키지 매니저 버전 관리 shim**이다. `pnpm`·`yarn`을 실행하면 corepack이 먼저 받아서, 프로젝트의 `packageManager` 필드에 적힌 버전으로 대신 실행한다.

## 핵심

- `corepack enable`을 하면 PATH에 있는 `pnpm`, `yarn`이 corepack shim으로 바뀐다. `readlink -f $(which pnpm)`의 결과가 `.../corepack/dist/pnpm.js`라면 shim이다.
- 버전을 정하는 기준은 `package.json`의 `packageManager` 필드다. 예: `"pnpm@10.33.0"`. 뒤에 `+sha224.<hash>`를 붙이면 내려받은 파일을 검증한다. 필수는 아니지만 강하게 권장된다.
- **이것도 상위 탐색이다**: corepack은 현재 폴더에서 위로 올라가며 `package.json`을 읽는다. `packageManager` 필드가 **있는** 첫 파일에서 멈춘다. 필드가 없는 `package.json`은 지나치고 계속 올라간다. `node_modules` 안의 경로는 건너뛴다.
- 필드가 아무 데도 없으면 시스템 기본 버전("Last Known Good")을 쓴다.
- `packageManager`가 없으면 `devEngines.packageManager`도 본다. 이때는 정확한 버전을 적어야 한다.
- 받아 둔 버전은 `~/.cache/node/corepack/v1/<pm>/<version>/`에 캐시된다.

**주요 환경 변수**

| 변수 | 효과 |
|---|---|
| `COREPACK_ENABLE_STRICT=0` | 프로젝트에 지정된 매니저와 다른 매니저를 실행해도 에러를 내지 않는다(예: pnpm 프로젝트에서 yarn) |
| `COREPACK_ENABLE_PROJECT_SPEC=0` | `packageManager` 필드를 무시하고 항상 시스템 버전을 쓴다 |
| `COREPACK_DEFAULT_TO_LATEST=0` | 레지스트리에서 최신 버전을 조회하지 않는다 |
| `COREPACK_ENABLE_AUTO_PIN=1` | 필드가 없는 프로젝트에 `packageManager`를 자동으로 써 넣는다 |
| `COREPACK_ENABLE_NETWORK=0` | 네트워크를 쓰지 않는다. 필요한 버전은 미리 캐시에 넣어 둬야 한다 |

## 예시

같은 머신, 같은 `pnpm` 명령인데 실행되는 버전이 달랐다.

```bash
cd ~/dev && pnpm -v                  # 11.x — packageManager 필드 없음 → 시스템 기본
cd ~/dev/wrapper/app && pnpm install # "using pnpm v10.33.0" — package.json의 "packageManager": "pnpm@10.33.0"
```

프로젝트 버전 고정: `corepack use pnpm@10.33.0`을 실행하면 `packageManager` 필드가 갱신된다.

## 근거

- corepack 0.34.6(Node 22.23.1에 포함)의 README와 `dist/lib/corepack.cjs`의 `loadSpec()` 소스

## 더 알아볼 것

- 최신 Node.js 릴리스에서 corepack이 기본 포함되는지 [검증 필요] — Node.js 릴리스 노트에서 corepack 항목 확인
- pnpm 자체의 버전 관리 기능(`manage-package-manager-versions` 설정)과 corepack이 어떻게 겹치는지 [검증 필요] — pnpm 설정 문서 확인
- 루트 탐색 비교: [[pnpm-project-root-lookup]], [[npm-yarn-root-lookup]]
