#!/bin/bash
# Vault → /lab sync, delivered as a PR from the `lab-sync` branch. Merging the PR deploys it.
#
# Trigger: Claude Code SessionEnd hook (installed copy: ~/.claude/hooks/lab-sync-pr.sh).
#   launchd jobs can't read iCloud Drive (macOS TCC: "Operation not permitted"); hooks started by
#   Claude Code can, so the hook is the trigger. Run by hand with `--foreground` to see the output.
# Works in its own worktree, so the main checkout's branch and files are never touched.
set -euo pipefail

REPO="${LAB_SYNC_REPO:-$HOME/development/portfolio}"
WT="${LAB_SYNC_WORKTREE:-$HOME/development/portfolio-wt-lab-sync}"
BRANCH=lab-sync
BASE=master
LOG=/tmp/portfolio-lab-sync.log
LOCK=/tmp/portfolio-lab-sync.lock
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

# Hook mode: return at once and finish in the background so session exit isn't delayed.
if [ "${1:-}" != "--foreground" ]; then
  cat >/dev/null 2>&1 || true
  nohup "$0" --foreground >>"$LOG" 2>&1 </dev/null &
  exit 0
fi

mkdir "$LOCK" 2>/dev/null || { echo "$(date '+%F %T') another sync is running"; exit 0; }
trap 'rmdir "$LOCK"' EXIT
echo "--- $(date '+%F %T')"

git -C "$REPO" fetch -q origin "$BASE"
if [ ! -d "$WT" ]; then
  git -C "$REPO" worktree add -q --detach "$WT" "origin/$BASE"
  ln -s "$REPO/node_modules" "$WT/node_modules"
fi
cd "$WT"
git reset -q --hard
git clean -qfd -- content
git checkout -q -B "$BRANCH" "origin/$BASE"
[ -f scripts/sync-lab.mts ] || { echo "scripts/sync-lab.mts is not on $BASE yet"; exit 0; }

yarn -s sync:lab
git add -A -- content/posts
[ -f content/.lab-sync.json ] && git add -- content/.lab-sync.json

OPEN_PR="$(gh pr list --head "$BRANCH" --state open --json number -q '.[].number')"
if git diff --cached --quiet; then
  echo "no changes against $BASE"
  if [ -n "$OPEN_PR" ]; then
    gh pr close "$OPEN_PR" --delete-branch --comment "볼트와 $BASE 사이에 차이가 없어져서 닫습니다."
  fi
  exit 0
fi

if ! yarn -s test >/dev/null 2>&1; then
  echo "content tests failed, not pushing"
  git diff --cached --stat
  exit 1
fi

CHANGED="$(git diff --cached --name-only -- content/posts | sed 's#content/posts/##; s#\.md$##' | paste -sd ',' - | sed 's/,/, /g')"
git commit -q -m "lab: 볼트 노트 동기화 (${CHANGED})"
git push -q -f origin "$BRANCH"
echo "pushed: ${CHANGED}"

if [ -z "$OPEN_PR" ]; then
  gh pr create --base "$BASE" --head "$BRANCH" --title "lab: 볼트 노트 동기화" --body "$(cat <<'EOF'
학습 볼트에서 `publish: true`인 concept 노트를 `content/posts`로 옮긴 자동 PR입니다.
`scripts/lab-sync-pr.sh`가 Claude Code 세션이 끝날 때 만들고, 이후 변경은 이 PR에 계속 반영됩니다.

머지 전 확인: 공개해도 되는 내용인지, summary와 category가 적절한지.
EOF
)"
fi
