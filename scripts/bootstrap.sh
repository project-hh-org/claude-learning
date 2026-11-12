#!/bin/bash
# =============================================================
# bootstrap.sh — 새 기기에서 1회 실행
#
# 일반 흐름 (이 레포는 iCloud에 두지 않는다 — GitHub로만 동기화):
#   0) iCloud 동기화가 끝난 뒤 Claude 설정 복원 (rules·commands·agents·CLAUDE.md):
#      bash ~/Library/Mobile\ Documents/com~apple~CloudDocs/claude/claude-code-home-backup/restore-on-new-machine.sh
#   1) git clone git@github.com:project-hh-org/claude-learning.git ~/projects/claude-learning
#   2) bash ~/projects/claude-learning/scripts/bootstrap.sh
#
# 다음을 자동 수행:
#   - npm install (블로그 빌드용 의존성)
#   - bash scripts/install-claude-config.sh (Claude Code/Desktop app용
#     skills/rules/commands 심볼릭 링크 + 캡처·동기화 hook + vault path 기록)
#   - 공개 검사 차단어 목록: 없으면 iCloud 백업 사본을 로컬로 복사
#     (launchd 워처는 iCloud 경로를 못 읽으므로 반드시 로컬 실파일)
#   - bash scripts/install-launchd.sh (자동 push 워처 + Aside 캡처) — fswatch가 있을 때
#   - bash scripts/install-aside.sh (Aside 스킬 링크 + AGENTS.md 캡처 규칙) — Aside가 있을 때
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

# ── 3. 공개 검사 차단어 목록 ────────────────────────────────
# 원본은 로컬 실파일. iCloud 백업 사본은 Stop hook(sync-claude-configs.mjs)이 갱신한다
DENY_LOCAL="$HOME/.claude/learning-capture/public-denylist.txt"
DENY_BACKUP="$HOME/Library/Mobile Documents/com~apple~CloudDocs/claude/claude-code-home-backup/learning-capture/public-denylist.txt"
mkdir -p "$(dirname "$DENY_LOCAL")"
if [ -f "$DENY_LOCAL" ] && [ ! -L "$DENY_LOCAL" ]; then
  ok "차단어 목록: 로컬에 있음"
else
  # 예전 방식의 링크가 남아 있으면 먼저 지운다 — 아래 쓰기가 링크를 따라가 다른 파일을 덮지 않게
  [ -L "$DENY_LOCAL" ] && rm -f "$DENY_LOCAL"
  if [ -f "$DENY_BACKUP" ]; then
    cp "$DENY_BACKUP" "$DENY_LOCAL"
    ok "차단어 목록: iCloud 백업에서 복사"
  else
    printf '# 공개 레포에 올라가면 안 되는 단어 (한 줄에 하나, 대소문자 무시)\n# 회사명·내부 서비스명·내부 도메인·이메일 등\n' > "$DENY_LOCAL"
    warn "차단어 목록을 새로 만들었습니다 — 회사명 등을 채우세요: $DENY_LOCAL"
    warn "iCloud 동기화가 아직 덜 끝났다면, 끝난 뒤 bootstrap을 다시 실행하면 백업에서 가져옵니다 (빈 양식은 백업을 덮어쓰지 않음)"
  fi
fi
echo ""

# ── 4. launchd 작업 (자동 push 워처 + Aside 캡처) ───────────
# 하위 설치가 실패해도 나머지 단계는 계속 진행한다
if [ "$(uname)" = "Darwin" ] && command -v fswatch &>/dev/null; then
  bash scripts/install-launchd.sh || warn "launchd 설치 실패 — 나중에 다시: bash scripts/install-launchd.sh"
else
  warn "fswatch 없음 — 설치 후 다시 실행: brew install fswatch && bash scripts/install-launchd.sh"
fi
echo ""

# ── 5. Aside 연결 ───────────────────────────────────────────
bash scripts/install-aside.sh || warn "Aside 연결 실패 — 나중에 다시: bash scripts/install-aside.sh"
echo ""

# ── 6. 마무리 안내 ──────────────────────────────────────────
echo "════════════════════════════════════════════════════"
ok "Bootstrap 완료"
echo ""
echo "  설치된 것:"
echo "    - Claude Code skills / rules / commands → ~/.claude/..."
echo "    - 캡처·동기화 hooks → ~/.claude/settings.json"
echo "    - Vault 절대경로 → ~/.claude/learning-vault.path"
echo "    - 차단어 목록 → $DENY_LOCAL"
echo "    - launchd: 자동 push 워처 + Aside 캡처 (fswatch가 있을 때)"
echo "    - Aside 스킬 링크 + AGENTS.md 캡처 규칙 (Aside가 있을 때)"
echo ""
warn "확인할 것:"
echo "  - claude 로그인 상태 (캡처 추출에 필요): claude -p 'ok'"
echo "  - Claude Desktop chat app 사용 시: bash scripts/setup-claude-desktop.sh"
echo "════════════════════════════════════════════════════"
