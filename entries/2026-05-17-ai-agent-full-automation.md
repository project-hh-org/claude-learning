---
title: "AI 에이전트 완전 자동화: 사람 개입 없이 실행부터 git push까지"
date: "2026-05-17"
summary: "자동화 에이전트에서 y/n 프롬프트 제거, 재시도 로직, error_max_turns 처리까지 100% 무인 실행 구현"
tags: ["ai-agent", "automation", "claude-cli", "git", "debugging"]
type: "lab"
category: "AI"
stage: "evergreen"
concepts:
  - slug: "ralph-loop"
    label: "Ralph Loop"
  - slug: "claude-cli-allowed-tools"
    label: "Claude CLI --allowedTools"
---

## 배경

매일 자동 실행되는 SQL 검증 에이전트를 운영 중이다. 에이전트가 이슈를 탐지하고 수정 SQL을 생성해 검증까지 마친 뒤, 결과를 git으로 기록한다. 목표는 **사람이 아무것도 하지 않아도 전체 파이프라인이 완주**되는 것.

그런데 중간에 사람이 개입해야 하는 지점이 몇 군데 있었다:

1. 커밋 스크립트가 `y/n`을 물어봄
2. API 일시 오류(522)가 나면 전체 루프가 죽음
3. 에이전트가 턴 한도를 초과하면 빈 에러만 남음

오늘 이것들을 전부 없앴다.

## 삽질 1: stderr 비어있는 returncode=1

Analyst 단계에서 이런 에러가 계속 났다:

```
RuntimeError: Claude [analyst] 실패 (returncode=1)
--- stderr ---
(비어있음)
--- stdout ---
(비어있음)
```

MCP 연결, 프롬프트 문법, 환경변수 등 온갖 곳을 디버깅했다. 원인은 전혀 엉뚱한 곳이었다.

`--allowedTools`에 `WebFetch,WebSearch`를 넣어둔 것이 문제였다. 이 두 도구는 server-side 도구라 Claude CLI가 client-side tool 이름만 받는 `--allowedTools`에서 인식하지 못한다. 결과는 조용한 즉시 실패 — 에러 메시지도 없이.

```python
# 잘못된 코드
allowed_tools = "mcp__duckdb__query_local,WebFetch,WebSearch"

# 올바른 코드 (WebFetch/WebSearch는 명시하지 않아도 항상 사용 가능)
allowed_tools = "mcp__duckdb__query_local,mcp__duckdb__list_tables"
```

자세한 내용 → [[claude-cli-allowed-tools]]

## 삽질 2: fk_check 오탐

SQL 검증 단계에서 `brands.id=41 존재하지 않음` 에러가 연속 5회 발생했다. brand_id=41은 깨진 FK를 **수정 대상**으로 `WHERE brand_id = 41`에 쓴 것인데, 검증 정규식이 SET/INSERT 문맥과 WHERE 문맥을 구분하지 않고 다 잡아냈다.

```python
# 오탐: WHERE절까지 잡음
re.findall(r"brand_id\s*=\s*(\d+)", sql)

# 수정: SET과 SELECT(INSERT용) 문맥만 추출
re.findall(r"\bSET\b[^;]*?\bbrand_id\s*=\s*(\d+)", sql)
re.findall(r"\bSELECT\s+(\d+)\s*,\s*sk\.id\b", sql)
```

정규식으로 SQL을 파싱할 때는 항상 **문맥(context)**을 함께 잡아야 한다.

## Cloudflare 522 재시도

에이전트 실행 중 이런 오류가 발생했다:

```
API Error: 522 Connection Timeout
retryable: true, retry_after: 120
```

Anthropic API와 Cloudflare 사이의 일시적 연결 문제다. Claude CLI JSON 응답에 `retryable: true`와 `retry_after` 값이 들어있으므로 이걸 파싱해 대기 후 재시도하면 된다.

```python
def _is_retryable(stdout, stderr):
    try:
        data = json.loads(stdout)
        if "retryable" in str(data.get("result", "")).lower():
            m = re.search(r"retry_after[\":\s]+(\d+)", stdout)
            return True, int(m.group(1)) if m else 120
    except Exception:
        pass
    return False, 0
```

## error_max_turns: 부분 결과를 쓰면 안 되는 이유

에이전트가 최대 턴 수(40)에 도달해 중간에 잘렸다. 처음에는 "그나마 탐지한 결과를 꺼내서 계속 진행하자"는 아이디어를 시도했다.

```python
# 처음 시도 (나쁜 설계)
if data.get("subtype") == "error_max_turns":
    partial = data.get("result") or ""
    if partial:
        return partial  # 부분 결과로 계속
```

근데 이게 틀린 접근이었다. `stop_reason: "tool_use"`는 에이전트가 DB 쿼리를 하던 **도중**에 잘렸다는 뜻이다. 이슈 탐지가 절반만 된 상태로 SQL 생성 단계에 넘기면, 일부 이슈가 누락된 수정 SQL이 만들어지고, 검증도 통과할 수 있다.

**자동화 시스템에서 정확도가 목표라면, 불완전한 결과보다 실패가 낫다.**

```python
# 올바른 설계
if data.get("subtype") == "error_max_turns":
    raise RuntimeError(f"[{phase}] 턴 한도 초과 — 탐지 미완료")
```

근본 해결은 MAX_TURNS를 충분히 늘리는 것이다 (40 → 80).

## 완전 자동화: y/n 제거

커밋 스크립트에서 `read -p "커밋할까요? (y/n)"` 같은 대화형 입력을 전부 제거했다.

```bash
# 변경 전
read -p "커밋할까요? (y/n): " confirm
if [ "$confirm" != "y" ]; then exit 0; fi

# 변경 후 — 변경 없으면 자동 종료, 있으면 자동 커밋+푸시
if git diff --cached --quiet; then
  echo "ℹ️  커밋할 변경 없음"
  exit 0
fi
git commit -m "$MSG"
git push
```

에이전트가 `subprocess.run(["bash", "scripts/commit-results.sh", today])`로 스크립트를 호출하면, 사람 개입 없이 커밋과 푸시가 완료된다.

## 결과

- 에이전트 실행 시작 → 탐지 → SQL 생성 → 검증 → 리포트 생성 → git commit + push
- 전 과정 무인 자동화. 실패 시에만 로그 확인.
- 다음 목표: 사후 검증(N일 후 동일 키워드 재탐지로 실제 개선 여부 측정)
