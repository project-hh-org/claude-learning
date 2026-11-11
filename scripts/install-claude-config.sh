#!/bin/bash
# =============================================================
# install-claude-config.sh
#
# 이 레포의 configs/{skills,rules,hooks}/* 자산을 Claude Code/
# Claude Code Desktop app이 자동 발견하는 경로로 심볼릭 링크 등록.
# 또한 ~/.claude/settings.json에 캡처 hook(Stop·SessionEnd)을 안전하게 머지.
#
# 단일 소스: configs/ (블로그 표시 + Claude 자동 로드 동시 만족)
# 편집 시 즉시 반영 — symlink이므로 파일 사본 동기화 불필요.
#
# 실행:        bash scripts/install-claude-config.sh
# 적용 범위 옵션:
#   USER  (기본): ~/.claude/skills/, ~/.claude/rules/      → 모든 프로젝트
#   PROJECT     : <repo>/.claude/skills/, .claude/rules/   → 이 레포에서만
#
# 예:
#   SCOPE=user    bash scripts/install-claude-config.sh   (기본)
#   SCOPE=project bash scripts/install-claude-config.sh
#
# 제거:        bash scripts/install-claude-config.sh --uninstall
#
# 주의: 이 스크립트는 Claude Code (CLI) 와 Claude Code Desktop app에
# 적용된다. claude.ai에서 다운로드하는 일반 Claude Desktop (chat) 앱은
# Skill/Hook을 동일한 방식으로 지원하지 않으므로 별도로
# scripts/setup-claude-desktop.sh 를 사용하라.
# =============================================================

set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✅ $*${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $*${NC}"; }
err()  { echo -e "${RED}❌ $*${NC}"; }

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCOPE="${SCOPE:-user}"

case "$SCOPE" in
  user)    TARGET_BASE="$HOME/.claude" ;;
  project) TARGET_BASE="$REPO_ROOT/.claude" ;;
  *) err "SCOPE는 user 또는 project 여야 합니다 (got: $SCOPE)"; exit 1 ;;
esac

SETTINGS_FILE="$TARGET_BASE/settings.json"
VAULT_PATH_FILE="$TARGET_BASE/learning-vault.path"
HOOK_SCRIPT="$REPO_ROOT/configs/hooks/llm-capture.sh"
SYNC_SCRIPT="$REPO_ROOT/scripts/sync-claude-configs.mjs"
# 등록할 hook: "실행기|스크립트|이벤트,이벤트"
HOOK_SPECS=(
  "bash|$HOOK_SCRIPT|Stop,SessionEnd"   # 캡처 안전망
  "node|$SYNC_SCRIPT|Stop"              # configs/sync.json 공개 목록 → configs/ 복사
)
# llm-capture.sh로 대체된 정규식 hook — settings.json에 남아 있으면 제거한다
RETIRED_HOOKS=(idea-safety-net.sh concept-synthesis.sh)

# ── --uninstall ─────────────────────────────────────────────
if [ "${1:-}" = "--uninstall" ]; then
  rm -f "$TARGET_BASE/skills/capture-idea" 2>/dev/null || true
  rm -f "$TARGET_BASE/skills/capture-concept" 2>/dev/null || true
  rm -f "$TARGET_BASE/rules/capture-ideas.md" 2>/dev/null || true
  rm -f "$TARGET_BASE/rules/capture-concepts.md" 2>/dev/null || true
  rm -f "$TARGET_BASE/rules/security.md" 2>/dev/null || true
  rm -f "$TARGET_BASE/commands/log-entry.md" 2>/dev/null || true
  rm -f "$VAULT_PATH_FILE" 2>/dev/null || true
  ok "심볼릭 링크 제거 완료 ($TARGET_BASE)"
  warn "settings.json의 Stop/SessionEnd hook 항목은 수동으로 제거하세요: $SETTINGS_FILE"
  exit 0
fi

# ── 사전 점검 ───────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  err "Node.js가 필요합니다 (settings.json 머지에 사용)."
  exit 1
fi

mkdir -p "$TARGET_BASE/skills" "$TARGET_BASE/rules" "$TARGET_BASE/commands"

# ── Vault 절대경로 기록 ─────────────────────────────────────
# 다른 프로젝트(cwd)에서 Claude Code/Desktop 작업 시에도 캡처된
# 발상/개념이 항상 이 claude-learning 레포로 모이도록, 절대경로를
# learning-vault.path 파일에 한 줄로 기록한다. skills/hooks가 이를
# 참조해 cwd와 무관하게 동일 vault에 쓴다.
echo "$REPO_ROOT" > "$VAULT_PATH_FILE"
ok "vault 경로 기록: $VAULT_PATH_FILE  →  $REPO_ROOT"


echo "📁 설치 범위: $SCOPE  →  $TARGET_BASE"
echo ""

# configs/sync.json으로 ~/.claude에서 복사해 온 항목은 원본이 ~/.claude(iCloud 백업) 쪽이다.
# 그 자리를 레포 링크로 바꾸면 원본이 지워지므로 링크 대상에서 뺀다.
SYNC_MANIFEST="$REPO_ROOT/configs/.sync-manifest.json"
is_synced_copy() { [ -f "$SYNC_MANIFEST" ] && grep -qF "\"$1\"" "$SYNC_MANIFEST"; }

