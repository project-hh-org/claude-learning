#!/bin/bash
# =============================================================
# install-claude-config.sh
#
# 이 레포의 configs/{skills,rules,hooks}/* 자산을 Claude Code/
# Claude Code Desktop app이 자동 발견하는 경로로 심볼릭 링크 등록.
# 또한 ~/.claude/settings.json의 Stop hook 항목을 안전하게 머지.
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
HOOK_SCRIPTS=(
  "$REPO_ROOT/configs/hooks/idea-safety-net.sh"
  "$REPO_ROOT/configs/hooks/concept-synthesis.sh"
)

# ── --uninstall ─────────────────────────────────────────────
if [ "${1:-}" = "--uninstall" ]; then
  rm -f "$TARGET_BASE/skills/capture-idea" 2>/dev/null || true
  rm -f "$TARGET_BASE/skills/capture-concept" 2>/dev/null || true
  rm -f "$TARGET_BASE/rules/capture-ideas.md" 2>/dev/null || true
  rm -f "$TARGET_BASE/rules/capture-concepts.md" 2>/dev/null || true
  rm -f "$TARGET_BASE/rules/security.md" 2>/dev/null || true
  ok "심볼릭 링크 제거 완료 ($TARGET_BASE)"
  warn "settings.json의 Stop hook 항목은 수동으로 제거하세요: $SETTINGS_FILE"
  exit 0
fi

# ── 사전 점검 ───────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  err "Node.js가 필요합니다 (settings.json 머지에 사용)."
  exit 1
fi

mkdir -p "$TARGET_BASE/skills" "$TARGET_BASE/rules"

echo "📁 설치 범위: $SCOPE  →  $TARGET_BASE"
echo ""

# ── Skills 심볼릭 링크 ──────────────────────────────────────
SKILLS_SRC="$REPO_ROOT/configs/skills"
if [ -d "$SKILLS_SRC" ]; then
  for skill_dir in "$SKILLS_SRC"/*/; do
    [ -d "$skill_dir" ] || continue
    name="$(basename "$skill_dir")"
    [ -f "$skill_dir/SKILL.md" ] || { warn "skip $name (SKILL.md 없음)"; continue; }

    target="$TARGET_BASE/skills/$name"
    if [ -L "$target" ] || [ -e "$target" ]; then
      rm -f "$target"
    fi
    ln -s "$skill_dir" "$target"
    ok "skill 등록: $target  →  $skill_dir"
  done
fi

# ── Rules 심볼릭 링크 ───────────────────────────────────────
RULES_SRC="$REPO_ROOT/configs/rules"
if [ -d "$RULES_SRC" ]; then
  for rule_file in "$RULES_SRC"/*.md; do
    [ -f "$rule_file" ] || continue
    name="$(basename "$rule_file")"

    target="$TARGET_BASE/rules/$name"
    if [ -L "$target" ] || [ -e "$target" ]; then
      rm -f "$target"
    fi
    ln -s "$rule_file" "$target"
    ok "rule 등록: $target  →  $rule_file"
  done
fi

# ── Stop hook들을 settings.json에 머지 ───────────────────────
for HOOK_SCRIPT in "${HOOK_SCRIPTS[@]}"; do
  if [ ! -x "$HOOK_SCRIPT" ]; then
    warn "$HOOK_SCRIPT 실행 권한 없음 — skip (chmod +x 후 재실행)"
    continue
  fi

  node - "$SETTINGS_FILE" "$HOOK_SCRIPT" <<'NODE'
const fs = require('fs')
const path = require('path')
const [, , settingsPath, hookCommand] = process.argv

let cfg = {}
if (fs.existsSync(settingsPath)) {
  try { cfg = JSON.parse(fs.readFileSync(settingsPath, 'utf-8')) } catch {
    console.error('[install] settings.json 파싱 실패 — 백업 후 새로 생성')
    fs.copyFileSync(settingsPath, settingsPath + '.bak.' + Date.now())
    cfg = {}
  }
}

cfg.hooks ??= {}
cfg.hooks.Stop ??= []

const desired = {
  matcher: '.*',
  hooks: [{ type: 'command', command: 'bash ' + hookCommand }],
}

const already = (cfg.hooks.Stop || []).some(group =>
  Array.isArray(group?.hooks) &&
  group.hooks.some(h => h?.command && h.command.includes(hookCommand))
)

if (already) {
  console.log('[install] 이미 등록됨 — skip: ' + path.basename(hookCommand))
} else {
  cfg.hooks.Stop.push(desired)
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true })
  fs.writeFileSync(settingsPath, JSON.stringify(cfg, null, 2) + '\n', 'utf-8')
  console.log('[install] 추가됨: ' + path.basename(hookCommand) + ' → ' + settingsPath)
}
NODE
  ok "Stop hook 등록 검사: $(basename "$HOOK_SCRIPT")"
done

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
