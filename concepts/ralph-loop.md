---
title: "Ralph Loop"
type: "concept"
stage: "evergreen"
tags: ["ai-agent", "loop", "claude-code", "autonomous-coding", "self-healing"]
related:
  - "reflection-loop"
  - "claude-code-hooks"
created: "2026-05-08"
updated: "2026-05-17"
---

## 정의

AI가 사람 개입 없이 코드를 작성 → 테스트 → 수정하는 자율 루프 패턴. Claude Code의 stop hook을 이용해 에이전트 세션이 종료될 때마다 프롬프트를 재주입해 루프를 유지한다.

이름은 Simpsons의 캐릭터 Ralph Wiggum에서 유래 — 계속 실패해도 "I'm helping!"을 외치는 캐릭터에서 착안.

## 구조

```
프롬프트 주입
     ↓
  AI 작업 (코드 수정/생성)
     ↓
  완료 조건 확인 (테스트/타입/린터)
     ↓ FAIL
  가드레일 파일에 실패 기록
     ↓
  프롬프트 재주입 → 다시 AI 작업
     ↓ PASS
    종료
```

## 핵심 특성

- **피드백 형식**: 객관적 신호 — 테스트 통과/실패, 타입 에러, 린터 경고
- **종료 조건**: 명확한 조건 (예: `tsc --noEmit` 오류 0개, 테스트 100% 통과)
- **메모리 방식**: 대화 히스토리가 아닌 **파일 시스템** — 코드베이스, TODO 파일, git 이력
- **가드레일**: 실패 시 에이전트가 가드레일 파일에 "이 방법은 안 된다"는 표지판을 추가. 다음 반복이 먼저 읽어 같은 실수 방지
- **컨텍스트 재시작**: 매 반복마다 새 컨텍스트 창으로 시작해도 파일 시스템에 상태가 보존됨

## Claude Code 구현

Anthropic이 공식 플러그인(`ralph-wiggum`)을 제공한다.

```bash
# 시작
/ralph-loop "할 작업 설명"

# 수동 중단
/cancel-ralph
```

내부적으로 stop hook이 Claude Code의 세션 종료를 가로채고 프롬프트를 재주입한다. 외부 bash `while` 루프 없이 Claude Code 세션 내부에서 루프가 자체적으로 동작한다.

## 잘 맞는 상황

- 테스트/타입/린터로 자동 검증 가능한 코드 작업
- 반복적·기계적 작업 (리팩토링, 마이그레이션, 타입 추가)
- 명확히 정의된 완료 조건이 있는 버그 수정

## 맞지 않는 상황

- 판단이 필요한 모호한 요구사항
- UX/디자인처럼 인간 피드백이 필수인 결정
- 창의적 설계나 아키텍처 선택

## 실전 설계 결정: error_max_turns 처리

Claude CLI로 루프를 구동할 때 에이전트가 최대 턴 수에 도달하면 `error_max_turns` 에러가 반환된다.

```json
{
  "subtype": "error_max_turns",
  "stop_reason": "tool_use",
  "is_error": true
}
```

`stop_reason: "tool_use"`는 에이전트가 도구를 호출하던 **도중**에 잘렸다는 의미다.
이때 두 가지 선택지가 있다:

**선택 A — 부분 결과 pass-through (권장하지 않음)**

`result` 필드를 꺼내 다음 단계에 전달한다. 얼핏 "어느 정도 했으니 계속"처럼 보이지만, 탐지/분석 단계가 중간에 잘렸다면 일부 이슈가 누락된 상태다. 다음 단계가 이걸 전달받으면 불완전한 결과를 만들어내고, Reviewer가 PASS를 줘도 실제로는 절반짜리 수정이 된다.

**선택 B — 즉시 실패 (권장)**

```python
if data.get("subtype") == "error_max_turns":
    raise RuntimeError(f"[{phase}] 턴 한도 초과 — 탐지 미완료, 강제 종료")
```

루프를 중단하고 수동 검토(ESCALATE)로 처리한다. **정확도가 목표인 자동화에서는 틀린 결과보다 실패가 낫다.**

근본 해결은 `MAX_TURNS`를 충분히 늘리거나 해당 단계의 프롬프트를 단순화하는 것이다.

## 실전 설계 결정: 일시적 API 오류 재시도

Cloudflare 522, Anthropic 529 등 일시적 오류는 루프 전체를 종료하지 않고 재시도해야 한다. Claude CLI JSON 응답에 `"retryable": true`와 `retry_after` 값이 포함돼 있으면 대기 후 재시도한다.

```python
_RETRYABLE_PATTERNS = ["retryable", "529", "503", "502", "rate_limit", "overloaded"]

def _is_retryable(stdout, stderr):
    combined = (stdout + stderr).lower()
    for pattern in _RETRYABLE_PATTERNS:
        if pattern in combined:
            m = re.search(r"retry_after[\":\s]+(\d+)", combined)
            wait = int(m.group(1)) if m else 120
            return True, wait
    return False, 0
```

재시도 횟수 상한(예: 3회)을 두고, 소진되면 RuntimeError로 전파한다.

## 참고

- [GitHub - snarktank/ralph](https://github.com/snarktank/ralph)
- [Anthropic Plugin](https://claude.com/plugins/ralph-loop)
- [[claude-cli-allowed-tools]] — Claude CLI 도구 지정 시 주의사항
