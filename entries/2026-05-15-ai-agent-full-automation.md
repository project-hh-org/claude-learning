---
title: "AI 에이전트 완전 자동화: git push까지 무인 실행"
date: "2026-05-15"
summary: "error_max_turns 부분 결과를 쓰면 안 되는 이유, y/n 프롬프트 제거로 100% 무인 실행 구현"
tags: ["ai-agent", "automation", "claude-cli", "git"]
type: "lab"
category: "AI"
stage: "evergreen"
concepts:
  - slug: "ralph-loop"
    label: "Ralph Loop"
---

## error_max_turns: 부분 결과를 쓰면 안 되는 이유

에이전트가 최대 턴 수(40)에 도달해 중간에 잘렸다:

```json
{
  "subtype": "error_max_turns",
  "stop_reason": "tool_use",
  "is_error": true
}
```

`stop_reason: "tool_use"`는 에이전트가 DB 쿼리를 하던 **도중**에 잘렸다는 뜻이다.

처음에는 "그나마 탐지한 결과를 꺼내서 계속 진행하자"는 아이디어를 구현했다:

```python
# 처음 시도 (나쁜 설계)
if data.get("subtype") == "error_max_turns":
    partial = data.get("result") or ""
    if partial:
        return partial  # 부분 결과로 계속
```

그런데 이게 틀린 접근이었다. 탐지 단계가 절반만 된 상태로 SQL 생성 단계에 넘기면 일부 이슈가 누락된 수정 SQL이 만들어지고, 검증도 통과할 수 있다. **자동화 시스템에서 정확도가 목표라면 불완전한 결과보다 실패가 낫다.**

```python
# 올바른 설계: 즉시 실패
if data.get("subtype") == "error_max_turns":
    raise RuntimeError(f"[{phase}] 턴 한도 초과 — 탐지 미완료")
```

근본 해결은 MAX_TURNS를 충분히 늘리는 것이다 (40 → 80). `error_max_turns`가 반복된다면 해당 단계 프롬프트의 불필요한 쿼리를 줄인다.

## 완전 자동화: y/n 제거

커밋 스크립트에 `read -p "커밋할까요? (y/n)"` 같은 대화형 입력이 있으면 에이전트가 호출할 수 없다. 전부 제거했다.

```bash
# 변경 전
read -p "커밋할까요? (y/n): " confirm
if [ "$confirm" != "y" ]; then exit 0; fi
git commit -m "..."
echo "푸시 명령어: git push"  # 직접 실행도 안 해줌

# 변경 후
if git diff --cached --quiet; then
  echo "ℹ️  커밋할 변경 없음"
  exit 0
fi
git commit -m "$MSG"
git push  # 자동으로
```

에이전트에서는 `subprocess.run(["bash", "scripts/commit-results.sh", today])`로 호출하면 끝이다.

**교훈**: 완전 자동화의 기준은 "스크립트를 실행했을 때 사람이 뭔가를 타이핑해야 하는 순간이 단 한 번도 없는가"다. y/n 한 번도 자동화의 구멍이다.

## 결과

- 에이전트 실행 → 탐지 → SQL 생성 → 검증 → 리포트 → git commit + push
- 전 과정 무인 자동화. 실패 시에만 로그 확인.
