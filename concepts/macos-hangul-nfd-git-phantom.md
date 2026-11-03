---
title: "macOS 한글 파일명이 git에 유령으로 뜨는 이유 (NFC/NFD)"
type: "concept"
stage: "seedling"
category: "DevTools"
summary: "한글 파일이 git status에 '삭제 + untracked'로 이중 표시되고 checkout·rm이 안 먹힐 때, 원인은 유니코드 정규화(NFC/NFD) 차이다."
publish: true
tags: ["git", "macOS", "unicode", "troubleshooting"]
related: []
created: "2026-10-23"
updated: "2026-10-23"
---

## 핵심 아이디어

한글 파일이 `git status`에 '삭제 + untracked'로 이중 표시되고 `git checkout`·`git rm`이 `pathspec did not match`로 실패하면, 원인은 유니코드 정규화(NFC/NFD) 차이다.

## 증상

- 같은 한글 파일이 추적 파일로는 `D`(삭제), 동시에 `??`(untracked)로 뜬다.
- `git checkout -- "파일"`, `git rm "파일"`이 모두 `pathspec did not match`로 실패한다.
- 다시 클론해도 똑같이 재발한다.

## 원인

git은 파일명을 글자가 아니라 **바이트**로 비교한다. 같은 한글도 NFC(완성형)와 NFD(자모 분리)는 바이트가 완전히 다르다. 예를 들어 '봄시즌'은 NFC로 9바이트, NFD로 24바이트다.

- 문제 파일은 **커밋(index)에 NFD로 저장**돼 있다.
- macOS git 기본값 `core.precomposeunicode=true`는 디스크의 파일명을 읽을 때 NFD를 NFC로 바꿔서 비교한다.
- 그래서 index(NFD)와 git이 본 디스크(NFC)가 영원히 일치하지 않는다.

맥에서 직접 `git add`한 파일은 precompose 덕분에 NFC로 들어가서 문제가 없다. 외부에서 받은 파일(스프레드시트에서 내보낸 CSV, 다운로드한 xlsx 등)이 정규화 없이 커밋되면 그 파일만 NFD로 박힌다. 커밋 안에 NFD가 들어 있으니 다시 클론해도 재발한다.

## 우회책 (로컬 설정만, 커밋 불필요)

```bash
git config core.precomposeunicode false   # git도 디스크를 NFD 그대로 읽게 해서 index와 맞춘다
git checkout -- <디렉토리>                  # 사라진 것처럼 보이던 파일 복구
```

- 개별 파일명 대신 **디렉토리 pathspec**을 쓰면 정규화 차이를 피할 수 있다.
- 명령 하나만 바꾸려면 `git -c core.precomposeunicode=false rm -- <경로>`처럼 실행한다.
- 정상 파일은 NFC, 유령만 NFD이므로 `git ls-files -z` 결과를 NFC 여부로 걸러 NFD 항목만 처리하면 다른 파일을 건드리지 않는다.

## 영구 해결

우회책은 그 맥에서만 유효하다. 커밋에 들어간 NFD 파일명을 NFC로 rename하는 커밋을 만들어야 모든 클론에서 해결된다.

## 주의

- 증상이 '파일이 지워졌다'처럼 보여서 복구 명령을 반복하기 쉽지만, 파일은 디스크에 그대로 있다.
- 외부에서 받은 한글 파일을 커밋하기 전에 파일명을 NFC로 정규화하는 습관이 근본 예방책이다.
