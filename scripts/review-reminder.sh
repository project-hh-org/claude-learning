#!/bin/bash
# =============================================================
# review-reminder.sh — 캡처 후보 검토 알림 (launchd 주간 작업)
#
# concepts/_unsorted · ideas/_unsorted에 쌓인 후보 수를 세서,
# 1건 이상이면 macOS 알림으로 /review-captures 실행을 권한다.
# Claude를 호출하지 않으므로 비용이 없다.
#
# 등록: scripts/install-launchd.sh (dev.claude.review-reminder, 매주 월요일 10:00)
# 직접 실행: bash scripts/review-reminder.sh
# =============================================================

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"

count() { find "$REPO_DIR/$1" -maxdepth 1 -name '*.md' 2>/dev/null | wc -l | tr -d ' '; }
CONCEPTS=$(count concepts/_unsorted)
IDEAS=$(count ideas/_unsorted)
TOTAL=$((CONCEPTS + IDEAS))

echo "[$(date '+%Y-%m-%d %H:%M')] 검토 대기 후보: ${TOTAL}건 (개념 ${CONCEPTS}, 발상 ${IDEAS})"
[ "$TOTAL" -eq 0 ] && exit 0

/usr/bin/osascript -e "display notification \"개념 ${CONCEPTS}건, 발상 ${IDEAS}건 — Claude Code에서 /review-captures\" with title \"학습 캡처 검토 대기 ${TOTAL}건\" sound name \"default\""
