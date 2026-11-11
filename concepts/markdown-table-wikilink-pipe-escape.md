---
title: "마크다운 표 안의 wikilink 파이프 충돌"
type: "concept"
stage: "seedling"
summary: "표 셀 안의 `[[slug|레이블]]`에 있는 `|`는 표 셀 구분자로 먼저 해석되어 셀이 잘리고 링크가 깨진다. 파싱 전에 이스케이프하면 해결된다."
publish: false
tags: ["markdown", "wikilink", "table"]
related: []
created: "2026-11-11"
updated: "2026-11-11"
source: "llm-capture"
---

## 한 줄 정의
마크다운 표 행 안에 있는 wikilink의 별칭 구분자 `|`는 표 셀 경계로 먼저 해석되어, 셀이 잘리고 링크가 깨진다.

## 핵심
- 표는 셀을 나누기 위해 `|`를 기준으로 행을 자른다. wikilink의 `|`도 이 기준에 걸린다.
- 결과적으로 뒤쪽 글자가 사라지거나 링크가 제대로 렌더링되지 않는다.
- 해결: 마크다운 파싱 전에 표 행 안의 wikilink `|`만 이스케이프하는 전처리를 넣는다. 표 밖의 링크는 건드리지 않는다.
- 확인할 때는 셀 안 링크, 링크 중첩, 코드 블록을 함께 점검한다.
