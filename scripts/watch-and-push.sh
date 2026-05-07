#!/bin/bash
# =============================================================
# Claude Learning Log — 전체 레포 자동 push 워처
#
# 사전 준비:  brew install fswatch
# 실행:       bash scripts/watch-and-push.sh
# 백그라운드: nohup bash scripts/watch-and-push.sh \
#               > /tmp/learn-watcher.log 2>&1 &
#             echo $! > /tmp/learn-watcher.pid
# 종료:       kill $(cat /tmp/learn-watcher.pid)
# =============================================================

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEBOUNCE_SECS=4          # 마지막 이벤트 후 N초 기다렸다가 커밋

echo "👀 감시 시작: 전체 레포 ($REPO_DIR)"
echo "📌 git이 추적하는 파일에 변경사항이 있을 때만 자동 commit + push"
echo "   종료: Ctrl+C"
echo ""

if ! command -v fswatch &>/dev/null; then
  echo "❌ fswatch 없음: brew install fswatch"
  exit 1
fi

# --- debounce 처리 ---
LAST_EVENT_FILE="/tmp/learn-watcher-last-event"

fswatch -0 --event Created --event Updated --event Renamed \
  --exclude='\.git' \
  --exclude='node_modules' \
  --exclude='\.next' \
  --exclude='out/' \
  "$REPO_DIR" | \
while IFS= read -r -d "" event; do
  date +%s > "$LAST_EVENT_FILE"

  (
    sleep "$DEBOUNCE_SECS"
    last=$(cat "$LAST_EVENT_FILE" 2>/dev/null || echo 0)
    now=$(date +%s)
    elapsed=$(( now - last ))
    [ "$elapsed" -lt "$DEBOUNCE_SECS" ] && exit 0

    cd "$REPO_DIR" || exit 1

    # git이 추적하는 파일 중 실제 변경된 것만
    CHANGED=$(git status --porcelain 2>/dev/null | grep -v '^!!' | grep -v 'node_modules' | grep -v '\.next')
    [ -z "$CHANGED" ] && exit 0

    echo "📝 변경된 파일:"
    echo "$CHANGED"

    echo "⬇️  pull --rebase..."
    git pull --rebase origin main 2>&1 | tail -3

    git add -A

    # 변경 파일 목록으로 커밋 메시지 생성
    FILES=$(git diff --cached --name-only | grep -v 'node_modules' | tr '\n' ', ' | sed 's/,$//')
    COMMIT_MSG="learn: ${FILES}"
    [ ${#COMMIT_MSG} -gt 72 ] && COMMIT_MSG="${COMMIT_MSG:0:69}..."

    git commit -m "$COMMIT_MSG" || exit 0

    echo "🚀 push 중..."
    git push origin main && echo "✅ push 완료" || echo "⚠️  push 실패"
    echo ""
  ) &
done
