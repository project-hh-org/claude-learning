#!/bin/bash
# =============================================================
# llm-capture.sh
#
# Claude Code Stop / SessionEnd hook — 대화에서 새로 배운 개념과
# 만들어볼 만한 발상을 작은 모델(claude -p, haiku)이 골라
# concepts/_unsorted/ · ideas/_unsorted/ 에 seedling 후보로 떨군다.
# 정규식 안전망(idea-safety-net · concept-synthesis)을 대체한다.
#
# 동작:
#   - 세션별로 마지막 처리 위치(transcript 줄 번호)를 기록하고 그 뒤만 본다
#   - Stop: 새 사용자 메시지가 MIN_USER_TURNS 이상 쌓였을 때만 처리
#     (Desktop 세션은 며칠씩 이어져 SessionEnd만으로는 거의 안 돈다)
#   - SessionEnd: 남은 부분을 모두 처리
#   - 모델 호출은 백그라운드 — hook 자체는 바로 끝난다
#   - 결과는 gitignore된 _unsorted/에만 쓴다 (공개 전 사람이 검토)
#
# Aside 모드 (--aside-sweep, launchd가 30분마다 실행 — scripts/install-launchd.sh):
#   - Aside는 hook이 없으므로 ~/.aside/u/0/sessions/*/messages.jsonl을 주기적으로 훑는다
#   - 세션별 처리 위치는 바이트 오프셋 — 파일 크기만 보고 바뀐 세션의 새 부분만 읽는다
#   - 첫 실행은 현재 크기를 기준점으로만 기록한다 (과거 대화는 처리하지 않음)
#   - 새 사용자 메시지 MIN_USER_TURNS 이상, 또는 2시간 넘게 멈춘 세션이면 처리
#   - 결과 파일은 source: "aside"
#
# 등록 (~/.claude/settings.json — install-claude-config.sh가 머지):
#   "Stop":       [{ "hooks": [{ "type": "command", "command": "bash \"<repo>/configs/hooks/llm-capture.sh\"" }] }]
#   "SessionEnd": [{ "hooks": [{ "type": "command", "command": "bash \"<repo>/configs/hooks/llm-capture.sh\"" }] }]
#
# 로그: ~/.claude/learning-capture/capture.log
# 테스트용: LEARNING_VAULT=<dir> LEARNING_CAPTURE_STATE=<dir> ASIDE_SESSIONS=<dir>
# =============================================================

set -uo pipefail

# 이 hook이 띄운 claude -p 세션이 다시 hook을 부르는 재귀 방지
[ -n "${CLAUDE_LEARNING_CAPTURE:-}" ] && exit 0

STATE_DIR="${LEARNING_CAPTURE_STATE:-$HOME/.claude/learning-capture}"
LOG="$STATE_DIR/capture.log"
MIN_USER_TURNS=3
MODEL="haiku"
EXTRACT_TIMEOUT="${EXTRACT_TIMEOUT:-300}"   # claude -p 호출 하나의 상한(초)
mkdir -p "$STATE_DIR/batches"

VAULT="${LEARNING_VAULT:-$(head -n1 "$HOME/.claude/learning-vault.path" 2>/dev/null | tr -d '\r\n')}"
[ -d "$VAULT/concepts" ] && [ -d "$VAULT/ideas" ] || exit 0

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG"; }

# ── 2단계 (백그라운드): 모델 호출 → 후보 파일 쓰기 ────────────
if [ "${1:-}" = "--extract" ]; then
  BATCH="$2"
  [ -f "$BATCH" ] || exit 0

  SCHEMA='{"type":"object","properties":{"items":{"type":"array","maxItems":5,"items":{"type":"object","properties":{"kind":{"type":"string","enum":["concept","idea"]},"slug":{"type":"string"},"title":{"type":"string"},"summary":{"type":"string"},"tags":{"type":"array","items":{"type":"string"},"maxItems":3},"body":{"type":"string"}},"required":["kind","slug","title","summary","tags","body"]}}},"required":["items"]}'

  PROMPT='너는 개발 학습 로그의 캡처 필터다. 입력은 사용자와 AI 어시스턴트(Claude Code 또는 Aside 브라우저 에이전트) 대화의 일부다.
사용자가 이 대화에서 새로 알게 된 재사용 가능한 개념·원리·패턴(kind=concept)과,
대화 중 나온 만들어볼 만한 발상(kind=idea)만 골라 items로 반환하라.

