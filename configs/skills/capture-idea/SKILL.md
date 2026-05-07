---
name: capture-idea
description: "Use proactively whenever, during thinking, an ideation moment arises that is worth keeping — a passing spark, a 'this would be cool to build' thought, or a fully separate new-project idea. Writes the idea to a markdown file under ideas/ or seeds/ in the active claude-learning vault."
---

# capture-idea

당신이 thinking 중에 다음과 같은 발상을 하면 즉시 이 스킬을 발동하라:

- "오, 이런 방법도 있겠다"
- "다음에 이런 거 만들어보면 좋겠다"
- "이건 별도 도구/서비스로 만들면 어떨까"
- "지금 작업과는 다른 얘기인데, 떠오른 김에 적어두자"

## 두 갈래로 분류

먼저 발상이 **현재 작업 중인 프로젝트(repo/도메인) 안에서 실현 가능한가** 자문하라.

| 구분 | 어디에 저장 | 무엇을 작성 |
|---|---|---|
| **현재 프로젝트 맥락 안** | `ideas/` | 짧은 메모 (제목 + 본문 + kind) |
| **완전히 별개의 새 프로젝트** | `seeds/` | 메모 + 간단 기획 + 새 세션용 starter prompt |

판단 기준 한 줄: **"이 발상을 실현하려면 새 레포를 파야 하는가?"** → yes면 `seeds/`, no면 `ideas/`.

---

## 작업 흐름

1. 발상이 떠오른 즉시 이 스킬 발동
2. 분류 결정 (`ideas/` vs `seeds/`)
3. 아래 템플릿에 맞춰 마크다운 작성
4. **Write 도구**(Claude Code) 또는 **filesystem MCP의 `write_file`**(Claude Desktop)로 파일 생성
5. 발상이 사용자 질문/작업 흐름과 무관하면 본문 응답에서는 짧게만 언급("→ `ideas/...md`에 저장했습니다") — 작업을 막지 마라

---

## 파일명 규칙

- `YYYY-MM-DD-<kebab-case-slug>.md`
- 슬러그는 영문 소문자 + 숫자 + 하이픈만 (한글이면 의미 살린 짧은 영문으로 의역)
- 같은 날 동일 슬러그가 이미 존재하면 뒤에 `-2`, `-3`을 붙여 충돌 방지

저장 위치 (절대 경로 예):
- Claude Code: `<repo-root>/ideas/...` 또는 `<repo-root>/seeds/...` — 보통 현재 cwd 기준
- Claude Desktop: `~/claude-learning/ideas/...` 또는 `~/claude-learning/seeds/...` (사용자 환경에 따라 셋업 스크립트가 알려준 경로 사용)

---

## 템플릿 1: `ideas/<slug>.md` (현재 프로젝트 맥락)

```markdown
---
title: "<한 줄 제목>"
date: "<YYYY-MM-DD>"
kind: "spark" | "buildable"        # spark: 스치는 생각 / buildable: 만들어볼만한 것
scope: "current-project"
source: "claude-code" | "claude-desktop"
source_session_project: "<현재 작업 중인 프로젝트 식별자, 예: claude-learning>"
stage: "seedling"
tags: ["<관련 태그 0~3개>"]
---

## 발상

<무엇을 떠올렸는지 1~3문단. 왜 떠올랐는지 맥락 한 줄 포함.>

## 적용 위치 (kind=buildable일 때만)

<현재 프로젝트의 어디에 어떻게 붙일 수 있을지 1~2문단.>
```

---

## 템플릿 2: `seeds/<slug>.md` (완전히 별개의 새 프로젝트 씨앗)

⚠️ 이 템플릿은 **brief_spec과 starter_prompt를 반드시 채워야** 한다. 비워둔 채 저장하지 마라. 발상이 너무 흐릿해서 채울 수 없다면 `seeds/`가 아니라 `ideas/`로 (kind=spark) 저장하라.

```markdown
---
title: "<프로젝트 가제>"
date: "<YYYY-MM-DD>"
kind: "buildable"
scope: "standalone"
source: "claude-code" | "claude-desktop"
origin_session_project: "<발상이 떠오른 시점의 작업 프로젝트>"
stage: "seedling"
tags: ["<카테고리 태그>"]
---

## 한 줄 피치

<이 프로젝트가 무엇이고 왜 흥미로운지 한 문장.>

## 발상 맥락

<어떤 작업 중에, 어떤 흐름으로 이 발상이 떠올랐는지 1~2문단.>

## 간단 기획

- **무엇**: <프로덕트의 본질>
- **왜**: <해결하는 문제 / 가치>
- **핵심 기능**: <bullet 3~5개>
- **기술 스택 제안**: <언어/프레임워크/주요 라이브러리>
- **MVP 범위**: <첫 버전에 꼭 포함될 것>

## 새 프로젝트 시작 프롬프트

> 새 Claude 세션에 아래 블록을 그대로 붙여넣으면 작업이 시작됩니다.

```
프로젝트명: <가제>
목표: <한 줄>

요구사항:
- <항목 1>
- <항목 2>
- <항목 3>

기술 스택: <스택 명시>

첫 단계로 다음을 수행하라:
1. <단계 1>
2. <단계 2>
3. <단계 3>

작업 시 주의: <제약 / 지침>
```
```

---

## 작성 시 주의

- **공개 저장소**임을 잊지 말 것: 회사명/내부 식별자/자격증명/내부 도메인 등이 발상에 섞여 있으면 일반화해서 작성 (CLAUDE.md의 공개 저장소 규칙 준수)
- 사용자가 명시적으로 "이거 저장하지 마"라고 한 경우엔 발동하지 말 것
- 한 turn에서 여러 발상이 한꺼번에 떠올랐으면 각각 별개 파일로 저장 (한 파일에 묶지 마라 — 제텔카스텐 원자성)
- 응답 본문 흐름을 끊지 말 것: 사용자에게는 짧게 "→ `ideas/...md`에 저장" 정도만 알리고 원래 작업을 계속하라
