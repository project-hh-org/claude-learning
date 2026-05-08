#!/bin/bash
# =============================================================
# idea-safety-net.sh
#
# Claude Code Stop hook — 세션 종료 시 JSONL의 thinking 블록을
# 스캔해 ideation 후보를 추출하고 ideas/_unsorted/에 떨군다.
#
# capture-idea 스킬이 1차로 떠오르는 즉시 ideas/ 또는 seeds/에
# 저장하지만, 누락된 발상이 있을 경우의 후처리 안전망.
#
# 등록: ~/.claude/settings.json
#   "hooks": {
#     "Stop": [{
#       "matcher": ".*",
#       "hooks": [{
#         "type": "command",
#         "command": "bash <repo>/configs/hooks/idea-safety-net.sh"
#       }]
#     }]
#   }
#
# stdin: Claude Code가 hook event JSON을 보냄 (session_id 포함)
# =============================================================

set -euo pipefail

# ── hook event 읽기 ────────────────────────────────────────
EVENT_JSON="$(cat)"
SESSION_ID="$(echo "$EVENT_JSON" | grep -o '"session_id":"[^"]*"' | head -1 | cut -d'"' -f4 || true)"
CWD="$(echo "$EVENT_JSON" | grep -o '"cwd":"[^"]*"' | head -1 | cut -d'"' -f4 || pwd)"

[ -z "$SESSION_ID" ] && exit 0

# ── 세션 JSONL 경로 ────────────────────────────────────────
ENCODED_CWD="$(echo "$CWD" | sed 's|/|-|g')"
JSONL="$HOME/.claude/projects/${ENCODED_CWD}/${SESSION_ID}.jsonl"

[ ! -f "$JSONL" ] && exit 0

# ── 이미 capture된 idea 슬러그가 있으면 중복 검사용으로 모음 ────
# ── Vault 결정: ~/.claude/learning-vault.path 우선, 없으면 cwd ──
VAULT_PATH_FILE="$HOME/.claude/learning-vault.path"
if [ -s "$VAULT_PATH_FILE" ]; then
  REPO_ROOT="$(head -n1 "$VAULT_PATH_FILE" | tr -d '\r\n')"
else
  REPO_ROOT="$CWD"
fi
[ -d "$REPO_ROOT/ideas" ] || exit 0

UNSORTED_DIR="$REPO_ROOT/ideas/_unsorted"
mkdir -p "$UNSORTED_DIR"

# ── thinking 블록만 추출 → 키워드 매치 ────────────────────────
# Node 한 줄로 처리 (JSON 파싱 안정성 위해)
TODAY="$(date +%Y-%m-%d)"
NOW_TS="$(date +%H%M%S)"

node - "$JSONL" "$UNSORTED_DIR" "$TODAY" "$NOW_TS" <<'NODE' || exit 0
const fs = require('fs')
const path = require('path')
const [, , jsonlPath, outDir, today, ts] = process.argv

const PATTERNS = [
  /이런\s*방법도/,
  /이렇게도\s*할\s*수\s*있/,
  /다음에\s*[^.]{0,30}시도/,
  /만들어보?면\s*(좋|재미|괜찮)/,
  /별개[의로]?\s*프로/,
  /별도\s*(도구|서비스|프로젝트)/,
  /이거\s*[^.]{0,30}만들/,
  /(would be cool|could try|might be worth|side idea)/i,
]

if (!fs.existsSync(jsonlPath)) process.exit(0)
const lines = fs.readFileSync(jsonlPath, 'utf-8').split('\n').filter(Boolean)

const hits = []
for (const line of lines) {
  let evt
  try { evt = JSON.parse(line) } catch { continue }
  const msg = evt?.message
  if (!msg || msg.role !== 'assistant') continue
  const blocks = Array.isArray(msg.content) ? msg.content : []
  for (const b of blocks) {
    if (b.type !== 'thinking' || typeof b.thinking !== 'string') continue
    for (const re of PATTERNS) {
      if (re.test(b.thinking)) {
        hits.push(b.thinking)
        break
      }
    }
  }
}

if (hits.length === 0) process.exit(0)

const fname = `${today}-safety-net-${ts}.md`
const out = path.join(outDir, fname)

const body = [
  '---',
  `title: "[safety-net] 캡처 누락 후보 ${today}"`,
  `date: "${today}"`,
  `kind: "spark"`,
  `scope: "current-project"`,
  `source: "claude-code"`,
  `stage: "seedling"`,
  `tags: ["safety-net", "needs-review"]`,
  '---',
  '',
  '> 이 파일은 Stop hook이 thinking을 스캔해 자동 추출한 **캡처 누락 후보**입니다.',
  '> 검토 후 의미 있는 항목만 `ideas/` 또는 `seeds/`로 정식 이동하고, 이 파일은 삭제하세요.',
  '',
  ...hits.map((h, i) => [
    `## 후보 ${i + 1}`,
    '',
    '```',
    h.trim().slice(0, 1500),
    '```',
    '',
  ].join('\n')),
].join('\n')

fs.writeFileSync(out, body, 'utf-8')
console.error(`[idea-safety-net] ${hits.length} candidate(s) → ${out}`)
NODE

exit 0
