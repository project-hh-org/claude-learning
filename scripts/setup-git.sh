#!/bin/bash
# =============================================================
# Claude Learning Log — Git 초기 설정 (1회용 부트스트랩, niche)
#
# ⚠️ 주의: 새 기기 셋업의 정석 흐름은 다음이다 — 이 스크립트가 아니라:
#
#     git clone https://github.com/project-hh-org/claude-learning.git
#     cd claude-learning
#     bash scripts/bootstrap.sh
#
# 이 스크립트는 다음 좁은 케이스에서만 의미가 있다:
#   - iCloud Drive로 폴더만 동기화되어 .git이 빠진 상태
#   - Zip 다운로드 등으로 git 히스토리 없이 받은 상태
#
# 실행:
#   cd <claude-learning 폴더>
#   bash scripts/setup-git.sh
#
# 동작: git init → 리모트 등록 → 첫 커밋 → push -u origin main
# =============================================================

set -e

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE="https://github.com/project-hh-org/claude-learning.git"

echo "📁 작업 디렉토리: $REPO_DIR"
cd "$REPO_DIR"

# 1. index.lock 정리
if [ -f ".git/index.lock" ]; then
  rm -f .git/index.lock
  echo "🔓 index.lock 제거"
fi

# 2. git 상태 확인
if [ ! -d ".git" ]; then
  git init
  git branch -m main
  echo "✅ git init 완료"
fi

# 3. 리모트 설정
if git remote | grep -q origin; then
  git remote set-url origin "$REMOTE"
else
  git remote add origin "$REMOTE"
fi
echo "✅ 리모트: $REMOTE"

# 4. 첫 커밋
git add .
git commit -m "init: Next.js SSG learning log setup

- Next.js 14 App Router + static export (output: 'export')
- gray-matter + unified markdown pipeline (remark/rehype)
- Dark OLED theme, violet accent (#a78bfa), Pretendard font
- GitHub Actions → AWS S3 + CloudFront deploy
- First entry: Claude Code Hooks & environment setup"

# 5. GitHub에 push
echo ""
echo "🚀 GitHub에 push 중..."
git push -u origin main

echo ""
echo "✅ 완료! https://github.com/project-hh-org/claude-learning"