- 이 대화의 작업 기록, 진행 상황, 특정 버그 수정 자체는 제외한다. 그 뒤에 있는 일반 원리만 concept이 된다.
- 한 줄짜리 사실, 흔한 상식, 명령어 인자 같은 것은 제외한다.
- 확실하지 않으면 넣지 마라. 해당 없으면 빈 배열. 최대 5개.
- 공개 저장소에 올라갈 수 있다. 회사명·서비스명·내부 도메인·계정 ID·경로 속 사용자명·자격증명은 일반화한다(예: your-app).
- slug: 영문 소문자 kebab-case, 날짜 없음.
- title, summary(한두 문장), body는 한국어. 대화에 나온 사실만 쓰고 지어내지 마라.
- body 형식: concept은 "## 한 줄 정의", "## 핵심", 필요하면 "## 예시". idea는 "## 발상", 필요하면 "## 적용 위치".'

  WORK="$STATE_DIR/work"
  mkdir -p "$WORK"
  OUT="$BATCH.out.json"
  touch "$BATCH"   # 처리 중 표시 — 재시도 루프(10분 기준)가 같은 batch를 또 띄우지 않게

  # 호출 하나가 멈춰도 30분 작업 전체가 막히지 않도록 시간 상한 (macOS엔 timeout 명령이 없어 직접 구현)
  (cd "$WORK" && CLAUDE_LEARNING_CAPTURE=1 exec claude -p \
      --model "$MODEL" --tools "" --no-session-persistence --setting-sources "" \
      --system-prompt "$PROMPT" --output-format json --json-schema "$SCHEMA" \
      < "$BATCH" > "$OUT" 2>> "$LOG") &
  CLAUDE_PID=$!
  ( sleep "$EXTRACT_TIMEOUT" && kill "$CLAUDE_PID" 2>/dev/null ) &
  KILLER_PID=$!
  wait "$CLAUDE_PID"; RC=$?
  kill "$KILLER_PID" 2>/dev/null; wait "$KILLER_PID" 2>/dev/null
  if [ "$RC" -ne 0 ]; then
    log "claude -p 실패(rc=$RC, ${EXTRACT_TIMEOUT}초 상한) — batch 보존: $(basename "$BATCH")"
    exit 0
  fi

  # batch 이름이 aside-로 시작하면 Aside 세션에서 온 것
  SOURCE="llm-capture"
  case "$(basename "$BATCH")" in aside-*) SOURCE="aside" ;; esac

  node - "$OUT" "$VAULT" "$(basename "$BATCH" .txt)" "$SOURCE" <<'NODE' >> "$LOG" 2>&1
const fs = require('fs')
const path = require('path')
const [, , outPath, vault, batchName, source] = process.argv

const res = JSON.parse(fs.readFileSync(outPath, 'utf-8'))
if (res.is_error) { console.log(`[${batchName}] 모델 오류: ${res.subtype}`); process.exit(1) }
const items = res.structured_output?.items || []
const today = new Date().toISOString().slice(0, 10)
const yq = s => JSON.stringify(String(s ?? ''))

// 이미 있는 슬러그(정식·_unsorted)는 건너뛴다
const known = new Set()
for (const dir of ['concepts', 'concepts/_unsorted', 'ideas', 'ideas/_unsorted']) {
  const abs = path.join(vault, dir)
  if (!fs.existsSync(abs)) continue
  for (const f of fs.readdirSync(abs)) {
    if (f.endsWith('.md')) known.add(f.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''))
  }
}

