---
title: "위키링크 대상을 파일명(slug) 기준으로 찾는 방식"
type: "concept"
stage: "seedling"
summary: "Obsidian식 `[[이름]]`은 파일명으로 대상을 찾는다. 파일명이 slug이고 제목이 따로 있으면, 링크 해석은 slug 기준이 되고 제목 기준은 별도 매핑이 필요하다."
publish: false
tags: ["wikilink", "obsidian", "knowledge-base"]
related: []
created: "2026-11-11"
updated: "2026-11-11"
source: "llm-capture"
---

## 한 줄 정의
`[[이름]]`의 이름을 파일명(또는 slug)과 맞춰 실제 문서로 연결하는 규칙. 제목으로 연결하려면 제목→slug 매핑이 따로 있어야 한다.

## 핵심
- Obsidian에서는 제목이 곧 파일명이라 `[[노트 이름]]`만으로 연결된다. 제텔카스텐 원전은 제목이 아니라 카드 ID로 연결했다.
- 파일명이 영문 slug이고 한글 제목이 frontmatter에 있으면, 위키링크의 "이름"은 slug를 뜻하게 된다.
- 접두사 없는 `[[slug]]`는 여러 컬렉션(예: entries, concepts) 중 실제 파일이 있는 곳을 찾아 연결한다. 해석 결과를 빌드에서 확인하면 깨진 링크를 잡을 수 있다.
- 어디에도 대상이 없으면 링크 없이 글자만 남긴다. 404로 보내면 깨진 링크가 조용히 쌓인다.
- 일반 마크다운 표 셀 안에서 레이블을 쓸 때는 파이프를 `\|`로 이스케이프해야 한다. 파싱 전에 표 행의 wikilink 파이프를 자동으로 이스케이프하는 전처리를 두면 원문에서는 신경 쓰지 않아도 된다.

## 예시
`[[aws-secrets-manager-pattern]]` → entries/ → concepts/ 순서로 해당 slug 파일을 찾아, concept이면 `/concept/aws-secrets-manager-pattern`, entry면 `/<slug>`로 연결.
