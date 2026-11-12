#!/bin/bash
# =============================================================
# install-aside.sh — Aside 브라우저 에이전트에 학습 캡처 연결
#
# - ~/.aside/u/0/skills/user/에 capture-concept · capture-idea 스킬 링크
# - ~/.aside/u/0/AGENTS.md에 캡처 규칙(scripts/aside-agents-capture.md)을 마커 블록으로 넣거나 갱신
#   (바꾸기 전 AGENTS.md.bak-<시각>으로 백업, 마커 밖 내용은 건드리지 않음)
#
# Aside가 없으면 아무것도 하지 않는다. 여러 번 실행해도 결과가 같다.
# 실행: bash scripts/install-aside.sh
# 테스트용: ASIDE_ROOT=<dir>
# =============================================================

set -uo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✅ $*${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $*${NC}"; }

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASIDE_ROOT="${ASIDE_ROOT:-$HOME/.aside/u/0}"
RULE_SRC="$REPO_ROOT/scripts/aside-agents-capture.md"

if [ ! -d "$ASIDE_ROOT" ]; then
  warn "Aside 없음($ASIDE_ROOT) — 건너뜀"
  exit 0
fi

# ── 스킬 링크 (실제 파일·폴더가 있으면 덮어쓰지 않음) ─────────
mkdir -p "$ASIDE_ROOT/skills/user"
for s in capture-concept capture-idea; do
  target="$ASIDE_ROOT/skills/user/$s"
  if [ -e "$target" ] && [ ! -L "$target" ]; then
    warn "skill skip: $target 는 실제 폴더 — 덮어쓰지 않음"
    continue
  fi
  ln -sfn "$REPO_ROOT/configs/skills/$s" "$target"
  ok "Aside skill 링크: $s"
done

# ── AGENTS.md 캡처 규칙 (마커 블록) ───────────────────────────
AGENTS="$ASIDE_ROOT/AGENTS.md"
[ -f "$AGENTS" ] || printf '# Agent Rules\n' > "$AGENTS"

# (macOS 기본 bash 3.2는 $( ) 안의 heredoc을 잘못 파싱하므로 결과 메시지는 node가 직접 출력한다)
node - "$AGENTS" "$RULE_SRC" <<'NODE' || { warn "AGENTS.md 갱신 실패"; exit 1; }
const fs = require('fs')
const [, , agentsPath, rulePath] = process.argv
const START = '<!-- claude-learning:capture -->'
const END = '<!-- /claude-learning:capture -->'
const HEADING = '## 배운 것·떠오른 것은 학습 vault에 캡처한다'

const text = fs.readFileSync(agentsPath, 'utf-8')
const block = `${START}\n${fs.readFileSync(rulePath, 'utf-8').trim()}\n${END}`

let next
if (text.includes(START) && text.includes(END)) {
  // 이미 설치됨 — 블록만 최신 원문으로 교체
  next = text.slice(0, text.indexOf(START)) + block + text.slice(text.indexOf(END) + END.length)
} else if (new RegExp(`^${HEADING}\\s*$`, 'm').test(text)) {
  // 마커 없이 손으로 넣었던 절 — 줄 맨 앞의 그 제목부터 다음 ## 전까지를 마커 블록으로 바꾼다
  const from = text.search(new RegExp(`^${HEADING}\\s*$`, 'm'))
  const rest = text.slice(from + HEADING.length)
  const nextHeading = rest.search(/\n## /)
  const to = nextHeading === -1 ? text.length : from + HEADING.length + nextHeading + 1
  next = text.slice(0, from) + block + '\n' + text.slice(to)
} else {
  next = text.replace(/\s*$/, '') + '\n\n\n' + block + '\n'
}

if (next === text) { console.log('\x1b[0;32m✅ AGENTS.md 캡처 규칙: 이미 최신\x1b[0m'); process.exit(0) }
fs.copyFileSync(agentsPath, `${agentsPath}.bak-${Date.now()}`)
fs.writeFileSync(agentsPath, next)
console.log('\x1b[0;32m✅ AGENTS.md 캡처 규칙 갱신 (백업: AGENTS.md.bak-*)\x1b[0m')
NODE
