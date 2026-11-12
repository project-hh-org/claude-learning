#!/bin/bash
# =============================================================
# restore-claude-home.sh — 새 기기에서 iCloud 백업본을 ~/.claude에 다시 연결한다
#
# 새 기기에서 bootstrap.sh 전에 한 번만 실행한다. (bootstrap이 자동으로 부르지 않는다)
# 이미 쓰고 있는 기기에서 다시 돌리면 지금 쓰는 실파일(settings.json 등)이 백업본 링크로 바뀐다.
#
# 연결하는 것 (백업에 있는 것만):
#   ~/.claude/{CLAUDE.md, AI-OS.md, rules, agents, commands, settings.json, settings.local.json}
#   ~/.claude/projects                        ← 세션 기록 스냅샷
#   Claude Desktop의 claude_desktop_config.json
# 기존 실파일은 지우지 않고 <이름>.bak-restore로 옮겨 둔다.
#
# 전제: iCloud Drive 동기화가 끝난 뒤 실행 (파일이 아직 안 내려왔으면 빈 링크가 된다)
# 백업 위치: CLAUDE_BACKUP_ROOT (기본: iCloud Drive/claude/claude-code-home-backup)
# =============================================================

set -e

BACKUP_ROOT="${CLAUDE_BACKUP_ROOT:-$HOME/Library/Mobile Documents/com~apple~CloudDocs/claude/claude-code-home-backup}"
DOTFILES="$BACKUP_ROOT/dotfiles"
SESSIONS="$BACKUP_ROOT/sessions-snapshot/projects"
TARGET=~/.claude

[ -d "$DOTFILES" ] || { echo "백업을 찾을 수 없음: $DOTFILES (iCloud 동기화가 끝났는지 확인)"; exit 1; }

mkdir -p "$TARGET"

# dst 자리에 src 링크를 건다. 기존 링크는 교체, 실파일은 .bak-restore로 보존
link_backup() {
  local src="$1" dst="$2" label="$3"
  if [ -L "$dst" ]; then
    rm "$dst"
  elif [ -e "$dst" ]; then
    mv "$dst" "$dst.bak-restore"
    echo "기존 파일 보존: $dst.bak-restore"
  fi
  ln -s "$src" "$dst"
  echo "연결됨: $label"
}

for item in CLAUDE.md AI-OS.md rules agents commands settings.json settings.local.json; do
  src="$DOTFILES/$item"
  [ -e "$src" ] || { echo "skip (백업에 없음): $item"; continue; }
  link_backup "$src" "$TARGET/$item" "$item"
done

if [ -d "$SESSIONS" ]; then
  link_backup "$SESSIONS" "$TARGET/projects" "projects (세션 기록)"
fi

DESKTOP_SRC="$DOTFILES/claude_desktop_config.json"
DESKTOP_TARGET=~/"Library/Application Support/Claude/claude_desktop_config.json"
if [ -e "$DESKTOP_SRC" ]; then
  mkdir -p "$(dirname "$DESKTOP_TARGET")"
  link_backup "$DESKTOP_SRC" "$DESKTOP_TARGET" "claude_desktop_config.json (Claude Desktop)"
fi

echo "완료. 다음: bash scripts/bootstrap.sh"
