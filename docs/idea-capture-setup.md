# 자동 캡처 파이프라인 — 셋업 가이드

`ideas/`·`seeds/`·`concepts/`에 발상·새 프로젝트 씨앗·학습한 개념이
**자동으로** 떨어지게 만들기 위한 **수동 설정 절차**.
각 머신마다 1회만 하면 된다.

> 이 문서의 파일명은 `idea-capture-setup`이지만 실제 범위는
> ideas + seeds + concepts 모두를 다룬다.

| 대상 | 무엇을 | 빈도 |
|---|---|---|
| **Claude Code (CLI)** + **Claude Code Desktop app** | 1) 설치 스크립트로 skills/rules 심볼릭 링크 등록 + Stop hook 머지 | 머신당 1회 |
| **Claude Desktop chat app** (claude.ai/download) | 2) 셋업 스크립트로 filesystem MCP 등록 + Custom Instructions 복붙 | 머신당 1회 |
| **Claude 모바일앱** | 자동 캡처 불가 — 우회 방법만 가능 | — |

> ⚠️ **두 종류의 "Desktop"이 다른 제품**이라 헷갈리지 말 것.
> - **Claude Code Desktop app**: Claude Code(CLI)의 GUI 버전. Skills/Hooks/MCP 모두 지원
> - **Claude Desktop chat app**: claude.ai에서 다운로드하는 일반 채팅 앱. MCP만 확실히 지원, Skills/Hooks 지원 여부는 불확실 — Custom Instructions + filesystem MCP 조합으로 우회
>
> 본 가이드의 1단계는 전자, 2단계는 후자에 해당한다.

---

## 1. Claude Code / Claude Code Desktop app — 설치 스크립트 1회 실행

### 무엇을 하는가

이 레포의 `configs/{skills,rules}/`와 `configs/hooks/idea-safety-net.sh`를
**Claude Code가 자동 발견하는 표준 경로**(`~/.claude/...`)로 심볼릭 링크
등록하고, Stop hook 항목을 `~/.claude/settings.json`에 안전하게 머지한다.

> `configs/`는 블로그가 읽어 페이지로 렌더링하는 표시용 경로다. Claude Code는 이 경로를 자동 발견하지 않으므로 별도 등록이 필요하다. 심볼릭 링크 방식이라 `configs/`에서 편집한 내용이 즉시 반영된다.

### 절차

```bash
cd /path/to/claude-learning
bash scripts/install-claude-config.sh
```

다음을 자동 수행한다:

- `~/.claude/skills/capture-idea` → `<repo>/configs/skills/capture-idea/` 심볼릭 링크
- `~/.claude/skills/capture-concept` → 같은 방식
- `~/.claude/rules/capture-ideas.md`, `capture-concepts.md`, `security.md` → 같은 방식
- `~/.claude/commands/log-entry.md` → `<repo>/configs/commands/log-entry.md` 심볼릭 링크
- `~/.claude/settings.json`의 `hooks.Stop`에 `idea-safety-net.sh`, `concept-synthesis.sh` 항목 머지 (기존 보존, 중복 방지)
- **`~/.claude/learning-vault.path`에 이 레포 절대경로 한 줄 기록** — skill/hook이 이를 읽어 cwd 무관하게 항상 같은 vault에 저장

### 적용 범위 옵션

| 모드 | 명령 | 결과 |
|---|---|---|
| **user** (기본) | `bash scripts/install-claude-config.sh` | `~/.claude/...` 등록 → 이 머신의 모든 프로젝트에서 활성 |
| **project** | `SCOPE=project bash scripts/install-claude-config.sh` | `<repo>/.claude/...` 등록 → 이 레포에서만 활성 |

### 동작 확인

1. Claude Code로 새 세션 시작 (`claude` 명령) 또는 Claude Code Desktop app 재시작
2. 짧게 대화하면서:
   - 발상이 떠올랐을 때 `ideas/` 또는 `seeds/`에 자동 생성 확인 (`capture-idea` skill)
   - "X가 뭐야?" 같은 학습 질문을 하고 답변 후 `concepts/`에 seedling 자동 생성 확인 (`capture-concept` skill)
3. 세션 종료 후:
   - `<repo>/ideas/_unsorted/` — thinking 후처리로 누락된 발상 후보 (`idea-safety-net.sh`)
   - `<repo>/concepts/_unsorted/` — 정의 Q&A 합성 후보 (`concept-synthesis.sh`)
4. `_unsorted/` 안의 후보들을 검토 → 가치 있는 것만 정식 폴더(`ideas/`, `seeds/`, `concepts/`)로 이동 + frontmatter 정비. 나머지 삭제.

### 끄고 싶을 때

```bash
bash scripts/install-claude-config.sh --uninstall
```

심볼릭 링크는 제거된다. settings.json의 Stop hook 항목은 수동 제거 필요.

---

## 2. Claude Desktop chat app — 셋업 스크립트 1회 실행

### 무엇을 하는가

claude.ai에서 다운로드하는 일반 Claude Desktop 앱은 Skills/Hooks를 동일한
방식으로 지원한다는 공식 보장이 없다. 따라서 **MCP + Custom Instructions**
조합으로 우회한다.