const written = []
for (const it of items) {
  const slug = String(it.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (!slug || known.has(slug)) continue
  const tags = `[${(it.tags || []).map(yq).join(', ')}]`
  const front = it.kind === 'concept'
    ? ['type: "concept"', 'stage: "seedling"', `summary: ${yq(it.summary)}`, 'publish: false',
       `tags: ${tags}`, 'related: []', `created: "${today}"`, `updated: "${today}"`]
    : [`date: "${today}"`, 'kind: "spark"', 'scope: "current-project"', 'stage: "seedling"',
       `summary: ${yq(it.summary)}`, `tags: ${tags}`]
  const md = ['---', `title: ${yq(it.title)}`, ...front,
    `source: ${yq(source)}`, `capture_batch: ${yq(batchName)}`, '---', '', String(it.body || '').trim(), ''].join('\n')
  const dir = path.join(vault, it.kind === 'concept' ? 'concepts/_unsorted' : 'ideas/_unsorted')
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${today}-${slug}.md`)
  fs.writeFileSync(file, md, 'utf-8')
  known.add(slug)
  written.push(path.relative(vault, file))
}
console.log(`[${batchName}] 후보 ${items.length}개 중 ${written.length}개 저장 (cost $${res.total_cost_usd ?? '?'})` +
  (written.length ? '\n  ' + written.join('\n  ') : ''))
NODE
  [ "${PIPESTATUS[0]:-0}" -eq 0 ] && rm -f "$BATCH" "$OUT"
  exit 0
fi

# launchd(Aside 모드)에서는 작업이 끝나면 남은 자식 프로세스가 정리될 수 있어 추출을 앞에서 순서대로 돌린다
SWEEP=0
[ "${1:-}" = "--aside-sweep" ] && SWEEP=1
run_extract() {
  if [ "$SWEEP" = 1 ]; then bash "$0" --extract "$1"
  else nohup bash "$0" --extract "$1" >/dev/null 2>&1 &
  fi
}

# ── 실패로 남은 batch: 10분 지난 것은 재시도, 3일 지난 것은 정리 ──
# (처리 위치는 batch를 만들 때 이미 넘어가므로, 남은 batch가 유일한 재시도 수단)
find "$STATE_DIR/batches" -type f -mtime +3 -delete 2>/dev/null
# 재시도 담당을 나눈다: hook은 Claude Code batch만, 30분 작업은 aside-* batch만 (같은 batch 동시 추출 방지)
if [ "$SWEEP" = 1 ]; then RETRY_GLOB='aside-*.txt'; else RETRY_GLOB='[!a]*.txt'; fi
find "$STATE_DIR/batches" -name "$RETRY_GLOB" -mmin +10 2>/dev/null | while IFS= read -r OLD; do
  touch "$OLD"   # 재시도 중에 다음 hook이 또 띄우지 않도록
  log "batch 재시도: $(basename "$OLD")"
  run_extract "$OLD"
done

# ── Aside 모드: 세션 파일의 새 부분을 batch로 잘라 순서대로 추출 ──
if [ "$SWEEP" = 1 ]; then
  ASIDE_SESSIONS="${ASIDE_SESSIONS:-$HOME/.aside/u/0/sessions}"
  [ -d "$ASIDE_SESSIONS" ] || exit 0
  node - "$STATE_DIR" "$ASIDE_SESSIONS" "$MIN_USER_TURNS" <<'NODE' > "$STATE_DIR/aside-batches.txt" 2>> "$LOG"
const fs = require('fs')
const path = require('path')
const [, , stateDir, sessionsDir, minTurnsArg] = process.argv
const IDLE_MS = 2 * 60 * 60 * 1000
const MAX = 80000

const asideState = path.join(stateDir, 'aside')
fs.mkdirSync(asideState, { recursive: true })
const baselineFile = path.join(asideState, '.baseline')
const isBaseline = !fs.existsSync(baselineFile)

for (const dir of fs.readdirSync(sessionsDir)) {
  const file = path.join(sessionsDir, dir, 'messages.jsonl')
  let st
  try { st = fs.statSync(file) } catch { continue }
  const stateFile = path.join(asideState, `${dir}.json`)
  let offset = 0
  try { offset = JSON.parse(fs.readFileSync(stateFile, 'utf-8')).offset || 0 } catch {}

  // 첫 실행: 지금 크기를 기준점으로만 기록 (과거 대화는 처리하지 않음)
  if (isBaseline) { fs.writeFileSync(stateFile, JSON.stringify({ offset: st.size })); continue }
  // 파일이 처리 위치보다 작아졌다면 다시 쓰인 것 — 처음부터 다시 본다 (조용히 건너뛰지 않게)
  if (st.size < offset) {
    console.error(`[aside] ${dir}: 파일이 처리 위치보다 작아짐(${st.size} < ${offset}) — 처음부터 다시 처리`)
    offset = 0
  }
  if (st.size <= offset) continue

  // 새로 붙은 부분만 읽는다. 쓰는 중인 마지막 줄은 다음 번으로 넘긴다
  const fd = fs.openSync(file, 'r')
  const buf = Buffer.alloc(st.size - offset)
  fs.readSync(fd, buf, 0, buf.length, offset)
  fs.closeSync(fd)
  const lastNl = buf.lastIndexOf(0x0a)
  if (lastNl < 0) continue
  const end = offset + lastNl + 1

  const turns = []
  let userTurns = 0
  for (const line of buf.subarray(0, lastNl).toString('utf-8').split('\n')) {
    let e
    try { e = JSON.parse(line) } catch { continue }
    if (e.role === 'user' && typeof e.content === 'string' && e.content.trim()) {
      userTurns++
      turns.push(`### 사용자\n${e.content.trim()}`)
    } else if (e.role === 'assistant' && Array.isArray(e.content)) {
      const text = e.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim()
      if (text) turns.push(`### Aside\n${text}`)
    }
  }

  // 충분히 쌓였거나, 세션이 한동안 멈췄을 때만 처리 — 아니면 처리 위치를 그대로 두고 다음 번에 이어서 센다
  const idle = Date.now() - st.mtimeMs > IDLE_MS
  if (userTurns < Number(minTurnsArg) && !(idle && userTurns > 0)) {
    if (userTurns === 0 && idle) fs.writeFileSync(stateFile, JSON.stringify({ offset: end }))
    continue
  }

  let body = turns.join('\n\n')
  if (body.length > MAX) body = body.slice(-MAX)
  const batch = path.join(stateDir, 'batches', `aside-${dir}-${offset}-${end}.txt`)
  fs.writeFileSync(batch, body, 'utf-8')
  fs.writeFileSync(stateFile, JSON.stringify({ offset: end }))
  console.log(batch)
}

