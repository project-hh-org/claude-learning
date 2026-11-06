---
title: iCloud dataless 파일과 git 저장소 손상
type: concept
stage: seedling
category: DevTools
summary: iCloud Drive가 .git 안의 파일을 내용 없는(dataless) 상태로 비워 두면, git은 pack 파일을 손상으로 오인하고 push까지 거절당한다.
publish: true
tags:
  - git
  - icloud
  - macos
related:
  - macos-hangul-nfd-git-phantom
created: 2026-11-03
updated: 2026-11-03
source: claude-code
---

## 한 줄 정의

iCloud Drive의 "저장 공간 최적화"는 파일 크기와 메타데이터만 남기고 내용을 비운 dataless 파일을 만든다. `.git`이 iCloud 안에 있으면 git 객체가 이렇게 비워져 저장소가 깨진 것처럼 동작한다.

## 핵심

- **증상:** `ls`에는 pack 파일이 정상 크기로 보이지만, 실제로 읽으면 0바이트가 반환된다. git은 이를 `file ... is far too short to be a packfile`로 보고한다.
- **2차 증상:** 원격 브랜치가 가리키는 커밋이 비워진 pack 안에 있으면, git은 그 커밋이 로컬에 없다고 판단한다. 그래서 원격에 새 커밋이 없어도 push가 `rejected (fetch first)`로 거절되고, `main..origin/main` 같은 범위 지정도 `Invalid revision range`로 실패한다.
- **진단:** `find .git -type f -flags +dataless`로 비워진 파일을 찾고, `head -c 4 <pack>`이 `PACK`을 출력하는지 본다. dataless 표시는 내용을 받은 뒤에도 남는 경우가 있으므로, 실제로 끝까지 읽히는지(`wc -c`와 `stat` 크기 비교)를 기준으로 판단한다.
- **복구:** `brctl download <경로>`로 내려받기를 요청한다. 요청은 비동기라 완료까지 기다려야 하고, macOS 샌드박스 안에서는 실행이 막힌다.
- **근본 해결:** 저장소를 iCloud 밖으로 옮긴다. `git init --separate-git-dir`로 `.git`만 옮기는 방법은 dataless 파일을 읽다가 멈출 수 있다. 원격에 저장소가 있다면 iCloud 밖에 새로 clone하고 로컬에만 있는 변경을 복사하는 쪽이 확실하다.

## 예시

```bash
# 비워진 파일 개수
find .git -type f -flags +dataless | wc -l

# pack 헤더가 실제로 읽히는지
head -c 4 .git/objects/pack/pack-*.pack; echo
```

## 더 알아볼 것

- 내용을 내려받은 뒤에도 dataless 플래그가 남는 이유
- Obsidian 등 다른 동기화 도구가 `.git`을 다룰 때의 같은 위험
