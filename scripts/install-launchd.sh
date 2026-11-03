#!/bin/bash
# =============================================================
# macOS 로그인 시 watch-and-push 자동 시작 설정
#
# 실행: bash scripts/install-launchd.sh
# 제거: bash scripts/install-launchd.sh --uninstall
# =============================================================

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PLIST_LABEL="dev.claude.learn-watcher"
PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_LABEL}.plist"
LOG_PATH="/tmp/claude-learn-watcher.log"

if [ "$1" = "--uninstall" ]; then
  launchctl unload "$PLIST_PATH" 2>/dev/null
  rm -f "$PLIST_PATH"
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
echo "   상태: launchctl list | grep claude"
echo "   제거: bash scripts/install-launchd.sh --uninstall"
