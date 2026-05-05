#!/bin/bash
# =============================================================
# Claude Learning Log — entries/ 자동 push 워처
#
# 사전 준비:
#   brew install fswatch
#
# 실행:
#   bash scripts/watch-and-push.sh
#
# 백그라운드 실행:
#   nohup bash scripts/watch-and-push.sh > /tmp/learn-watcher.log 2>&1 &
#   echo $! > /tmp/learn-watcher.pid
#
# 종료:
#   kill $(cat /tmp/learn-watcher.pid)
# =============================================================

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WATCH_DIR="$REPO_DIR/entries"

echo "👀 감시 시작: $WATCH_DIR"
echo "📌 새 .md 파일 저장 시 자동으로 git commit + push 됩니다"
echo "   종료: Ctrl+C"
echo ""

# fswatch 설치 확인
if ! command -v fswatch &>/dev/null; then
  echo "❌ fswatch가 없습니다. 설치 후 다시 실행하세요:"
  echo "   brew install fswatch"
  exit 1
fi

# 파일 변경 감지 후 push 함수
do_push() {
  local changed_file="$1"
  local filename="$(basename "$changed_file")"

  # .md 파일만 처리
  [[ "$filename" != *.md ]] && return

  cd "$REPO_DIR"

  # 변경사항 있는지 확인
  if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
    return
  fi

  echo "📝 변경 감지: $filename"

  git add entries/

  # 커밋 메시지: 파일명에서 날짜/제목 추출
  local commit_msg="learn: add ${filename%.md}"

  git commit -m "$commit_msg" 2>/dev/null || {
    echo "ℹ️  커밋할 내용 없음"
    return
  }

  git push origin main && echo "✅ push 완료: $filename" || echo "⚠️  push 실패 (인터넷 연결 확인)"
  echo ""
}

# fswatch로 entries/ 폴더 감시
fswatch -0 --event Created --event Updated --event Renamed "$WATCH_DIR" | \
  while IFS= read -r -d "" event; do
    do_push "$event"
  done
