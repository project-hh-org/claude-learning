---
title: "심볼릭 링크로 단일 소스 관리하기"
date: "2026-04-24"
summary: "CLI 스크립트를 Git 레포에서 관리하면서 PATH에도 올려두고 싶을 때 — `cp` 대신 `ln -sf` 한 줄로 해결하는 방법."
tags: ["Bash", "CLI", "dotfiles", "Unix"]
type: "lab"
category: "DevTools"
stage: "evergreen"
links: []
references: []
---

## 문제: 스크립트를 어디서 관리해야 하나

CLI 도구를 직접 만들다 보면 자연스럽게 이런 상황이 생긴다.

- 소스 코드는 Git 레포(`~/development/tmux/ship/ship`)에서 관리
- 실행은 PATH에 잡힌 어딘가(`~/.local/bin/ship`)에서

그래서 보통 이렇게 설치한다.

```bash
cp ~/development/tmux/ship/ship ~/.local/bin/ship
```

그런데 이 방식엔 문제가 있다. 소스를 수정할 때마다 `cp`를 다시 해야 한다. 깜빡하면 실행되는 건 구 버전이고, 소스는 이미 새 버전인 상태가 된다.

## 해결: 심볼릭 링크

심볼릭 링크(symbolic link, symlink)는 파일의 복사본이 아니라 **원본 파일을 가리키는 포인터**다.

```bash
ln -sf ~/development/tmux/ship/ship ~/.local/bin/ship
```

이렇게 하면 `~/.local/bin/ship`은 독립된 파일이 아니라 `~/development/tmux/ship/ship`을 직접 참조한다. 소스가 바뀌면 실행 파일도 즉시 바뀐다.

```
~/.local/bin/ship  →  ~/development/tmux/ship/ship
      (링크)                    (실제 파일)
```

## 업데이트가 git pull 한 줄로 끝난다

심볼릭 링크를 쓰면 이후 업데이트 방법이 달라진다.

```bash
# 기존 방식 — 두 단계
git pull
cp ~/development/tmux/ship/ship ~/.local/bin/ship

# 심볼릭 링크 방식 — 한 단계
git pull
```

소스 파일 하나만 관리하면 되고, `cp`를 잊어서 구 버전이 실행되는 상황이 없어진다.

## ln 옵션

```bash
ln -sf [원본] [링크 경로]
```

| 옵션 | 설명 |
|------|------|
| `-s` | symbolic link (하드 링크가 아닌 심볼릭 링크) |
| `-f` | force — 링크 경로에 이미 파일이 있으면 덮어씀 |

## 확인 방법

```bash
ls -la ~/.local/bin/ship
# ~/.local/bin/ship -> /Users/[이름]/development/tmux/ship/ship
```

화살표(`->`)가 보이면 심볼릭 링크가 제대로 걸린 것.

## 언제 쓰면 좋은가

- **CLI 스크립트를 Git으로 관리할 때** — 소스 레포와 실행 경로를 분리하면서도 동기화를 유지하고 싶을 때
- **dotfiles 관리** — `~/.zshrc`, `~/.tmux.conf` 같은 파일을 Git 레포에서 관리하고 홈 디렉토리에 링크를 걸어두는 방식이 대표적
- **여러 버전 전환** — 링크 대상만 바꾸면 실행 파일 없이 버전 전환 가능

---

_작성일: 2026-04-24 · 다희_
