#!/bin/bash
# =============================================================
# Claude Learning Log — 노트 폴더 자동 push 워처
#
# 감시·커밋 범위: NOTE_DIRS(entries/ concepts/ ideas/ seeds/)만.
# src/ 등 코드 변경은 건드리지 않는다 — 작업 중인 코드가 섞여 배포되는 것 방지.
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
BRANCH="main"
NOTE_DIRS=(entries concepts ideas seeds)

echo "👀 감시 시작: ${NOTE_DIRS[*]} ($REPO_DIR)"
echo "📌 노트 폴더에 변경사항이 있을 때만 자동 commit + push"
echo "   종료: Ctrl+C"
echo ""

if ! command -v fswatch &>/dev/null; then
  echo "❌ fswatch 없음: brew install fswatch"
  exit 1
fi

# --- debounce 처리 ---
LAST_EVENT_FILE="/tmp/learn-watcher-last-event"

# 없는 폴더가 pathspec에 섞이면 git add/commit 전체가 실패하므로 존재하는 것만
NOTE_PATHS=()
WATCH_PATHS=()
for d in "${NOTE_DIRS[@]}"; do
  if [ -d "$REPO_DIR/$d" ]; then
    NOTE_PATHS+=("$d")
    WATCH_PATHS+=("$REPO_DIR/$d")
  fi
done
[ ${#NOTE_PATHS[@]} -eq 0 ] && { echo "❌ 감시할 노트 폴더 없음"; exit 1; }

# git 작업 직렬화용 lock (subshell끼리 index.lock 경쟁 방지). 이전 실행이 죽으며 남긴 lock은 시작 시 정리
LOCK_DIR="$REPO_DIR/.git/learn-watcher.lock"
rmdir "$LOCK_DIR" 2>/dev/null

fswatch -0 --event Created --event Updated --event Renamed --event Removed \
  --exclude='/_unsorted/' \
  "${WATCH_PATHS[@]}" | \
while IFS= read -r -d "" event; do
  date +%s > "$LAST_EVENT_FILE"

  (
    sleep "$DEBOUNCE_SECS"
    last=$(cat "$LAST_EVENT_FILE" 2>/dev/null || echo 0)
    now=$(date +%s)
    elapsed=$(( now - last ))
    [ "$elapsed" -lt "$DEBOUNCE_SECS" ] && exit 0

    cd "$REPO_DIR" || exit 1

    # 다른 git 작업이 돌고 있으면 이번 이벤트는 건너뛴다 (다음 이벤트 때 재시도)
    mkdir "$LOCK_DIR" 2>/dev/null || exit 0
    trap 'rmdir "$LOCK_DIR" 2>/dev/null' EXIT

    # 다른 브랜치 작업 중이면 건드리지 않는다
    CURRENT=$(git branch --show-current)
    if [ "$CURRENT" != "$BRANCH" ]; then
      [ -z "$CURRENT" ] && echo "⚠️  detached HEAD/rebase 진행 중 — 자동 push 중단됨. 레포 상태를 직접 정리하세요."
      exit 0
    fi

    # 노트 폴더 안의 변경만 (gitignore된 _unsorted/는 status에 안 나옴)
    CHANGED=$(git status --porcelain -- "${NOTE_PATHS[@]}" 2>/dev/null)
    [ -z "$CHANGED" ] && exit 0

    echo "📝 변경된 파일:"
    echo "$CHANGED"

    git add -A -- "${NOTE_PATHS[@]}"

    # 변경 파일 목록으로 커밋 메시지 생성
    FILES=$(git diff --cached --name-only -- "${NOTE_PATHS[@]}" | tr '\n' ', ' | sed 's/,$//')
    [ -z "$FILES" ] && exit 0
    COMMIT_MSG="learn: ${FILES}"
    [ ${#COMMIT_MSG} -gt 72 ] && COMMIT_MSG="${COMMIT_MSG:0:69}..."

    # pathspec 커밋: 노트 폴더 밖에 stage된 파일이 있어도 이 커밋엔 안 들어간다
    git commit -m "$COMMIT_MSG" -- "${NOTE_PATHS[@]}" || exit 0

    # 아직 push 안 한 코드 커밋이 있으면 노트와 함께 배포되므로 push 보류 (노트 커밋은 로컬에 남음)
    UNPUSHED_CODE=$(git log --format='%h %s' "origin/$BRANCH..HEAD" -- . \
      $(printf ":(exclude)%s " "${NOTE_PATHS[@]}"))
    if [ -n "$UNPUSHED_CODE" ]; then
      echo "⏸️  push 보류: 아직 push 안 한 코드 커밋이 있음 — 직접 push하면 노트도 같이 올라감"
      echo "$UNPUSHED_CODE"
      exit 0
    fi

    echo "🚀 push 중..."
    git push origin "$BRANCH" 2>&1 && { echo "✅ push 완료"; echo ""; exit 0; }

    # 원격이 앞서 있는 경우만 rebase. 코드 쪽 미커밋 변경이 있으면 작업 파일을 건드리지 않도록 자동 rebase 생략
    if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
      echo "⚠️  push 거절 + 로컬 미커밋 변경 있음 — 자동 rebase 생략. 정리 후 직접: git pull --rebase && git push"
      exit 1
    fi

    echo "⬇️  pull --rebase..."
    PULL_OUT=$(git pull --rebase origin "$BRANCH" 2>&1); PULL_RC=$?
    echo "$PULL_OUT" | tail -3
    if [ "$PULL_RC" -ne 0 ]; then
      git rebase --abort 2>/dev/null
      echo "❌ pull --rebase 실패 (충돌 등) — rebase 취소함. 직접 정리하세요: git pull --rebase"
      exit 1
    fi

    git push origin "$BRANCH" && echo "✅ push 완료" || echo "⚠️  push 실패"
    echo ""
  ) &
done
