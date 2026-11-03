#!/bin/bash
# =============================================================
# idea-safety-net.sh
#
# Claude Code Stop hook — 턴이 끝날 때마다 JSONL의 thinking·본문
# 텍스트를 스캔해 ideation 후보를 추출하고 ideas/_unsorted/에 떨군다.
# 세션당 파일 하나를 갱신하므로 턴마다 파일이 늘어나지 않는다.
#
# capture-idea 스킬이 1차로 떠오르는 즉시 ideas/ 또는 seeds/에
# 저장하지만, 누락된 발상이 있을 경우의 후처리 안전망.
#
# 등록: ~/.claude/settings.json (경로에 공백이 있으면 따옴표 필수)
#   "hooks": {
#     "Stop": [{
#       "hooks": [{
#         "type": "command",
#         "command": "bash \"<repo>/configs/hooks/idea-safety-net.sh\""
#       }]
#     }]
#   }
#
# stdin: Claude Code가 hook event JSON을 보냄
#        (session_id, cwd, transcript_path 포함)
# =============================================================

set -euo pipefail

# ── hook event 읽기 ────────────────────────────────────────
EVENT_JSON="$(cat)"
FIELDS="$(printf '%s' "$EVENT_JSON" | node -e '
let e = {}
try { e = JSON.parse(require("fs").readFileSync(0, "utf-8")) } catch {}
console.log([e.session_id, e.cwd, e.transcript_path].map(v => v || "").join("\n"))
')" || exit 0
# $(...)가 끝의 빈 줄을 지워 read가 EOF를 만나도 변수는 빈 값으로 채워진다.
{ IFS= read -r SESSION_ID; IFS= read -r CWD; IFS= read -r JSONL; } <<< "$FIELDS" || true

[ -z "$SESSION_ID" ] && exit 0
[ -z "$CWD" ] && CWD="$(pwd)"

# ── 세션 JSONL 경로 (transcript_path가 없을 때만 직접 계산) ─────
if [ -z "$JSONL" ]; then
  ENCODED_CWD="$(printf '%s' "$CWD" | sed 's/[^a-zA-Z0-9]/-/g')"
  JSONL="$HOME/.claude/projects/${ENCODED_CWD}/${SESSION_ID}.jsonl"
fi

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

# ── thinking·본문 텍스트 추출 → 키워드 매치 ────────────────────
# Node 한 줄로 처리 (JSON 파싱 안정성 위해)
TODAY="$(date +%Y-%m-%d)"
SESSION_SHORT="${SESSION_ID:0:8}"

node - "$JSONL" "$UNSORTED_DIR" "$TODAY" "$SESSION_SHORT" <<'NODE' || exit 0
const fs = require('fs')
const path = require('path')
const [, , jsonlPath, outDir, today, sessionShort] = process.argv

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

// thinking이 빈 값으로 기록되는 세션이 있어 본문 텍스트도 함께 본다.
const hits = new Map()
for (const line of lines) {
  let evt
  try { evt = JSON.parse(line) } catch { continue }
  const msg = evt?.message
  if (!msg || msg.role !== 'assistant') continue
  const blocks = Array.isArray(msg.content) ? msg.content : []
  for (const b of blocks) {
    const text = b.type === 'thinking' ? b.thinking : b.type === 'text' ? b.text : null
    if (typeof text !== 'string' || !text.trim()) continue
    if (PATTERNS.some(re => re.test(text))) hits.set(text, b.type)
  }
}

if (hits.size === 0) process.exit(0)

// 세션당 파일 하나. 첫 생성일을 유지하고, 내용이 같으면 다시 쓰지 않는다.
const existing = fs.readdirSync(outDir).find(f => f.endsWith(`-safety-net-${sessionShort}.md`))
const fname = existing || `${today}-safety-net-${sessionShort}.md`
const fileDate = fname.slice(0, 10)
const out = path.join(outDir, fname)

const body = [
  '---',
  `title: "[safety-net] 캡처 누락 후보 ${fileDate}"`,
  `date: "${fileDate}"`,
  `kind: "spark"`,
  `scope: "current-project"`,
  `source: "claude-code"`,
  `stage: "seedling"`,
  `tags: ["safety-net", "needs-review"]`,
  '---',
  '',
  '> 이 파일은 Stop hook이 thinking·본문을 스캔해 자동 추출한 **캡처 누락 후보**입니다.',
  '> 검토 후 의미 있는 항목만 `ideas/` 또는 `seeds/`로 정식 이동하고, 이 파일은 삭제하세요.',
  '',
  ...[...hits].map(([text, source], i) => [
    `## 후보 ${i + 1} (${source})`,
    '',
    '````',
    text.trim().slice(0, 1500),
    '````',
    '',
  ].join('\n')),
].join('\n')

if (existing && fs.readFileSync(out, 'utf-8') === body) process.exit(0)

fs.writeFileSync(out, body, 'utf-8')
console.error(`[idea-safety-net] ${hits.size} candidate(s) → ${out}`)
NODE

exit 0
