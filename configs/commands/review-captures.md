---
title: "/review-captures — 캡처 후보 검토 후 공개 폴더로 승격"
description: "concepts/_unsorted · ideas/_unsorted에 쌓인 자동 캡처 후보를 번호 목록으로 보여주고, 다희가 고른 것만 일반화·공개 검사를 거쳐 concepts/ · ideas/ · seeds/로 옮긴다. 옮긴 뒤 배포는 워처가 한다."
category: "commands"
tags: ["capture", "zettelkasten", "review"]
---

# /review-captures — 캡처 후보 검토

`_unsorted/`는 공개 전 대기열이다. 이 커맨드는 사람이 고른 후보만 공개 폴더로 옮긴다.
**다희가 고르지 않은 후보는 절대 옮기지 않는다.** 이 레포는 공개 저장소다.

## 1. 후보 모으기

1. `cat ~/.claude/learning-vault.path`로 vault 경로(`<vault>`)를 확인한다.
2. 후보 파일을 모은다:
   - `<vault>/concepts/_unsorted/*.md`, `<vault>/ideas/_unsorted/*.md`
   - frontmatter `source`가 `llm-capture` 또는 `aside`인 것 → **검토 대상**
   - 파일명이 `*-synthesis-*`, `*-safety-net-*`인 것 → 예전 정규식 hook의 산출물. 개수만 세어 두고 6단계에서 일괄 정리를 제안한다
3. 같은 슬러그가 이미 `concepts/<slug>.md`에 있으면 표에 "기존 노트 보강"으로 표시한다.

## 2. 목록 보여주기

최신순 표로 보여준다. 본문은 보여주지 않는다 (요청하면 그 항목만 보여준다).

| # | 종류 | 제목 | 요약 | 날짜 | 비고 |
|---|---|---|---|---|---|

그리고 묻는다: "옮길 번호, 지울 번호를 알려주세요 (예: 옮김 1,3,4 / 지움 2). 남긴 건 다음에 다시 보여드립니다."

## 3. 승격 (다희가 고른 번호만)

각 항목마다:

1. **일반화**: 회사명·서비스명·내부 도메인·계정 ID·경로 속 사용자명은 `your-app` 등으로 바꾼다.
   대화 맥락에서만 의미 있는 문장은 지운다. 사실이 아닌 내용은 추가하지 않는다.
2. **frontmatter 정리**: `capture_batch` 필드를 지운다. `source`는 남긴다.
   - concept: `stage: "seedling"`, `publish: false` 유지, `created`/`updated`는 그대로
   - idea: 그대로. 다희가 "seed로"라고 하면 capture-idea 스킬의 seeds 템플릿(간단 기획 + 새 프로젝트 시작 프롬프트)을 채운다. 채울 재료가 부족하면 ideas로 둔다
3. **공개 검사**: `bash <vault>/scripts/public-scan.sh <파일>` — 걸리면 해당 줄을 고치고 다시 검사한다. 통과해야만 옮긴다.
4. **옮기기**:
   - concept → `<vault>/concepts/<slug>.md` (날짜 접두사 제거). 이미 있으면 새로 만들지 말고 기존 노트에 내용을 보강하고 `updated`를 오늘로
   - idea → `<vault>/ideas/<YYYY-MM-DD>-<slug>.md`
   - seed → `<vault>/seeds/<YYYY-MM-DD>-<slug>.md`
   - 옮긴 원본은 `_unsorted/`에서 지운다

## 4. 지우기

다희가 "지움"으로 고른 번호만 `_unsorted/`에서 지운다. (gitignore된 로컬 파일이라 되돌릴 수 없다는 점을 한 번 알린다.)

## 5. 보고

```
승격 3건: concepts/a.md, concepts/b.md(기존 보강), ideas/2026-11-11-c.md
삭제 1건, 남김 2건
→ 워처가 몇 초 안에 commit + push 합니다 (로그: tail -f /tmp/claude-learn-watcher.log)
```

## 6. 예전 산출물 정리 제안

1단계에서 센 예전 정규식 hook 산출물이 있으면 "예전 형식 후보 N개가 남아 있습니다. 일괄 삭제할까요?"라고 묻는다.
다희가 승인할 때만 지운다.