1. **공식 filesystem MCP**를 Desktop config에 등록
2. **Custom Instructions 가이드 문서**를 `~/.claude-learning-desktop-guide.md`에 생성

### 사전 요구

- macOS 또는 Linux
- Node.js + npx 설치
- Claude Desktop chat app 설치

### 절차

```bash
cd /path/to/claude-learning
bash scripts/setup-claude-desktop.sh
```

스크립트가 다음을 수행한다:

- `~/claude-learning/{ideas,seeds}/` 폴더 보장 (Vault 루트로 사용)
- `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) 또는 `~/.config/Claude/claude_desktop_config.json` (Linux)에 `claude-learning-fs` MCP 서버 등록
- `~/.claude-learning-desktop-guide.md`에 Custom Instructions용 가이드 작성

> Vault 루트를 다른 곳으로 두고 싶으면 환경변수로:
> ```bash
> VAULT_DIR=$HOME/work/claude-learning bash scripts/setup-claude-desktop.sh
> ```

### 스크립트 실행 후 (수동 단계)

1. **Claude Desktop 앱 종료 후 재시작**
2. `Settings → Profile → Custom Instructions` 열기
3. 아래 명령으로 가이드 내용 띄워 그대로 복사 → 붙여넣기:
   ```bash
   cat ~/.claude-learning-desktop-guide.md
   ```
4. 저장

### 동작 확인

새 대화에서:

> "현재 등록된 capture 규칙대로 시연해줘. 별개의 작은 도구 아이디어를
> 하나 떠올리고 seed로 저장해줘."

`~/claude-learning/seeds/`에 파일이 생성되면 성공.

### 끄고 싶을 때

- `claude_desktop_config.json`에서 `mcpServers.claude-learning-fs` 항목 삭제
- Custom Instructions에서 capture 규칙 블록 삭제

---

## 3. 모바일앱 — 자동 캡처 불가

| 항목 | 가능 여부 |
|---|---|
| 로컬 MCP 서버 등록 | ❌ 불가 |
| 로컬 파일 작성 | ❌ 불가 |
| Hook | ❌ 불가 |
| Custom Instructions 동기화 | ✅ |
| 원격 MCP (URL 기반) | ⚠️ Pro/Max 플랜 + 별도 원격 MCP 서버 운영 필요 |

따라서 모바일에서 자동으로 `ideas/`, `seeds/`에 파일을 떨굴 수는 없다.
**우회 방법:**

1. Custom Instructions에 "발상이 떠오르면 응답 끝에 `IDEA: ...` 또는 `SEED: ...` 블록으로 명시 출력하라"를 추가 → 사용자가 수동으로 옮김
2. 또는 본인 서버를 띄워 원격 MCP로 노출 → 모바일 클라이언트의 connector로 등록 → 발상이 떠오르면 그 endpoint에 push (별도 프로젝트급)

---

## 4. 캡처 결과 확인하기

설정이 완료되면 발상이 다음 중 한 곳에 자동 누적된다:

```
<repo>/ideas/<YYYY-MM-DD>-<slug>.md   ← 현재 프로젝트 맥락
<repo>/seeds/<YYYY-MM-DD>-<slug>.md   ← 별개 새 프로젝트 씨앗
```

웹에서 보기:

- `/ideas` — 메모/생각 인덱스 (Spark 💭 / Buildable 🔨 필터)
- `/seeds` — 새 프로젝트 씨앗 인덱스 + 각 항목에 **starter prompt 복사 버튼**

---

## 5. 트러블슈팅

| 증상 | 원인 / 조치 |
|---|---|
| Claude Code에서 발상 캡처가 안 됨 | `install-claude-config.sh` 실행 후 새 Claude Code 세션을 다시 시작했는지 확인. `ls -la ~/.claude/skills` 로 심볼릭 링크 확인 |
| Stop hook이 동작하지 않는 듯 | `~/.claude/settings.json`에 항목이 있는지 확인. `bash <스크립트>` 직접 실행해 stderr 점검 |
| Desktop chat app에서 캡처 안 됨 | (1) 앱 재시작, (2) Custom Instructions에 가이드 붙여넣었는지, (3) `~/claude-learning/{ideas,seeds}/` 폴더 존재 확인 |
| `npx`가 없다고 나옴 | Node.js 설치 (https://nodejs.org) |
| 심볼릭 링크가 깨짐 (이 레포 이동했음) | install 스크립트 재실행하면 새 경로로 다시 만들어짐 |
| 다른 머신에서도 켜고 싶음 | 각 머신에서 1, 2번 절차를 반복 |

---

## 6. 캡처가 너무 시끄러울 때

룰의 발동 기준을 좁히려면 `configs/rules/capture-ideas.md`의 **발동 조건** 섹션을 편집. 심볼릭 링크라 즉시 반영된다.

세션 단위로 잠깐 끄려면:

> "이 세션에서는 capture-idea 스킬을 발동하지 마"

룰에 그대로 따르도록 명시되어 있다.
