---
title: "pnpm 실행 위치 지정 플래그: -C/--dir, -w, -r, --filter"
type: "concept"
stage: "seedling"
category: "DevTools"
summary: "pnpm의 루트 자동 탐색을 덮어쓰거나 범위를 좁히는 플래그. -C로 시작 폴더를 바꾸고, -w로 workspace 루트를, -r과 --filter로 대상 패키지를 고른다."
publish: true
tags: ["pnpm", "monorepo", "cli"]
related:
  - "pnpm-project-root-lookup"
  - "npm-yarn-root-lookup"
created: "2026-11-10"
updated: "2026-11-10"
source: "claude-code"
---

## 한 줄 정의

pnpm은 기본적으로 [[pnpm-project-root-lookup|현재 폴더에서 위로 올라가며 루트를 찾는다]]. 이 플래그들은 그 **시작점과 대상 범위를 명시적으로 정한다**.

## 핵심

| 플래그 | 하는 일 | 언제 쓰나 |
|---|---|---|
| `-C <dir>`, `--dir <dir>` | `<dir>`에서 실행한 것처럼 동작한다. 루트 탐색도 `<dir>`에서 시작한다 | `cd` 없이 다른 프로젝트에서 명령을 실행할 때. 래퍼 폴더에서 실수하지 않으려면 `pnpm -C ./app install`처럼 시작점을 못박는다 |
| `-w`, `--workspace-root` | workspace **루트 프로젝트**에 대해 실행한다 | 하위 패키지 폴더에 있으면서 루트 `package.json`에 의존성을 추가하거나 루트 스크립트를 돌릴 때 |
| `-r`, `--recursive` | workspace의 **모든 프로젝트**에 각각 실행한다 | 전 패키지 build/test |
| `--filter <selector>` | selector에 맞는 프로젝트에만 실행한다 | monorepo에서 일부 패키지만 대상으로 할 때 |

**`--filter` selector 요약** (pnpm 도움말 기준)

- `<name>`: 패키지 이름. `"@scope/*"` 같은 패턴도 된다
- `.`: 현재 폴더 아래의 모든 패키지
- `./<dir>`: 지정한 하위 폴더 안의 패키지
- `...<pattern>`: 매칭된 패키지 + 그 패키지에 의존하는 패키지(dependents) 전부
- `...^<pattern>`: dependents만, 매칭된 패키지는 제외
- `"[<since>]"`: 특정 커밋·브랜치 이후 바뀐 패키지(예: `"[origin/main]"`)
- `!<selector>`: 제외. zsh에서는 `\!`로 이스케이프한다
- `--fail-if-no-match`: 매칭되는 패키지가 없으면 exit 1로 실패한다. 오타로 아무것도 안 돌았는데 성공처럼 보이는 걸 막는다

## 예시

```bash
# 어디에 있든 특정 프로젝트 기준으로 설치
pnpm -C ~/dev/wrapper/app install

# 하위 패키지 폴더에서 루트에 devDependency 추가
pnpm add -D -w typescript

# ui 패키지와, ui에 의존하는 패키지만 빌드
pnpm --filter "...ui" build

# main 이후 바뀐 패키지만 테스트, 매칭이 없으면 실패
pnpm --filter "[origin/main]" --fail-if-no-match test
```

## 근거

- pnpm 11.28.9의 `pnpm install --help`, `pnpm help` 출력

## 더 알아볼 것

- `--filter "<pattern>..."`(의존성 방향)처럼 위 목록에 없는 selector는 공식 문서의 Filtering 페이지에서 확인할 것 [검증 필요]
- `.npmrc`의 workspace 관련 설정(`link-workspace-packages` 등)과 플래그의 관계
