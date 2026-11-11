#!/bin/bash
# PostToolUse: 수정된 파일 하나만, 프로젝트에 포매터가 설치돼 있을 때만 포맷한다.
# 포매터가 없으면 아무것도 하지 않고 바로 끝난다. 실패해도 작업을 막지 않는다.
INPUT="$(cat)"
FILE="$(printf '%s' "$INPUT" | /usr/bin/python3 -c 'import sys,json
try:
  d=json.load(sys.stdin); print(d.get("tool_input",{}).get("file_path",""))
except Exception: pass' 2>/dev/null)"
{ [ -z "$FILE" ] || [ ! -f "$FILE" ]; } && exit 0

case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.json|*.css|*.scss|*.md|*.mdx|*.yml|*.yaml|*.html) ;;
  *) exit 0 ;;
esac
case "$FILE" in */node_modules/*|*/.next/*|*/dist/*|*/build/*|*/ios/Pods/*|*/.claude/*) exit 0 ;; esac

# 파일에서 위로 올라가며 package.json이 있는 프로젝트 루트를 찾는다
DIR="$(dirname "$FILE")"
while [ "$DIR" != "/" ] && [ ! -f "$DIR/package.json" ]; do DIR="$(dirname "$DIR")"; done
[ -f "$DIR/package.json" ] || exit 0
cd "$DIR" || exit 0

# 프로젝트에 설치된 도구만 사용한다 (npx로 새로 내려받지 않음)
if [ -x node_modules/.bin/biome ] && ls biome.json* >/dev/null 2>&1; then
  node_modules/.bin/biome format --write "$FILE" >/dev/null 2>&1
elif [ -x node_modules/.bin/prettier ]; then
  node_modules/.bin/prettier --write --log-level silent "$FILE" >/dev/null 2>&1
fi
exit 0
