---
title: "/log-entry — 학습 로그(entry) 초안 작성"
description: "현재 세션의 학습/작업 흐름을 entries/<YYYY-MM-DD>-<slug>.md 초안으로 작성. 같은 세션에서 만든 concepts/ideas의 양방향 링크 자동 갱신."
category: "commands"
tags: ["entries", "zettelkasten", "captured-by-user"]
---

# /log-entry — 학습 로그 초안 도우미

당신은 사용자의 명시적 호출(`/log-entry`)이 있을 때만 발동한다. thinking에서 자동 호출하지 마라. entries/는 회고적 서사 글이라 사용자 의도가 있을 때만 작성한다.

## 입력

사용자가 `/log-entry`만 입력한 경우:
- 이번 세션의 흐름 전체를 회고

사용자가 `/log-entry <주제>` 형식으로 호출한 경우:
- 그 주제 중심으로만 정리

## 작업 절차

### 1. 세션 회고

지금까지의 대화/thinking/작업을 훑어 다음을 추출:
- 이 세션에서 사용자가 새로 **배운 것** (정의/원리/패턴)
- 사용자가 새로 **시도/구현한 것** (코드/설정/명령)
- 떠오른 **발상**(이미 ideas/seeds로 캡처되었는지 확인)
- 등장한 **개념** (이미 concepts/<slug>.md로 캡처되었는지 확인 — 같은 세션에서 capture-concept skill이 만든 파일들)

### 2. 슬러그 결정

`entries/<YYYY-MM-DD>-<kebab-case-slug>.md` 형식. 슬러그는 영문 소문자 + 숫자 + 하이픈만, 의미 살린 짧은 영문(한글 주제면 의역). 같은 날 동일 슬러그가 이미 존재하면 사용자에게 다른 이름을 묻거나 `-2`를 붙임.

### 3. Frontmatter 자동 작성

```yaml
---
title: "<제목 — 사용자 어조에 맞게 자연스러운 한국어>"
date: "<오늘 YYYY-MM-DD>"
summary: "<한 줄 요약 1문장>"
tags: ["<주제 태그 3~5개>"]
related:
  - slug: "<이 세션에서 만든 다른 entry/idea/seed slug, 0~3개>"
    label: "<해당 항목 제목>"
concepts:
  - slug: "<이 세션에서 capture-concept이 만든 concept slug>"
    label: "<concept 제목>"
---
```

### 4. 본문 어조 — 매우 중요

기존 `entries/*.md`의 어조를 모방하라:
- **1인칭 한국어** ("했다", "알게 됐다", "생각이다")
- 회고적·서사형 — "오늘은 X를 시도했다. Y가 막혀서 Z로 우회했다" 같은 흐름
- 사실 위주가 아니라 **맥락 + 의도 + 결과**가 드러나야 함
- 코드 블록, 명령어 인용 자유롭게
- 길이: 보통 300~800단어 (짧으면 `entries/`가 아니라 ideas/seeds로 가야 함)

기존 entries 참고:
- `entries/2026-05-07-zettelkasten-obsidian-blog.md`
- `entries/2026-05-05-claude-code-setup-and-hooks.md`
- `entries/2026-04-24-ship-tmux-multi-agent.md`

이들이 어떻게 "배경 → 시도 → 막힘 → 해결 → 회고" 구조로 흐르는지 확인.

### 5. 양방향 링크 자동 갱신 — concept 측 보강

frontmatter에 `concepts:` 항목이 있으면, 각 concept 슬러그에 대해:

1. `concepts/<concept-slug>.md` 파일을 Read로 열어
2. frontmatter의 `related:` 필드를 확인
3. **새로 만드는 entry 슬러그가 거기에 없으면 추가**
4. `updated:` 필드를 오늘 날짜로 갱신
5. Edit으로 그 concept 파일 갱신

이로써 entry → concept (정방향)와 concept ← entry (역방향) 둘 다 성립한다.

### 6. 확인 → 저장

작성된 초안을 사용자에게 **먼저 보여주고** 검토 의견을 받는다:
- "이 내용으로 `entries/<slug>.md`에 저장할까요?"
- 사용자가 수정 요청하면 반영 후 다시 보여줌
- 사용자가 OK하면 Write 도구로 저장 + 위 5번 양방향 링크 갱신 수행

### 7. 마무리

저장 후:
- `→ entries/<slug>.md 저장` 알림
- 갱신된 concept 파일이 있으면 `→ concepts/<X>.md 의 related에 entry 추가됨` 알림 각각

## 안티 패턴 (지양)

- ❌ 사용자 호출 없이 자동으로 entries 작성 — 절대 금지
- ❌ 사실 나열형 어조 — entries는 서사. 사실만이면 concepts/로 가야 함
- ❌ 너무 짧은 글(< 200단어) — ideas/spark 영역으로 분류해야 함
- ❌ 이미 존재하는 entry 슬러그를 silently 덮어쓰기 — 사용자에게 묻고 다른 이름 사용
- ❌ 양방향 링크 갱신 시 기존 `related` 항목 삭제 — 추가만, 보존 우선

## 적용 환경

- Claude Code (CLI/Desktop app): `~/.claude/commands/log-entry.md` 설치 후 `/log-entry` 호출 가능
- Claude Desktop chat app: slash command 미지원 — 사용자가 "이 세션 entries로 정리해줘"라고 자연어 요청 → Claude가 이 룰을 참조해 동일 절차 수행
- 모바일: 자연어 요청은 가능하나 파일 쓰기 불가 → 응답에 마크다운 본문 출력 후 사용자가 수동 저장
