---
title: "Claude CLI --allowedTools: server-side vs client-side 도구 구분"
type: "concept"
stage: "evergreen"
tags: ["claude-code", "claude-cli", "agent", "debugging", "mcp"]
related:
  - "claude-code-hooks"
  - "ralph-loop"
created: "2026-05-12"
updated: "2026-05-12"
---

## 핵심 개념

Claude CLI(`claude -p`)의 `--allowedTools`는 **client-side 도구만** 받는다.
server-side 도구를 넣으면 CLI가 returncode=1로 조용히 실패한다 — stderr는 비어있다.

## 도구 종류

| 구분 | 예시 | --allowedTools에 사용 |
|---|---|---|
| **client-side** | `Bash`, `Read`, `Write`, `Edit`, MCP 도구 (`mcp__서버명__도구명`) | ✅ 가능 |
| **server-side** | `WebFetch`, `WebSearch` | ❌ 불가 (항상 사용 가능, 지정 불필요) |

## 함정 시나리오

에이전트 코드에서 Analyst에게 웹 검색 권한을 명시적으로 주려고 이렇게 작성했다:

```python
allowed_tools = "mcp__duckdb__query_local,WebFetch,WebSearch"
subprocess.run(["claude", "-p", prompt, "--allowedTools", allowed_tools, ...])
```

실행 결과:

```
returncode=1
stderr: (비어있음)
stdout: (비어있음)
```

에러 메시지가 전혀 없어서 MCP 연결 문제, 프롬프트 오류 등 전혀 다른 곳을 디버깅하게 된다.

## 진단 방법

```bash
# stderr가 비어있는데 returncode=1이면 --allowedTools를 의심
# 도구명을 하나씩 제거하면서 재현 여부 확인
claude -p "hello" --allowedTools "WebFetch"   # → 실패
claude -p "hello" --allowedTools "Bash"       # → 성공
```

## 올바른 사용

```python
# MCP 도구만 지정. WebFetch/WebSearch는 넣지 않아도 항상 사용 가능.
allowed_tools = "mcp__duckdb__query_local,mcp__duckdb__list_tables"
```

server-side 도구는 `--allowedTools`에 **명시하지 않아도** Claude가 자동으로 접근할 수 있다.
명시하면 오히려 CLI가 인식하지 못해 실패한다.

## 확인 방법

Claude CLI JSON 응답에서 server-side 도구 사용 여부를 확인할 수 있다:

```json
"server_tool_use": {
  "web_search_requests": 0,
  "web_fetch_requests": 0
}
```

`web_search_requests > 0`이면 `--allowedTools` 없이도 Claude가 WebSearch를 사용한 것.

## 참고

- `claude --help`에서 `--allowedTools` 설명을 보면 "tool names"라고만 되어 있어 server/client 구분이 문서화되어 있지 않다
- MCP 도구명 형식: `mcp__<서버명>__<도구명>` (언더스코어 2개)
