---
title: "Ollama × Claude Code 하이브리드 오프로딩"
type: "concept"
stage: "seedling"
tags: ["ollama", "claude-code", "local-llm", "cost-optimization", "token-saving", "hybrid", "cheap-first-routing", "qwen"]
related:
  - "ai-agent-loop-patterns"
  - "ralph-loop"
  - "2026-04-24-ship-tmux-multi-agent"
created: "2026-07-02"
updated: "2026-07-02"
---

# Ollama × Claude Code 하이브리드 오프로딩

로컬 LLM(Ollama)을 Claude Code의 **보조 티어**로 두어, 값싼 잡일을 로컬에서 처리하고 Claude(Opus) 토큰을 아끼는 패턴. 핵심 제약: **Claude Code 본체의 품질·성능은 그대로 유지**(로컬 모델로 대체하지 않음).

## 핵심 통찰 — "어디서 갈리느냐"가 절약을 결정한다

토큰 절약의 성패는 **질문이 Claude에 도달하기 전에 갈리는가**에 달려 있다.

- ❌ **Claude 안에서 라우팅하면 절약 안 됨.** 프롬프트가 Claude 컨텍스트에 들어간 순간 입력 토큰은 이미 소비됨. 그 뒤 Claude가 "이건 로컬로" 판단해 위임해도, Claude가 처음부터 끝까지 개입하므로 오히려 더 씀.
- ✅ **cheap-first (로컬이 앞단):** 질문을 Ollama에 **먼저** 보내고, 복잡하면 Claude로 에스컬레이트. trivial 질문은 Claude에 아예 도달 안 함 → 토큰 0.
- ✅ **큰 파일 읽기 위임:** 로컬이 대용량 파일/로그를 읽고 요약/추출 → 전문(全文)이 Claude 입력을 우회. 요약은 관대한 작업이라 소형 모델로도 품질 리스크 낮음.
- ⚠️ **수정(edit) 위임은 절약이 거의 없음.** 소형 모델이 안전하게 적용할 만큼 정확히 지시하려면 Claude가 이미 최종 코드를 다 만든 뒤라 남는 건 "타이핑"뿐. 느슨히 지시하면 소형 모델이 실수 → 품질 저하. 절약은 **READ 쪽에 있지 EDIT 쪽에 없다.**

## 구현 — 단일 명령 `oll` (플래그 자동 판단)

`/usr/local/bin/oll` 하나로 통일(초기 `oll`/`ask`를 합침). Ollama HTTP API(`/api/generate`, `stream:false`) + `jq`로 깔끔한 텍스트 출력. 백엔드 `qwen2.5-coder:7b`(16GB RAM 급 스윗스팟, 코딩 특화).

**플래그를 직접 칠 필요 없음 — 인자를 보고 자동 판단:**
- 인자 중 **실존 파일**이 있거나 **stdin 파이프**면 → 자동 로컬 처리(요약/추출)
- 그냥 질문이면 → 라우터(로컬 먼저 → 복잡하면 Claude)
- `-l`(강제 로컬)/`-c`(강제 Claude)는 선택적 수동 오버라이드로만 남김

```bash
oll "질문"            # 라우터 자동
oll log.txt "에러만"  # 파일 자동 감지 → 로컬 (-f 불필요, 순서 무관)
cmd | oll "요약"      # stdin 자동 → 로컬
oll -c "질문"         # (선택) 강제 Claude
```

### 프롬프트 언어 — 고정 지시문은 영어
qwen 등은 영어·중국어 위주 학습이라 **지시문이 영어면 지시 따르기·분류 정확도 소폭↑.** 스크립트가 제어하는 고정 scaffolding(요약 지시·라우터 분류)은 영어로, 사용자 질문은 아무 언어나, "답은 질문 언어로" 지시 → 이득만 취함. (7B는 한국어 답에 가끔 한자 토큰을 흘리나 무해.)

라우터 판단은 소형 모델의 self-judge라 **과신 경향**이 약한 고리 → 에스컬레이트 기준을 공격적으로(저장소 맥락·다단계·디버깅·불확실 → 무조건 Claude) 잡아 품질 보호. 이상하면 `oll -c` 재시도.

## 가장 잘 맞는 곳 — QA 루프 / [[ralph-loop|Ralph 루프]]

자율 루프는 수백 번 반복되므로 **반복 1회당 절약이 누적.** 각 반복의 기계적 잡일(테스트/CI 출력 트리아지, 실패 추출, 에러 분류, 다음 태스크 선택, 긴 로그 요약)을 로컬에 위임하고 구현·정답 판정은 Claude에 유지. **Ollama가 분류, Claude가 결정.**

```bash
while true; do
  claude -p "다음 미완료 작업 구현+커밋"
  VERDICT=$(npm test 2>&1 | oll -l "통과면 PASS만, 실패면 실패 테스트+이유 한 줄씩")
  echo "$VERDICT" | grep -q '^PASS' && continue
  echo "$VERDICT" | claude -p "이 실패 고쳐"
done
```

게이트는 보수적으로: 불확실하면 Claude로, 최종 머지/합격 판정은 항상 Claude.

## 세션 내 사용 경계 — `!` 프리픽스가 유일한 0토큰 경로 (실측 확인)

Claude Code 입력창에서 **바레 `oll`을 토큰 0으로 실행하는 건 불가능.** `UserPromptSubmit` 훅은 출력(`decision:block` reason, exit-2 stderr, exit-0 stdout)이 **전부 Claude(모델)를 거치므로** 항상 토큰이 든다(공식 hooks 문서 확인). 사용자에게 직접 표시하며 모델 호출을 건너뛰는 경로가 훅에 없음.

- 세션 안 0토큰: **`! oll "질문"`** (내장 `!` bash 프리픽스 — 유일한 방법)
- 프리픽스 없이 0토큰: **별도 터미널 / tmux pane에서 `oll "질문"`** (tmux 멀티-pane 워크플로우와 정합)
- 바레 `oll`을 그냥 메시지로 치면 Claude가 읽어 실행 → 토큰 소비(절약 목적 파괴)

**안 만든 것:** (1) `oll ` 프리픽스 가로채기 훅 — 0토큰 불가라 목적 자체가 깨짐. (2) 전 프롬프트 자동분류 훅 — 매 프롬프트 지연 + 후속질문 맥락맹 → 지키려는 성능을 깎음.

## 요지

로컬 LLM은 Claude의 **대체가 아니라 앞단 필터**. 절약은 (1) trivial 질문을 Claude 도달 전 차단 (2) 대용량 읽기 우회 (3) 루프 반복 잡일 로컬화에서 나온다. 판단·설계·정답 판정은 Claude에. 세션 내 0토큰 실행은 `!` 또는 별도 pane뿐.
