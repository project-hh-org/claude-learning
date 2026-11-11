---
title: "공통 상세 레이아웃과 얇은 어댑터"
type: "concept"
stage: "seedling"
summary: "여러 종류의 문서 상세 페이지를 하나의 공통 레이아웃으로 조립하고, 종류별 차이는 데이터로만 넘기는 구조다."
publish: false
tags: ["react", "component-design", "ui-consistency"]
related: []
created: "2026-11-11"
updated: "2026-11-11"
source: "llm-capture"
---

## 한 줄 정의

문서 종류마다 상세 컴포넌트를 따로 만들지 않고, 공통 레이아웃 하나가 조립 순서를 정하고 각 종류는 어댑터가 배지·전용 블록 같은 차이만 정해 넘기는 방식이다.

## 핵심

- 조립 순서(탭, 메타, 제목, 요약, 태그, 본문, 연결 섹션)는 공통 컴포넌트 한 곳에만 둔다.
- 종류별 컴포넌트는 "이 항목의 배지가 무엇인지, 전용 블록이 무엇인지"만 결정하는 얇은 어댑터가 된다.
- 섹션이 컴포넌트마다 제각각이면 같은 종류의 문서도 페이지마다 다르게 보인다. 공통 섹션을 한곳에서 관리하면 이 차이가 생기지 않는다.
- 종류별 차이가 데이터로 표현되지 않고 분기문으로 흩어지면 어댑터 구조가 무너진다.

## 예시

```jsx
// 공통 레이아웃: 탭·섹션 순서는 NoteDetail 안에서만 정한다
<NoteDetail
  badges={<><SeedBadge /><StageBadge stage={seed.stage} /></>}
  meta={[seed.date]}
  title={seed.title}
  summary={seed.pitch}
  actions={<PromptCopyBlock />}   // 종류 전용 블록
  html={seed.contentHtml}
  related={seed.related}
  backlinks={seed.backlinks}
/>
```

이렇게 하면 새 문서 종류를 추가할 때 어댑터 하나만 만들면 된다.
