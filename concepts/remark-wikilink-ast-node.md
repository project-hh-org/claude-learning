---
title: "remark 변환 단계에서 위키링크를 AST 노드로 삽입하기"
type: "concept"
stage: "seedling"
summary: "마크다운을 문자열 단계에서 HTML 태그로 치환하면 remark-rehype 변환 중 raw HTML이 버려져 링크가 사라진다. remark 플러그인에서 mdast 링크 노드를 직접 넣어야 한다."
publish: false
tags: ["markdown", "remark", "wikilink"]
related: []
created: "2026-11-11"
updated: "2026-11-11"
source: "llm-capture"
---

## 한 줄 정의
마크다운 원문의 `[[...]]`를 미리 `<a>` 태그 문자열로 바꾸면, remark-rehype 변환에서 raw HTML이 드롭되어 링크가 생기지 않는다. 변환 파이프라인 안에서 mdast 링크 노드를 직접 삽입해야 한다.

## 핵심
- remark-rehype는 기본 설정에서 raw HTML을 버린다. 문자열 치환으로 넣은 `<a>`는 에러 없이 사라지므로 알아채기 어렵다.
- remark 플러그인에서 text 노드만 순회하며 `[[...]]`를 link 노드로 바꾸면 rehype 단계에서 정상 `<a>`가 된다.
- code/inlineCode는 text 노드가 아니므로 플러그인이 건드리지 않는다. 코드 블록 안의 `[[...]]` 보존이 자연스럽게 된다.
- 검증은 소스 문자열이 아니라 빌드 결과 HTML의 실제 anchor로 한다. RSC payload 안에 이스케이프된 문자열이 있으면 링크처럼 보여 오탐이 난다.

## 예시
`[[slug|레이블]]`을 파싱해 `{type: 'link', url: '/concept/slug', children: [{type: 'text', value: '레이블'}]}` 노드로 교체한다.