# target 자리에 레포 링크를 건다. 기존 링크만 교체하고, 실제 파일·폴더는 절대 지우지 않는다.
link_into() {
  local src="$1" target="$2" kind="$3"
  if [ -e "$target" ] && [ ! -L "$target" ]; then
    warn "$kind skip: $target 는 실제 파일/폴더 — 덮어쓰지 않음"
    return 0
  fi
  rm -f "$target"
  ln -s "$src" "$target"
  ok "$kind 등록: $target  →  $src"
}

# ── Skills 심볼릭 링크 ──────────────────────────────────────
SKILLS_SRC="$REPO_ROOT/configs/skills"
if [ -d "$SKILLS_SRC" ]; then
  for skill_dir in "$SKILLS_SRC"/*/; do
    [ -d "$skill_dir" ] || continue
    name="$(basename "$skill_dir")"
    [ -f "$skill_dir/SKILL.md" ] || { warn "skip $name (SKILL.md 없음)"; continue; }
    is_synced_copy "skills/$name" && continue
    link_into "$skill_dir" "$TARGET_BASE/skills/$name" skill
  done
fi

# ── Rules 심볼릭 링크 ───────────────────────────────────────
RULES_SRC="$REPO_ROOT/configs/rules"
if [ -d "$RULES_SRC" ]; then
  for rule_file in "$RULES_SRC"/*.md; do
    [ -f "$rule_file" ] || continue
    name="$(basename "$rule_file")"
    is_synced_copy "rules/$name" && continue
    link_into "$rule_file" "$TARGET_BASE/rules/$name" rule
  done
fi

# ── Commands 심볼릭 링크 (slash commands) ─────────────────
COMMANDS_SRC="$REPO_ROOT/configs/commands"
if [ -d "$COMMANDS_SRC" ]; then
  for cmd_file in "$COMMANDS_SRC"/*.md; do
    [ -f "$cmd_file" ] || continue
    name="$(basename "$cmd_file")"
    is_synced_copy "commands/$name" && continue
    link_into "$cmd_file" "$TARGET_BASE/commands/$name" command
  done
fi

# ── 캡처·동기화 hook을 settings.json에 머지 ─────────────────
for f in "$HOOK_SCRIPT" "$SYNC_SCRIPT"; do
  [ -f "$f" ] || { err "$f 없음"; exit 1; }
done

node - "$SETTINGS_FILE" "${RETIRED_HOOKS[*]}" "${HOOK_SPECS[@]}" <<'NODE'
const fs = require('fs')
const path = require('path')
const [, , settingsPath, retiredArg, ...specs] = process.argv

let cfg = {}
if (fs.existsSync(settingsPath)) {
  try { cfg = JSON.parse(fs.readFileSync(settingsPath, 'utf-8')) } catch {
    console.error('[install] settings.json 파싱 실패 — 백업 후 새로 생성')
    fs.copyFileSync(settingsPath, settingsPath + '.bak.' + Date.now())
    cfg = {}
  }
}

cfg.hooks ??= {}
const retired = retiredArg.split(' ').filter(Boolean)
const usesCommand = (group, match) =>
  Array.isArray(group?.hooks) && group.hooks.some(h => typeof h?.command === 'string' && match(h.command))
let changed = false

// 대체된 hook 제거 (모든 이벤트에서)
for (const [event, groups] of Object.entries(cfg.hooks)) {
  if (!Array.isArray(groups)) continue
  const kept = groups.filter(g => !usesCommand(g, c => retired.some(r => c.includes(r))))
  if (kept.length !== groups.length) {
    cfg.hooks[event] = kept
    changed = true
    console.log(`[install] 제거됨: ${event}의 대체된 hook ${groups.length - kept.length}개`)
  }
}

for (const spec of specs) {
  const [runner, script, eventsArg] = spec.split('|')
  for (const event of eventsArg.split(',').filter(Boolean)) {
    cfg.hooks[event] ??= []
    if (cfg.hooks[event].some(g => usesCommand(g, c => c.includes(script)))) {
      console.log(`[install] 이미 등록됨 — skip: ${event} ${path.basename(script)}`)
      continue
    }
    cfg.hooks[event].push({ hooks: [{ type: 'command', command: `${runner} "${script}"` }] })
    changed = true
    console.log(`[install] 추가됨: ${event} ${path.basename(script)}`)
  }
}

if (changed) {
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true })
  fs.writeFileSync(settingsPath, JSON.stringify(cfg, null, 2) + '\n', 'utf-8')
}
NODE
ok "hook 등록 검사: $(basename "$HOOK_SCRIPT"), $(basename "$SYNC_SCRIPT")"

# ── 마무리 ──────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════"
ok "설치 완료"
echo ""
echo "  설치된 자산:"
ls -la "$TARGET_BASE/skills" 2>/dev/null | grep -v '^total' | tail -n +2 || true
ls -la "$TARGET_BASE/rules"  2>/dev/null | grep -v '^total' | tail -n +2 || true
echo ""
warn "다음 작업:"
echo "  1) Claude Code (CLI)에서 새 세션 시작 → 발상 캡처 동작 확인"
echo "  2) Claude Desktop chat app(claude.ai/download)을 쓴다면"
echo "     → 별도로: bash scripts/setup-claude-desktop.sh"
echo ""
echo "  제거:  bash scripts/install-claude-config.sh --uninstall"
echo "════════════════════════════════════════════════════"
