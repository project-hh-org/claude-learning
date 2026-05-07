#!/bin/bash
# =============================================================
# setup-claude-desktop.sh
#
# Claude Desktop에서 아이디어 자동 캡처가 동작하도록 1회 셋업.
#
# 무엇을 하는가:
#   1) 공식 filesystem MCP 서버를 Desktop config에 등록
#      (Claude Desktop이 ~/claude-learning/ 이하에 파일을 쓸 수 있도록)
#   2) capture-ideas 룰의 안내문을 사용자 system prompt(가이드)
#      문서로 ~/.claude-learning-desktop-guide.md 에 박아 두고
#      터미널에 그 내용을 띄움 — Desktop의 'Custom instructions'에
#      복붙하라는 안내.
#
# 실행: bash scripts/setup-claude-desktop.sh
#
# 전제:
#   - Claude Desktop 설치되어 있을 것 (macOS 기준)
#   - Node.js가 설치되어 있을 것 (npx 사용을 위해)
# =============================================================

set -euo pipefail

# ── 색상 ─────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✅ $*${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $*${NC}"; }
err()  { echo -e "${RED}❌ $*${NC}"; }

# ── 경로 결정 ────────────────────────────────────────────
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VAULT_DIR="${VAULT_DIR:-$HOME/claude-learning}"   # Desktop이 파일을 떨굴 루트
GUIDE_PATH="$HOME/.claude-learning-desktop-guide.md"

OS="$(uname -s)"
case "$OS" in
  Darwin)
    CFG_DIR="$HOME/Library/Application Support/Claude"
    ;;
  Linux)
    CFG_DIR="$HOME/.config/Claude"
    ;;
  *)
    err "지원하지 않는 OS: $OS"
    exit 1
    ;;
esac
CFG_FILE="$CFG_DIR/claude_desktop_config.json"

# ── 사전 점검 ────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  err "Node.js가 필요합니다. https://nodejs.org 에서 설치 후 다시 실행하세요."
  exit 1
fi
if ! command -v npx &>/dev/null; then
  err "npx가 필요합니다 (Node.js와 함께 설치됩니다)."
  exit 1
fi

mkdir -p "$CFG_DIR"
mkdir -p "$VAULT_DIR/ideas" "$VAULT_DIR/seeds"
ok "Vault 폴더 준비: $VAULT_DIR (ideas/, seeds/)"

# ── claude_desktop_config.json 갱신 ────────────────────────
# 기존 파일이 없으면 빈 객체로 시작
if [ ! -f "$CFG_FILE" ]; then
  echo '{}' > "$CFG_FILE"
  ok "config 파일 생성: $CFG_FILE"
fi

# Node로 JSON 안전하게 머지 (기존 mcpServers 보존)
node - "$CFG_FILE" "$VAULT_DIR" <<'NODE'
const fs = require('fs')
const [, , cfgPath, vaultDir] = process.argv

let cfg = {}
try { cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8')) } catch {}

cfg.mcpServers ??= {}
cfg.mcpServers['claude-learning-fs'] = {
  command: 'npx',
  args: [
    '-y',
    '@modelcontextprotocol/server-filesystem',
    vaultDir,
  ],
}

fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n', 'utf-8')
console.log('[setup] mcpServers.claude-learning-fs registered')
NODE

ok "Desktop config에 filesystem MCP 등록"

# ── Custom Instructions 가이드 작성 ────────────────────────
cat > "$GUIDE_PATH" <<EOF
# Claude Desktop — 아이디어 자동 캡처 가이드

> 이 파일의 내용을 **Claude Desktop의 Custom Instructions** 또는
> **Project instructions**에 그대로 붙여 넣으세요.
> (Claude Desktop > Settings > Profile > Custom Instructions)

---

## 아이디어 자동 캡처 규칙

당신은 thinking 중 다음 패턴이 떠오르면 즉시 마크다운 파일로 캡처한다:

- "오, 이런 방법도 있겠다"
- "다음에 ~을 시도해보면 좋겠다"
- "이건 별도 도구/서비스로 만들어보면 좋겠다"
- 현재 작업과 무관하게 떠오른 다른 프로덕트/도구/서비스 발상

### 분류 (둘 중 하나)

1. **현재 작업 맥락 안에서 적용 가능** → \`ideas/<YYYY-MM-DD>-<slug>.md\`
2. **완전히 별개의 새 프로젝트** → \`seeds/<YYYY-MM-DD>-<slug>.md\`

판단 한 줄: "이 발상을 실현하려면 새 레포가 필요한가?" → yes면 \`seeds/\`.

### 저장 도구

\`claude-learning-fs\` MCP의 \`write_file\` 도구를 사용한다. 루트 경로:
\`$VAULT_DIR\`

따라서 실제 파일 경로는:
- \`$VAULT_DIR/ideas/<YYYY-MM-DD>-<slug>.md\`
- \`$VAULT_DIR/seeds/<YYYY-MM-DD>-<slug>.md\`

### 마크다운 템플릿

**ideas/ (현재 프로젝트 메모)**
\`\`\`markdown
---
title: "<한 줄 제목>"
date: "<YYYY-MM-DD>"
kind: "spark" | "buildable"
scope: "current-project"
source: "claude-desktop"
source_session_project: "<현재 작업>"
stage: "seedling"
tags: []
---

## 발상

<무엇을 떠올렸는지>

## 적용 위치 (kind=buildable일 때만)

<어디에 어떻게 붙일지>
\`\`\`

**seeds/ (새 프로젝트 씨앗 — 반드시 기획 + starter prompt 포함)**
\`\`\`markdown
---
title: "<프로젝트 가제>"
date: "<YYYY-MM-DD>"
kind: "buildable"
scope: "standalone"
source: "claude-desktop"
origin_session_project: "<발상 떠오른 시점 작업>"
stage: "seedling"
tags: []
---

## 한 줄 피치

<이 프로젝트가 무엇이고 왜 흥미로운지>

## 발상 맥락

<어떤 작업 중에 떠올랐는지>

## 간단 기획

- **무엇**:
- **왜**:
- **핵심 기능**:
- **기술 스택 제안**:
- **MVP 범위**:

## 새 프로젝트 시작 프롬프트

\\\`\\\`\\\`
프로젝트명: <가제>
목표: <한 줄>

요구사항:
- <항목 1>
- <항목 2>

기술 스택: <스택>

첫 단계:
1. <단계 1>
2. <단계 2>

작업 시 주의: <제약>
\\\`\\\`\\\`
\`\`\`

### 작업 흐름 보존

캡처는 사용자가 요청한 본 작업의 흐름을 끊지 않는다. 사용자에게는 짧게 한 줄로 알린다 (예: "→ ideas/2026-05-07-foo.md에 저장했습니다").
EOF

ok "가이드 문서 작성: $GUIDE_PATH"

# ── 마무리 안내 ──────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════"
ok "Claude Desktop 셋업 완료"
echo ""
echo "  Vault 경로:    $VAULT_DIR"
echo "  Desktop 설정:  $CFG_FILE"
echo "  가이드:        $GUIDE_PATH"
echo ""
warn "다음 단계 (수동):"
echo "  1) Claude Desktop을 한 번 종료하고 재시작"
echo "  2) Settings > Profile > Custom Instructions 에"
echo "     아래 파일 내용을 복사해 붙여넣기:"
echo ""
echo "     cat \"$GUIDE_PATH\""
echo ""
echo "  3) 새 대화를 열어 thinking 중 발상이 떠오르는지 테스트"
echo "════════════════════════════════════════════════════"
