---
title: "심볼릭 링크 단일 소스 패턴"
type: "concept"
stage: "evergreen"
tags: ["bash", "cli", "dotfiles", "unix"]
related:
  - "2026-04-24-symlink-single-source"
  - "2026-04-24-ship-tmux-multi-agent"
created: "2026-04-24"
updated: "2026-04-24"
---

## 핵심 아이디어

CLI 스크립트를 Git 레포에서 관리하면서 PATH에도 올리고 싶을 때, `cp` 대신 `ln -sf`를 쓰면 레포가 항상 단일 소스(single source of truth)가 된다.

## 패턴

```bash
# ❌ cp: 레포 수정 후 매번 복사해야 함
cp ~/development/myrepo/script ~/.local/bin/script

# ✅ ln -sf: 레포 수정이 즉시 반영됨
ln -sf ~/development/myrepo/script ~/.local/bin/script
```

## 언제 쓰나

- dotfiles 관리 (`.zshrc`, `.gitconfig` 등)
- 개인 CLI 도구 (자주 수정하는 스크립트)
- 설정 파일을 레포에서 관리하면서 설치 위치에도 반영할 때

## 주의

- 원본 파일이 삭제되면 심볼릭 링크가 broken link가 됨
- `ln -sf`의 `-f`는 기존 링크/파일을 덮어씀 (force)

## 연결

- [[2026-04-24-symlink-single-source]] — 실제 적용 사례 (ship 스크립트)
- [[2026-04-24-ship-tmux-multi-agent]] — ship 스크립트를 심볼릭 링크로 관리