if (isBaseline) {
  fs.writeFileSync(baselineFile, new Date().toISOString())
  console.error(`[aside] 기준점 기록: 세션 ${fs.readdirSync(asideState).length - 1}개 (과거 대화는 처리하지 않음)`)
}
NODE
  while IFS= read -r B; do
    [ -n "$B" ] || continue
    log "batch 생성: $(basename "$B") ($(wc -c < "$B" | tr -d ' ')B)"
    run_extract "$B"
  done < "$STATE_DIR/aside-batches.txt"
  exit 0
fi

# ── 1단계 (hook 본체): 새 대화 부분을 batch 파일로 잘라낸다 ──────
EVENT_JSON="$(cat)"
# stdin은 heredoc(스크립트)이 쓰므로 이벤트는 환경 변수로 넘긴다
BATCH="$(HOOK_EVENT="$EVENT_JSON" node - "$STATE_DIR" "$MIN_USER_TURNS" <<'NODE'
const fs = require('fs')
const path = require('path')
const [, , stateDir, minTurnsArg] = process.argv

let e = {}
try { e = JSON.parse(process.env.HOOK_EVENT || '') } catch { process.exit(0) }
const { session_id: sid, transcript_path: tp, hook_event_name: ev } = e
if (!sid || !tp || !fs.existsSync(tp)) process.exit(0)

const stateFile = path.join(stateDir, `${sid}.json`)
let start = 0
try { start = JSON.parse(fs.readFileSync(stateFile, 'utf-8')).line || 0 } catch {}

const lines = fs.readFileSync(tp, 'utf-8').split('\n').filter(Boolean)
if (lines.length <= start) process.exit(0)

// 사용자 메시지에서 하네스가 붙인 블록은 걷어낸다 (사용자가 쓴 말만 남김)
const HARNESS = /<(system-reminder|task-notification|bash-stdout|bash-stderr|local-command-stdout|command-message|command-args)>[\s\S]*?<\/\1>/g
const turns = []
let userTurns = 0
for (const line of lines.slice(start)) {
  let evt
  try { evt = JSON.parse(line) } catch { continue }
  const msg = evt?.message
  if (!msg || evt.isMeta) continue
  const blocks = typeof msg.content === 'string' ? [{ type: 'text', text: msg.content }] : (msg.content || [])
  const text = blocks.filter(b => b.type === 'text').map(b => b.text).join('\n')
  if (msg.role === 'user') {
    const clean = text.replace(HARNESS, '').replace(/<\/?bash-input>/g, '').trim()
    // transcript에 같은 메시지가 두 번 기록되는 경우가 있어 연속 중복은 건너뛴다
    if (!clean || turns.at(-1) === `### 사용자\n${clean}`) continue
    userTurns++
    turns.push(`### 사용자\n${clean}`)
  } else if (msg.role === 'assistant' && text.trim() && turns.at(-1) !== `### Claude\n${text.trim()}`) {
    turns.push(`### Claude\n${text.trim()}`)
  }
}

// Stop은 충분히 쌓였을 때만. 처리 위치를 안 옮기므로 다음 Stop에서 이어서 센다
if (ev === 'Stop' && userTurns < Number(minTurnsArg)) process.exit(0)

fs.writeFileSync(stateFile, JSON.stringify({ line: lines.length, updated: new Date().toISOString() }))
if (userTurns === 0) process.exit(0)

const MAX = 80000  // 너무 길면 뒤쪽(최근)만
let body = turns.join('\n\n')
if (body.length > MAX) body = body.slice(-MAX)
// 끝 줄까지 이름에 넣어, 거의 동시에 온 Stop·SessionEnd가 같은 파일을 덮어쓰지 않게 한다
const batch = path.join(stateDir, 'batches', `${sid.slice(0, 8)}-${start}-${lines.length}.txt`)
fs.writeFileSync(batch, body, 'utf-8')
console.log(batch)
NODE
)" || exit 0

[ -z "$BATCH" ] && exit 0
log "batch 생성: $(basename "$BATCH") ($(wc -c < "$BATCH" | tr -d ' ')B)"
nohup bash "$0" --extract "$BATCH" >/dev/null 2>&1 &
exit 0
