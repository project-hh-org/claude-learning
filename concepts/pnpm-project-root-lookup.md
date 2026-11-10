---
title: "pnpm의 프로젝트 루트 탐색 (상위 폴더로 거슬러 올라감)"
type: "concept"
stage: "seedling"
category: "DevTools"
summary: "pnpm은 현재 폴더에서 시작해 상위로 올라가며 가장 가까운 package.json·pnpm-workspace.yaml을 루트로 잡는다. 프로젝트 모음 폴더에 package.json이 하나 섞이면 엉뚱한 곳에 node_modules가 생긴다."
publish: false
tags: ["pnpm", "package-manager", "monorepo"]
related:
  - "yarn-vs-pnpm"
created: "2026-11-10"
updated: "2026-11-10"
source: "claude-code"
---

## 한 줄 정의

pnpm은 명령을 실행한 **현재 폴더부터 시작해 상위로 거슬러 올라가며** 가장 가까운 `package.json`(프로젝트 루트)과 `pnpm-workspace.yaml`(workspace 루트)을 찾고, 찾은 그 위치를 기준으로 동작한다.

## 핵심

- 탐색 방향은 "위에서 아래"가 아니라 **"여기서 위로"**다. 현재 폴더에 `package.json`이 있으면 거기서 멈추고, 없으면 부모, 그 부모 순으로 올라간다.
- 그래서 `package.json`이 없는 래퍼 폴더(저장소를 한 겹 감싼 폴더 등)에서 `pnpm install`을 실행하면, 상위 어딘가에 잘못 놓인 `package.json`을 프로젝트로 인식하고 **그 자리에** `node_modules`·`pnpm-lock.yaml`을 만든다.
- `pnpm-workspace.yaml`도 같은 방식으로 위로 탐색된다. 상위 폴더에 이 파일이 생기면 하위 프로젝트들이 그곳을 workspace 루트로 오인할 수 있다. 한 번 생긴 잔해가 다음 사고를 부르는 구조다.
- pnpm 10부터는 의존성의 build script(postinstall 등)를 기본으로 차단한다. 차단된 패키지가 있으면 `pnpm-workspace.yaml`에 `allowBuilds: <pkg>: set this to true or false` 같은 자리표시를 자동으로 만들 수 있다. 직접 만든 적 없는 workspace 파일이 생겼다면 이 동작을 의심해 볼 것.
- `packageManager` 필드나 corepack 설정에 따라 전역에 깔린 버전이 아닌 다른 pnpm 버전이 실행될 수 있다. 출력의 `using pnpm vX`로 확인한다.

## 예시

```
~/dev/                  ← 실수로 package.json이 들어가 있음
├── package.json
└── wrapper/            ← package.json 없음
    └── app/
        └── package.json   ← 진짜 프로젝트 루트
```

- `~/dev/wrapper`에서 `pnpm install` 실행 → `~/dev/package.json`이 잡힘 → `~/dev/`에 `node_modules`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` 생성
- `~/dev/wrapper/app`에서 실행 → 정상. 출력에 `Scope: all N workspace projects`가 보이면 의도한 workspace가 잡힌 것

**예방**
- 프로젝트들을 모아 두는 폴더에는 `package.json`·`pnpm-workspace.yaml`을 두지 않는다.
- pnpm은 항상 실제 프로젝트 루트(또는 monorepo 루트)에서 실행한다.
- 잘못 생긴 파일은 지우되, 휴지통으로 보내 되돌릴 수 있게 한다 (macOS: `/usr/bin/trash`).

## 더 알아볼 것

- npm·yarn도 같은 방식으로 상위 탐색을 하는지, 멈추는 조건이 어떻게 다른지
- `pnpm -w`, `--dir`, `--filter`가 루트 탐색과 어떻게 상호작용하는지
- corepack과 `packageManager` 필드로 버전을 고정하는 방식
