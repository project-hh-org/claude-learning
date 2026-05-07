# 아이디어 자동 캡처 — 셋업 가이드

`ideas/`와 `seeds/`에 발상이 자동으로 떨어지게 만들기 위한 **수동 설정 절차**.
각 머신마다 1회만 하면 된다. 두 영역으로 나뉜다.

| 대상 | 무엇을 | 빈도 |
|---|---|---|
| **Claude Code (CLI)** | Stop hook 등록 (안전망) | 사용하는 머신마다 1회 |
| **Claude Desktop** | filesystem MCP 등록 + Custom Instructions | 사용하는 데스크탑마다 1회 |

룰/스킬 자체는 이 레포에 들어 있어 자동으로 적용되므로, 등록은 위 두 가지뿐이다.

---

## 1. Claude Code — Stop hook 등록 (안전망)

### 무엇을 하는가
캡처 스킬이 1차로 발상을 잡지만, thinking에서 놓친 ideation을 세션 종료 시
JSONL을 후처리로 훑어 `ideas/_unsorted/`에 떨어뜨린다.

### 절차

`~/.claude/settings.json`을 열어 `hooks` 항목에 다음을 추가한다.
이미 다른 hook이 있으면 `Stop` 배열에 항목만 추가하면 된다.

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "bash $HOME/path/to/claude-learning/configs/hooks/idea-safety-net.sh"
          }
        ]
      }
    ]
  }
}
```

> `$HOME/path/to/claude-learning` 부분은 이 레포를 클론한 실제 경로로 바꾸세요.
> 예: `bash $HOME/Documents/repos/claude-learning/configs/hooks/idea-safety-net.sh`

### 동작 확인

1. Claude Code로 새 세션을 짧게 실행 (`claude` 명령)
2. 종료 후 `<repo>/ideas/_unsorted/` 폴더 확인 — 캡처 누락 후보가 있으면 마크다운 파일이 생성됨
3. 후보 검토 후 의미 있는 항목만 `ideas/` 또는 `seeds/`로 정식 이동, 나머지는 삭제

### 끄고 싶을 때

`settings.json`에서 해당 항목만 제거.

---

## 2. Claude Desktop — 1회 셋업 스크립트

### 무엇을 하는가
1. **공식 filesystem MCP**를 Desktop config에 등록 — Claude가 `~/claude-learning/`
   하위에 직접 마크다운을 쓸 수 있게 됨
2. **Custom Instructions 가이드 문서**를 `~/.claude-learning-desktop-guide.md`에 생성

> ⚠️ Desktop은 thinking이 디스크에 저장되지 않으므로 **Claude의 자발적 캡처에 100%
> 의존**한다. Custom Instructions 등록을 빼먹으면 동작하지 않는다.

### 사전 요구

- macOS 또는 Linux (현재 스크립트는 두 OS 지원)
- Node.js + npx 설치 — `npx`로 공식 filesystem MCP 서버 실행
- Claude Desktop 설치

### 절차

```bash
cd /path/to/claude-learning
bash scripts/setup-claude-desktop.sh
```

스크립트가 다음을 수행한다:

- `~/claude-learning/{ideas,seeds}/` 폴더 보장 (Vault 루트로 사용)
- `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) 또는
  `~/.config/Claude/claude_desktop_config.json` (Linux)에 `claude-learning-fs`
  MCP 서버 등록 (기존 mcpServers 항목은 보존)
- `~/.claude-learning-desktop-guide.md`에 Custom Instructions용 가이드 작성

> Vault 루트를 다른 곳으로 두고 싶으면 환경변수 `VAULT_DIR`로 지정:
> ```bash
> VAULT_DIR=$HOME/work/claude-learning bash scripts/setup-claude-desktop.sh
> ```

### 스크립트 실행 후 (수동 단계)

1. **Claude Desktop을 완전히 종료하고 재시작** — config 갱신 반영
2. Desktop 실행 후 `Settings → Profile → Custom Instructions` 열기
3. 아래 명령으로 가이드 내용을 띄워 **그대로 복사 → 붙여넣기**:
   ```bash
   cat ~/.claude-learning-desktop-guide.md
   ```
4. 저장

### 동작 확인

새 대화를 열고 다음과 같이 물어본다:

> "현재 Claude Desktop의 시스템 프롬프트에 등록된 capture 규칙대로 한번 시연해줘.
> 현재 작업과 무관한 작은 도구 아이디어를 하나 떠올리고 seed로 저장해줘."

`~/claude-learning/seeds/` 또는 `ideas/`에 마크다운 파일이 생성되면 성공.

### 끄고 싶을 때

- `claude_desktop_config.json`에서 `mcpServers.claude-learning-fs` 삭제
- Custom Instructions에서 capture 규칙 블록 삭제

---

## 3. 캡처 결과 확인하기

설정이 완료되면 발상이 다음 중 한 곳에 자동 누적된다:

```
<repo>/ideas/<YYYY-MM-DD>-<slug>.md   ← 현재 프로젝트 맥락
<repo>/seeds/<YYYY-MM-DD>-<slug>.md   ← 별개 새 프로젝트 씨앗
```

웹에서 보기:

- `/ideas` — 메모/생각 인덱스 (Spark 💭 / Buildable 🔨 필터)
- `/seeds` — 새 프로젝트 씨앗 인덱스 + 각 항목에 **starter prompt 복사 버튼**

---

## 4. 트러블슈팅

| 증상 | 원인 / 조치 |
|---|---|
| Stop hook이 동작하지 않는 듯 | `bash <스크립트>` 직접 실행해 에러가 있는지 먼저 확인. JSON 파싱 실패는 stderr로 출력됨 |
| Desktop에서 발상이 캡처 안 됨 | (1) Desktop 재시작 했는지, (2) Custom Instructions에 가이드를 붙여 넣었는지, (3) Vault 폴더 존재 여부 확인 |
| `npx`가 없다고 나옴 | Node.js 설치: <https://nodejs.org> |
| 다른 머신에서도 켜고 싶음 | 각 머신에서 1, 2번 절차를 반복 |
| 공개 저장소에 회사명/식별자가 새어 나감 | `configs/rules/capture-ideas.md`의 공개 저장소 보안 조항을 강화하고 캡처 시 일반화 어휘를 쓰도록 룰 강화 |

---

## 5. 캡처가 너무 시끄러울 때

룰의 발동 기준을 좁히려면 `configs/rules/capture-ideas.md`의 **발동 조건** 섹션을 편집하라. 또는 일시적으로 끄려면 세션 시작 시 다음을 명시하면 된다:

> "이 세션에서는 capture-idea 스킬을 발동하지 마"

룰에 그대로 따르도록 명시되어 있다.
