#!/bin/bash
# =============================================================
# macOS launchd 작업 2개 등록
#   dev.claude.learn-watcher  로그인 시 시작, 상주 — 노트·설정 폴더 자동 push (watch-and-push.sh)
#   dev.claude.aside-capture  30분마다 — Aside 대화에서 개념·발상 후보 추출 (llm-capture.sh --aside-sweep)
#
# 실행: bash scripts/install-launchd.sh
# 제거: bash scripts/install-launchd.sh --uninstall
# =============================================================

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PLIST_LABEL="dev.claude.learn-watcher"
PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_LABEL}.plist"
LOG_PATH="/tmp/claude-learn-watcher.log"
ASIDE_LABEL="dev.claude.aside-capture"
ASIDE_PLIST="$HOME/Library/LaunchAgents/${ASIDE_LABEL}.plist"
ASIDE_INTERVAL=1800

if [ "$1" = "--uninstall" ]; then
  for p in "$PLIST_PATH" "$ASIDE_PLIST"; do
    launchctl unload "$p" 2>/dev/null
    rm -f "$p"
  done
  echo "✅ 자동 시작 제거 완료"
  exit 0
fi

# fswatch 경로 확인
FSWATCH_PATH="$(which fswatch 2>/dev/null || echo /opt/homebrew/bin/fswatch)"
if [ ! -f "$FSWATCH_PATH" ]; then
  echo "❌ fswatch 없음. 먼저 설치하세요: brew install fswatch"
  exit 1
fi

# plist 생성
cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${PLIST_LABEL}</string>

  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>${REPO_DIR}/scripts/watch-and-push.sh</string>
  </array>

  <key>WorkingDirectory</key>
  <string>${REPO_DIR}</string>

  <key>RunAtLoad</key>
  <true/>

  <key>KeepAlive</key>
  <true/>

  <key>StandardOutPath</key>
  <string>${LOG_PATH}</string>

  <key>StandardErrorPath</key>
  <string>${LOG_PATH}</string>

  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
  </dict>
</dict>
</plist>
EOF

# 로드
launchctl unload "$PLIST_PATH" 2>/dev/null
# launchctl load는 실패해도 0을 반환하는 경우가 있어 등록 여부를 직접 확인한다
launchctl load "$PLIST_PATH"
if ! launchctl list | grep -q "$PLIST_LABEL"; then
  echo "❌ launchctl load 실패 (샌드박스/권한 문제일 수 있음). 터미널에서 직접 실행:"
  echo "   launchctl load \"$PLIST_PATH\""
  exit 1
fi

echo "✅ 자동 시작 등록 완료"
echo "   로그: tail -f $LOG_PATH"

# ── Aside 대화 캡처 (30분마다) ─────────────────────────────
# launchd에는 셸 PATH가 없으므로 지금 찾은 node·claude 위치를 넣는다 (nvm 등 버전 경로 포함)
if [ -d "$HOME/.aside/u/0/sessions" ]; then
  NODE_BIN="$(command -v node 2>/dev/null)"
  CLAUDE_BIN="$(command -v claude 2>/dev/null)"
  if [ -z "$NODE_BIN" ] || [ -z "$CLAUDE_BIN" ]; then
    echo "⚠️  node 또는 claude를 찾지 못해 Aside 캡처는 등록하지 않음"
  else
    cat > "$ASIDE_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${ASIDE_LABEL}</string>

  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>${REPO_DIR}/configs/hooks/llm-capture.sh</string>
    <string>--aside-sweep</string>
  </array>

  <key>StartInterval</key>
  <integer>${ASIDE_INTERVAL}</integer>

  <key>RunAtLoad</key>
  <true/>

  <key>StandardOutPath</key>
  <string>/tmp/claude-aside-capture.log</string>

  <key>StandardErrorPath</key>
  <string>/tmp/claude-aside-capture.log</string>

  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>$(dirname "$NODE_BIN"):$(dirname "$CLAUDE_BIN"):/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
  </dict>
</dict>
</plist>
EOF
    launchctl unload "$ASIDE_PLIST" 2>/dev/null
    launchctl load "$ASIDE_PLIST"
    if launchctl list | grep -q "$ASIDE_LABEL"; then
      echo "✅ Aside 캡처 등록 완료 (${ASIDE_INTERVAL}초마다) — 결과 로그: ~/.claude/learning-capture/capture.log"
    else
      echo "❌ Aside 캡처 등록 실패. 터미널에서 직접: launchctl load \"$ASIDE_PLIST\""
    fi
  fi
fi

echo "   상태: launchctl list | grep claude"
echo "   제거: bash scripts/install-launchd.sh --uninstall"
