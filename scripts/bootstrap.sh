#!/bin/bash
# =============================================================
# bootstrap.sh — 새 기기에서 1회 실행
#
# 일반 흐름:
#   1) git clone https://github.com/project-hh-org/claude-learning.git
#   2) cd claude-learning
#   3) bash scripts/bootstrap.sh
#
# 다음을 자동 수행:
#   - npm install (블로그 빌드용 의존성)
#   - bash scripts/install-claude-config.sh (Claude Code/Desktop app용
#     skills/rules/commands 심볼릭 링크 + Stop hooks + vault path 기록)
#
# 끝나면 다음을 (필요 시) 수동 실행:
#   - bash scripts/setup-claude-desktop.sh   (claude.ai/download chat app용)
#
# 옵션:
#   SKIP_NPM=1 bash scripts/bootstrap.sh    (npm install 건너뛰기)
#   SCOPE=project bash scripts/bootstrap.sh (project 범위 설치)
# =============================================================

set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✅ $*${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $*${NC}"; }

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo "📁 레포: $REPO_DIR"
echo ""

# ── 1. npm install ──────────────────────────────────────────
if [ "${SKIP_NPM:-}" = "1" ]; then
  warn "SKIP_NPM=1 — npm install 건너뜀"
elif command -v npm &>/dev/null; then
  echo "📦 npm install ..."
  npm install --no-audit --no-fund
  ok "npm 의존성 설치 완료"
else
  warn "npm 없음 — 블로그 빌드(`npm run build`)를 하려면 Node.js를 설치하세요"
fi
echo ""

# ── 2. Claude Code 설정 ─────────────────────────────────────
echo "🔧 install-claude-config.sh 실행 ..."
bash scripts/install-claude-config.sh
echo ""

# ── 3. 마무리 안내 ──────────────────────────────────────────
echo "════════════════════════════════════════════════════"
ok "Bootstrap 완료"
echo ""
echo "  설치된 것:"
echo "    - Claude Code skills / rules / commands → ~/.claude/..."
echo "    - Stop hooks → ~/.claude/settings.json"
echo "    - Vault 절대경로 → ~/.claude/learning-vault.path"
echo ""
warn "선택적 다음 단계:"
echo "  - Claude Desktop chat app 사용 시:"
echo "      bash scripts/setup-claude-desktop.sh"
echo "  - macOS 자동 push 워처 활성화 시:"
echo "      bash scripts/install-launchd.sh"
echo "════════════════════════════════════════════════════"
