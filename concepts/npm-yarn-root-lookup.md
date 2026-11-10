---
title: "npm·yarn의 프로젝트 루트 탐색 (pnpm과 비교)"
type: "concept"
stage: "seedling"
category: "DevTools"
summary: "npm과 yarn classic도 현재 폴더에서 위로 올라가며 루트를 찾는다. 단 npm은 package.json뿐 아니라 node_modules 폴더만 있어도 멈추고, 아무것도 없으면 현재 폴더를 루트로 쓴다."
publish: true
tags: ["npm", "yarn", "package-manager"]
related:
  - "pnpm-project-root-lookup"
  - "corepack-package-manager-field"
  - "yarn-vs-pnpm"
created: "2026-11-10"
updated: "2026-11-10"
source: "claude-code"
---

## 한 줄 정의

npm과 yarn classic(v1)도 pnpm처럼 **현재 폴더에서 시작해 상위로 올라가며** 프로젝트 루트를 찾는다. 차이는 "무엇을 보면 멈추는가"와 "못 찾으면 어떻게 하는가"에 있다.

## 핵심

| | 멈추는 조건 | 못 찾으면 | workspace 루트 |
|---|---|---|---|
| npm | `package.json` **또는 `node_modules` 폴더**가 있는 가장 가까운 상위 폴더 | 현재 폴더를 루트로 사용 | 찾은 루트에서 계속 올라가며 `workspaces` 필드가 있는 `package.json`을 찾고, 그 workspaces 목록에 현재 패키지가 들어 있으면 그곳을 루트로 바꿈 |
| yarn classic | `package.json`이 있는 가장 가까운 상위 폴더 | 현재 폴더를 루트로 사용 | 위로 올라가며 `workspaces`가 있는 첫 `package.json`을 찾음. 현재 위치가 그 패턴에 맞으면 루트, 아니면 workspace 아님으로 처리 |
| pnpm | 가장 가까운 `package.json` / `pnpm-workspace.yaml` | — | [[pnpm-project-root-lookup|pnpm 루트 탐색]] 참고 |

- **npm의 함정**: 상위 폴더에 `node_modules` 폴더만 남아 있어도 그곳이 루트가 된다. `package.json`을 지우고 `node_modules`만 남겨 두면 사고가 계속 날 수 있다.
- npm workspace는 루트를 찾으면 **workspace 설정을 자동으로 켠다**. 하위 패키지 폴더에서 `npm install`을 실행해도 실제 설치는 workspace 루트에서 일어난다. 이때 하위 패키지의 `.npmrc`는 무시되고 경고가 뜬다.
- `npm --prefix <dir>`로 루트를 직접 지정하면 탐색을 건너뛴다.
- 탐색이 어디서 멈췄는지 확인: `npm prefix`(npm), `pnpm root`(pnpm의 node_modules 위치).

## 예시

```
~/dev/
├── node_modules/        ← package.json이 없어도 npm은 여기서 멈춤
└── wrapper/
    └── app/package.json
```

- `~/dev/wrapper`에서 `npm install lodash` → `~/dev/`가 루트로 잡혀 `~/dev/node_modules`에 설치된다.
- 같은 위치에서 yarn classic을 실행하면 `node_modules`만 있는 폴더는 지나친다. `package.json`을 찾지 못하면 현재 폴더(`wrapper/`)를 루트로 쓴다.

## 근거

- npm 12.1.0: `@npmcli/config`의 `loadLocalPrefix()` 소스와 config 문서의 `prefix` 항목
- yarn 1.22.22: `lib/cli.js`의 `findProjectRoot()`, `Config.findWorkspaceRoot()` 소스
- yarn berry(v2+)는 확인하지 않음 — [검증 필요] 공식 문서나 berry 소스의 프로젝트 루트 탐색 로직을 확인할 것

## 더 알아볼 것

- yarn berry가 `yarn.lock`·`.yarnrc.yml`로 프로젝트 경계를 정하는 방식
- [[corepack-package-manager-field|어떤 패키지 매니저·버전으로 실행될지 정하는 corepack]]
