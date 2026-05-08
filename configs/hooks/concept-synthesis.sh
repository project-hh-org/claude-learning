#!/bin/bash
# =============================================================
# concept-synthesis.sh
#
# Claude Code Stop hook — 세션 종료 시 JSONL을 스캔해 사용자가
# "정의/원리"를 학습한 순간(Q&A 쌍)을 추출하고 concepts/_unsorted/
# 에 seedling 후보를 떨군다. capture-concept skill이 1차로 잡지
# 못한 것을 종합 합성으로 보강하는 안전망.
#
# 등록 (~/.claude/settings.json):
#   "hooks": {
#     "Stop": [{
#       "matcher": ".*",
#       "hooks": [{
#         "type": "command",
#         "command": "bash <repo>/configs/hooks/concept-synthesis.sh"
#       }]
#     }]
#   }
#
# stdin: Claude Code가 hook event JSON을 보냄
# =============================================================

set -euo pipefail

EVENT_JSON="$(cat)"
SESSION_ID="$(echo "$EVENT_JSON" | grep -o '"session_id":"[^"]*"' | head -1 | cut -d'"' -f4 || true)"
CWD="$(echo "$EVENT_JSON" | grep -o '"cwd":"[^"]*"' | head -1 | cut -d'"' -f4 || pwd)"

[ -z "$SESSION_ID" ] && exit 0

ENCODED_CWD="$(echo "$CWD" | sed 's|/|-|g')"
JSONL="$HOME/.claude/projects/${ENCODED_CWD}/${SESSION_ID}.jsonl"

[ ! -f "$JSONL" ] && exit 0

# ── Vault 결정: ~/.claude/learning-vault.path 우선, 없으면 cwd ──
VAULT_PATH_FILE="$HOME/.claude/learning-vault.path"
if [ -s "$VAULT_PATH_FILE" ]; then
  REPO_ROOT="$(head -n1 "$VAULT_PATH_FILE" | tr -d '\r\n')"
else
  REPO_ROOT="$CWD"
fi
[ -d "$REPO_ROOT/concepts" ] || exit 0

UNSORTED_DIR="$REPO_ROOT/concepts/_unsorted"
mkdir -p "$UNSORTED_DIR"

TODAY="$(date +%Y-%m-%d)"
NOW_TS="$(date +%H%M%S)"

node - "$JSONL" "$UNSORTED_DIR" "$REPO_ROOT/concepts" "$TODAY" "$NOW_TS" <<'NODE' || exit 0
const fs = require('fs')
const path = require('path')
const [, , jsonlPath, outDir, conceptsDir, today, ts] = process.argv

// ── 사용자가 정의를 묻는 패턴 ─────────────────────────────
const DEF_PATTERNS = [
  /^(.{1,80}?)(이|가)\s*(뭐|무엇)/,
  /^(.{1,80}?)(이란|란)\s*$/,
  /^(.{1,80}?)\s*설명해/,
  /^(.{1,80}?)\s*어떻게\s*동작/,
  /^(.{1,80}?)\s*(원리|메커니즘|작동방식)/,
  /^what is (.{1,80})/i,
  /^how does (.{1,80}?) work/i,
  /^explain (.{1,80})/i,
]

if (!fs.existsSync(jsonlPath)) process.exit(0)
const lines = fs.readFileSync(jsonlPath, 'utf-8').split('\n').filter(Boolean)

// ── 메시지 시퀀스 파싱 ────────────────────────────────────
const events = []
for (const line of lines) {
  try {
    const evt = JSON.parse(line)
    const msg = evt?.message
    if (!msg) continue
    if (msg.role === 'user') {
      const text = typeof msg.content === 'string'
        ? msg.content
        : (msg.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n')
      if (text.trim()) events.push({ role: 'user', text: text.trim() })
    } else if (msg.role === 'assistant') {
      const text = (msg.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n')
      if (text.trim()) events.push({ role: 'assistant', text: text.trim() })
    }
  } catch {}
}

// ── 기존 concept slug 모음 (중복 방지) ───────────────────
const existingSlugs = new Set()
if (fs.existsSync(conceptsDir)) {
  for (const f of fs.readdirSync(conceptsDir)) {
    if (f.endsWith('.md')) existingSlugs.add(f.replace(/\.md$/, ''))
  }
}

function slugify(topic) {
  // 한글 포함 시 의역 어려우므로 ASCII만 추출 + 길이 제한
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'concept'
}

// ── 정의 Q&A 쌍 추출 ──────────────────────────────────────
const candidates = []
for (let i = 0; i < events.length - 1; i++) {
  if (events[i].role !== 'user' || events[i+1].role !== 'assistant') continue
  const userMsg = events[i].text
  const asstMsg = events[i+1].text

  let topic = null
  for (const re of DEF_PATTERNS) {
    const m = userMsg.match(re)
    if (m && m[1]) { topic = m[1].trim(); break }
  }
  if (!topic) continue

  // 응답이 너무 짧으면 (정의가 아닐 가능성) 스킵
  if (asstMsg.length < 200) continue

  candidates.push({ topic, userMsg, asstMsg })
}

if (candidates.length === 0) process.exit(0)

// ── concepts/_unsorted/ 에 후보 파일 생성 ─────────────────
const fname = `${today}-synthesis-${ts}.md`
const out = path.join(outDir, fname)

const body = [
  '---',
  `title: "[concept-synthesis] 합성 후보 ${today}"`,
  `date: "${today}"`,
  'kind: "concept-candidates"',
  `source: "claude-code"`,
  'stage: "seedling"',
  'tags: ["synthesis", "needs-review"]',
  '---',
  '',
  '> 이 파일은 Stop hook(`concept-synthesis.sh`)이 세션 JSONL에서',
  '> 정의·원리 Q&A 쌍을 추출한 **합성 후보**입니다.',
  '> 각 후보를 검토 후 가치 있는 것만 정식 concept 파일로 옮기고',
  '> (`concepts/<slug>.md`, frontmatter 정비), 이 파일은 삭제하세요.',
  '',
  ...candidates.map((c, i) => {
    const suggestedSlug = slugify(c.topic)
    const dupNote = existingSlugs.has(suggestedSlug)
      ? `> ⚠️ 기존 concept과 슬러그 충돌 가능성: \`${suggestedSlug}\` — 보강 검토`
      : `> 제안 슬러그: \`${suggestedSlug}\``
    return [
      `## 후보 ${i + 1}: ${c.topic}`,
      '',
      dupNote,
      '',
      '### 사용자 질문',
      '',
      '> ' + c.userMsg.split('\n').join('\n> '),
      '',
      '### Claude의 답변 (요약 후보)',
      '',
      c.asstMsg.length > 1500 ? c.asstMsg.slice(0, 1500) + '\n\n... (이하 생략)' : c.asstMsg,
      '',
    ].join('\n')
  }),
].join('\n')

fs.writeFileSync(out, body, 'utf-8')
console.error(`[concept-synthesis] ${candidates.length} candidate(s) → ${out}`)
NODE

exit 0
