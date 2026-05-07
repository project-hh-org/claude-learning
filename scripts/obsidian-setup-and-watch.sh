#!/bin/bash
# =============================================================
# Obsidian Vault — Git 초기 설정 + 자동 push 워처
#
# 볼트 경로: /Users/hwangdahee/Documents/obsidianVault
#
# 처음 한 번만 실행 (git 설정):
#   bash scripts/obsidian-setup-and-watch.sh --setup
#
# 이후 자동 push 워처 실행:
#   bash scripts/obsidian-setup-and-watch.sh
#
# macOS 로그인 시 자동 시작 (obsidian + learn 워처 동시 등록):
#   bash scripts/obsidian-setup-and-watch.sh --install
# =============================================================

VAULT_DIR="/Users/hwangdahee/Documents/obsidianVault"
REMOTE="https://github.com/dahee90522/obsidianVault.git"
DEBOUNCE_SECS=5
PLIST_LABEL="dev.dahee.obsidian-vault-watcher"
PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_LABEL}.plist"
LOG_PATH="/tmp/obsidian-watcher.log"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LEARN_INSTALL="$SCRIPT_DIR/install-launchd.sh"

# ── 색상 ──────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✅ $*${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $*${NC}"; }
err()  { echo -e "${RED}❌ $*${NC}"; }

# ── 최초 설정 ─────────────────────────────────────────────
setup() {
  echo "🔧 Obsidian Vault Git 설정 시작"
  cd "$VAULT_DIR" || { err "볼트 경로 없음: $VAULT_DIR"; exit 1; }

  [ -f ".git/index.lock" ] && rm -f .git/index.lock && ok "index.lock 제거"

  if [ ! -d ".git" ]; then
    git init
    git branch -m main
    ok "git init"
  else
    ok "git 이미 초기화됨"
  fi

  write_gitignore

  if [ -n "$REMOTE" ]; then
    if git remote | grep -q origin; then
      git remote set-url origin "$REMOTE"
    else
      git remote add origin "$REMOTE"
    fi
    ok "리모트: $REMOTE"
  else
    warn "REMOTE 변수가 비어있음. 스크립트 상단에 git 레포 URL을 입력하세요."
  fi

  if [ -n "$REMOTE" ]; then
    echo "⬇️  원격 내용 가져오는 중..."
    git fetch origin 2>/dev/null && \
      git pull --rebase origin main 2>/dev/null || \
      warn "pull 실패 (첫 설정이면 무시해도 됩니다)"
  fi

  git add .
  if git diff --cached --quiet; then
    warn "커밋할 변경사항 없음"
  else
    git commit -m "init: obsidian vault setup"
    ok "첫 커밋 완료"
  fi

  if [ -n "$REMOTE" ]; then
    git push -u origin main && ok "push 완료" || warn "push 실패 (나중에 수동으로 push 하세요)"
  fi

  echo ""
  ok "초기 설정 완료! 이제 워처를 시작하세요:"
  echo "   bash $0"
}

# ── .gitignore 작성 ────────────────────────────────────────
write_gitignore() {
  cat > "$VAULT_DIR/.gitignore" <<'GITIGNORE'
.obsidian/workspace.json
.obsidian/workspace-mobile.json
.obsidian/cache
.trash/
.DS_Store
Thumbs.db
*.env
GITIGNORE

  git rm --cached .obsidian/workspace.json        2>/dev/null
  git rm --cached .obsidian/workspace-mobile.json 2>/dev/null
  git rm --cached .obsidian/cache                  2>/dev/null

  ok ".gitignore 작성 (workspace.json 등 제외)"
}

# ── launchd 설치 ───────────────────────────────────────────
install_launchd() {
  SCRIPT_PATH="$(realpath "$0")"

  # 1. obsidian 워처 plist 등록
  cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>           <string>${PLIST_LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>${SCRIPT_PATH}</string>
  </array>
  <key>RunAtLoad</key>       <true/>
  <key>KeepAlive</key>       <true/>
  <key>StandardOutPath</key> <string>${LOG_PATH}</string>
  <key>StandardErrorPath</key><string>${LOG_PATH}</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
  </dict>
</dict>
</plist>
EOF

  launchctl unload "$PLIST_PATH" 2>/dev/null
  launchctl load   "$PLIST_PATH"
  ok "Obsidian 워처 등록 완료 (로그: tail -f $LOG_PATH)"

  # 2. learn 워처 plist 등록
  echo ""
  if [ -f "$LEARN_INSTALL" ]; then
    echo "🔧 Learn 워처도 함께 등록 중..."
    bash "$LEARN_INSTALL"
  else
    warn "install-launchd.sh 없음: $LEARN_INSTALL"
  fi
}

# ── 워처 본체 ─────────────────────────────────────────────
run_watcher() {
  if ! command -v fswatch &>/dev/null; then
    err "fswatch 없음: brew install fswatch"
    exit 1
  fi

  echo "👀 Obsidian Vault 감시 중: $VAULT_DIR"
  echo "📌 실제 노트 변경 시에만 자동 commit + push"
  echo "   종료: Ctrl+C"
  echo ""

  LAST_EVENT_FILE="/tmp/obsidian-watcher-last-event"

  fswatch -0 --event Created --event Updated --event Renamed \
    --exclude='\.obsidian' \
    --exclude='\.trash' \
    --exclude='\.DS_Store' \
    --include='\.(md|canvas|pdf|png|jpg)$' \
    "$VAULT_DIR" | \
  while IFS= read -r -d "" event; do
    date +%s > "$LAST_EVENT_FILE"

    (
      sleep "$DEBOUNCE_SECS"

      last=$(cat "$LAST_EVENT_FILE" 2>/dev/null || echo 0)
      now=$(date +%s)
      elapsed=$(( now - last ))
      [ "$elapsed" -lt "$DEBOUNCE_SECS" ] && exit 0

      cd "$VAULT_DIR" || exit 1

      CHANGED=$(git status --porcelain | grep -v '^!! ' | grep -v '\.obsidian')
      [ -z "$CHANGED" ] && exit 0

      echo "[$(date '+%H:%M:%S')] 변경 감지:"
      echo "$CHANGED" | head -5

      git pull --rebase origin main 2>&1 | grep -v '^$' | tail -3

      git add -- . ':!.obsidian/workspace.json' ':!.obsidian/workspace-mobile.json'

      COUNT=$(git diff --cached --name-only | wc -l | tr -d ' ')
      if [ "$COUNT" -eq 1 ]; then
        FILE=$(git diff --cached --name-only | head -1 | xargs basename | sed 's/\..*//')
        MSG="note: ${FILE}"
      else
        MSG="note: update ${COUNT} files"
      fi

      git commit -m "$MSG" || exit 0

      git push origin main && \
        echo "[$(date '+%H:%M:%S')] ✅ push: $MSG" || \
        echo "[$(date '+%H:%M:%S')] ⚠️  push 실패"
      echo ""
    ) &
  done
}

# ── 진입점 ────────────────────────────────────────────────
case "${1:-}" in
  --setup)   setup ;;
  --install) install_launchd ;;
  *)         run_watcher ;;
esac
