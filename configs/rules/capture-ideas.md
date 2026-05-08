---
title: "아이디어 자동 캡처 규칙"
description: "thinking 중에 떠오른 발상을 즉시 ideas/ 또는 seeds/ 마크다운으로 저장하도록 강제하는 글로벌 규칙."
category: "rules"
tags: ["ideation", "zettelkasten", "automation"]
---

## 목적

작업 중 떠오른 발상이 thinking에만 남고 휘발되는 것을 막는다. 발상이 떠오르는 즉시 마크다운 파일로 캡처해 나중에 발전시킬 수 있도록 한다.

## 적용 범위

| 환경 | 활성화 방법 | 사용하는 도구 |
|---|---|---|
| Claude Code (CLI) | `scripts/install-claude-config.sh` 실행 시 `~/.claude/rules/`로 심볼릭 링크되어 자동 로드 | built-in Write |
| Claude Code Desktop app | 동일 (위 install 스크립트가 양쪽 모두 적용) | built-in Write |
| Claude Desktop chat app | `scripts/setup-claude-desktop.sh` 실행 후 사용자가 Custom Instructions에 가이드를 직접 복붙 | filesystem MCP의 `write_file` |
| Claude 모바일앱 | 자동 캡처 불가 — Custom Instructions로 응답에 명시 출력만 가능 | n/a |

저장 루트 경로: `claude-learning` 레포의 작업 디렉토리. Desktop chat app의 경우 보통 `~/claude-learning/`. 정확한 경로는 셋업 스크립트가 사용자 가이드에 박아둔다.

## 발동 조건

thinking 중 다음 패턴이 나타나는 즉시 `capture-idea` 스킬을 발동한다:

- "오, 이런 방법도 있겠다" / "이렇게도 할 수 있구나"
- "다음에 ~을 시도해보면 좋겠다"
- "이거 ~로 만들어보면 재밌겠다"
- "지금 작업과는 별개인데 ~"
- 현재 작업에서 곁가지로 떠오른 다른 도구/서비스/제품 발상

## 분류 규칙

발상을 두 갈래로만 나눈다:

1. **현재 프로젝트(레포/도메인)에 적용 가능** → `ideas/<YYYY-MM-DD>-<slug>.md`
2. **현재 프로젝트와 무관한 별개 프로젝트** → `seeds/<YYYY-MM-DD>-<slug>.md`

판단 한 줄: **"이 발상을 실현하려면 새 레포를 파야 하는가?"** → yes면 `seeds/`.

## 의무 사항 (`seeds/`로 분류된 경우)

`seeds/` 파일은 다음 세 가지를 **반드시** 포함한다. 셋 다 채울 만큼 발상이 영글지 않았으면 `ideas/`로 (kind=spark) 떨어뜨려라.

1. **간단 기획**: 무엇 / 왜 / 핵심 기능 / 기술 스택 / MVP 범위
2. **새 프로젝트 시작 프롬프트**: 새 Claude 세션에 그대로 붙여넣을 수 있는 형태
3. **발상 맥락**: 어떤 작업 중에 떠올랐는지

## 작업 흐름 보존

- 발상 캡처는 사용자가 요청한 본 작업의 흐름을 끊지 않아야 한다
- 사용자에게는 짧게 한 줄로만 알린다: 예) `→ ideas/2026-05-07-foo.md에 저장`
- 사용자가 "캡처 잠깐 멈춰"라고 명시하면 그 세션 동안은 발동하지 않는다

## 공개 저장소 보안

이 레포는 외부에 공개된다. 발상에 회사명/내부 식별자/자격증명/내부 도메인이 섞여 있으면 일반화해서 작성한다 (CLAUDE.md 공개 저장소 규칙 참조).

## 누락 방지 안전망

Stop hook(`configs/hooks/idea-safety-net.sh`)이 세션 종료 시 JSONL의 thinking 블록을 스캔해 캡처되지 않은 ideation 후보를 추출한다. 즉 이 규칙을 위반해 캡처를 빠뜨려도 일부는 사후에 잡힌다 — 그러나 1차 책임은 thinking 시점에 즉시 발동하는 것이다.
