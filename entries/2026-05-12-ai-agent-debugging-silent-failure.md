---
title: "AI 에이전트 디버깅: stderr 비어있는 실패와 SQL 검증 오탐"
date: "2026-05-12"
summary: "Claude CLI --allowedTools에 server-side 도구를 넣으면 조용히 실패한다. 정규식으로 SQL을 파싱할 때는 문맥을 함께 잡아야 한다."
tags: ["ai-agent", "claude-cli", "debugging", "regex", "sql"]
type: "lab"
category: "AI"
stage: "evergreen"
concepts:
  - slug: "claude-cli-allowed-tools"
    label: "Claude CLI --allowedTools"
  - slug: "ralph-loop"
    label: "Ralph Loop"
---

## 삽질 1: stderr 비어있는 returncode=1

에이전트 실행 중 Analyst 단계에서 이런 에러가 반복됐다:

```
RuntimeError: Claude [analyst] 실패 (returncode=1)
--- stderr ---
(비어있음)
--- stdout ---
(비어있음)
```

stderr가 비어있으니 원인을 전혀 알 수 없다. MCP 연결, 프롬프트 문법, 환경변수, 모델명까지 뒤졌는데 전부 정상이었다.

원인은 `--allowedTools`에 `WebFetch,WebSearch`를 넣어둔 것이었다. 이 두 도구는 server-side 도구라 Claude CLI가 인식하지 못한다. 결과는 에러 메시지 없는 즉시 실패.

```python
# 잘못된 코드
allowed_tools = "mcp__duckdb__query_local,WebFetch,WebSearch"

# 올바른 코드 (WebFetch/WebSearch는 명시하지 않아도 항상 사용 가능)
allowed_tools = "mcp__duckdb__query_local,mcp__duckdb__list_tables"
```

**교훈**: `--allowedTools`에는 MCP 도구(`mcp__서버명__도구명`)와 client-side 도구만 넣는다. server-side 도구는 지정 없이도 Claude가 자동으로 접근한다. → [[claude-cli-allowed-tools]]

## 삽질 2: SQL 검증 정규식 오탐

SQL 구조 검증 단계에서 `brands.id=41 존재하지 않음` 에러가 연속 5회 발생했다.

brand_id=41은 깨진 FK를 **수정 대상으로 필터링**하는 `WHERE brand_id = 41`에서 쓴 값이다. 즉, 검증이 필요한 새 참조가 아니라 제거 대상이다. 그런데 검증 정규식이 SET/INSERT 문맥과 WHERE 문맥을 구분하지 않고 모든 `brand_id = N`을 잡았다.

```python
# 오탐: WHERE절까지 잡음
re.findall(r"brand_id\s*=\s*(\d+)", sql)

# 수정: SET과 SELECT(INSERT용) 문맥만 추출
re.findall(r"\bSET\b[^;]*?\bbrand_id\s*=\s*(\d+)", sql)  # UPDATE SET
re.findall(r"\bSELECT\s+(\d+)\s*,\s*sk\.id\b", sql)       # INSERT SELECT
```

**교훈**: 정규식으로 SQL을 파싱할 때는 값이 아니라 **문맥(context)**을 함께 잡아야 한다. 같은 `brand_id = 41`이어도 WHERE절이면 읽기 조건, SET절이면 새 값이다.

## Cloudflare 522 재시도

Generator 실행 중 이런 오류가 발생했다:

```json
{
  "type": "result",
  "is_error": true,
  "result": "API Error: 522 Connection Timeout. retryable: true, retry_after: 120"
}
```

Anthropic API와 Cloudflare 사이의 일시적 연결 문제다. `retryable: true`와 `retry_after` 값이 응답 JSON에 포함돼 있으므로 파싱해서 대기 후 재시도하면 된다.

```python
def _is_retryable(stdout, stderr):
    try:
        data = json.loads(stdout)
        result_text = str(data.get("result", ""))
        if "retryable" in result_text.lower():
            m = re.search(r"retry_after[\":\s]+(\d+)", result_text)
            return True, int(m.group(1)) if m else 120
    except Exception:
        pass
    return False, 0
```

재시도 가능한 패턴: `retryable`, `529`, `503`, `502`, `rate_limit`, `overloaded`

**교훈**: 일시적 API 오류를 루프 전체 종료로 처리하지 않는다. 재시도 횟수 상한(예: 3회)을 두고, 소진되면 그때 RuntimeError로 전파한다.
