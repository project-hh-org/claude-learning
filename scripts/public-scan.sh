#!/bin/bash
# =============================================================
# public-scan.sh — 공개 레포에 올라가면 안 되는 내용 기계 검사
#
# 사용:
#   bash scripts/public-scan.sh <file>...          파일 전체 검사
#   bash scripts/public-scan.sh --staged <path>... stage된 변경 중 추가된 줄만 검사
#
# 종료 코드: 0 = 깨끗함, 1 = 걸림 (걸린 줄을 stdout에 출력)
#
# 검사 대상:
#   - 자격증명 패턴 (AWS 키, sk-/ghp_/xox 토큰, 개인키 블록)
#   - 이 머신의 홈 경로 (/Users/<사용자>)
#   - 비공개 차단어 목록: ~/.claude/learning-capture/public-denylist.txt
#     (회사명·내부 도메인·이메일 등 — 목록 자체가 민감하므로 레포 밖에 둔다.
#      한 줄에 하나, 대소문자 무시, # 주석)
# =============================================================

set -uo pipefail

DENYLIST="${PUBLIC_DENYLIST:-$HOME/.claude/learning-capture/public-denylist.txt}"

WORK="$(mktemp -d "${TMPDIR:-/tmp}/public-scan.XXXXXX")" || exit 2
trap 'rm -rf "$WORK"' EXIT

# 정규식 패턴 (홈 경로는 메타문자를 이스케이프해서)
HOME_RE="$(printf '%s/' "$HOME" | sed 's/[][\.*^$+?(){}|]/\\&/g')"
cat > "$WORK/patterns" <<EOF
AKIA[0-9A-Z]{16}
sk-[A-Za-z0-9_-]{20,}
(ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{20,}
xox[abprs]-[A-Za-z0-9-]{10,}
-----BEGIN [A-Z ]*PRIVATE KEY-----
$HOME_RE
EOF

# 차단어: 주석·공백 줄 제거, 고정 문자열로 대소문자 무시 비교
# 목록이 있는데 읽지 못하면(권한·iCloud 접근 등) 통과시키지 않고 실패로 끝낸다 — 조용히 검사가 빠지지 않게
: > "$WORK/deny"
if [ -e "$DENYLIST" ] || [ -L "$DENYLIST" ]; then
  if ! sed 's/#.*//; s/^[[:space:]]*//; s/[[:space:]]*$//; /^$/d' "$DENYLIST" > "$WORK/deny" 2>/dev/null; then
    echo "차단어 목록을 읽을 수 없음: $DENYLIST — 검사 불가로 처리"
    exit 2
  fi
fi

# 입력: "<라벨>\t<줄 내용>" 스트림 → 걸린 줄의 라벨 출력
# 패턴은 내용에만 대조한다 (라벨의 절대 경로가 홈 경로 패턴에 걸리지 않게)
# grep을 파일 단위로 한 번씩만 돌린다 (줄마다 fork하면 큰 파일에서 수십 초 걸림)
scan_stream() {
  cat > "$WORK/stream"
  cut -f2- "$WORK/stream" > "$WORK/content"
  {
    grep -nE -f "$WORK/patterns" "$WORK/content" | cut -d: -f1 | sed 's/$/\t자격증명·홈 경로 패턴/'
    [ -s "$WORK/deny" ] && grep -niF -f "$WORK/deny" "$WORK/content" | cut -d: -f1 | sed 's/$/\t차단어/'
  } | sort -n > "$WORK/hits"
  [ -s "$WORK/hits" ] || return 0
  awk -F'\t' 'NR == FNR { label[FNR] = $1; next } { print label[$1] ": " $2 }' "$WORK/stream" "$WORK/hits"
  return 1
}

if [ "${1:-}" = "--staged" ]; then
  shift
  # 추가된 줄만, 파일명:줄번호 라벨을 붙여서
  git diff --cached -U0 --no-color -- "$@" | awk '
    /^\+\+\+ b\// { file = substr($0, 7); next }
    /^@@/ { split($3, a, ","); ln = substr(a[1], 2) + 0; next }
    /^\+/ { printf "%s:%d\t%s\n", file, ln, substr($0, 2); ln++ }
  ' | scan_stream
  exit $?
fi

[ $# -eq 0 ] && { echo "사용: $0 <file>... | --staged <path>..."; exit 2; }
for f in "$@"; do
  [ -f "$f" ] || continue
  awk -v f="$f" '{ printf "%s:%d\t%s\n", f, NR, $0 }' "$f"
done | scan_stream
