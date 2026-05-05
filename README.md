# 📚 Claude Learning Log

다희의 개발 학습 기록 — [claude-learning.project-hh.com](https://claude-learning.project-hh.com)

## 구조

```
entries/          ← 글 원본 (.md)
  YYYY-MM-DD-slug.md
src/
  app/            ← Next.js App Router
  components/     ← PostList, PostDetail
  lib/posts.js    ← 마크다운 파싱 (gray-matter + unified)
scripts/          ← 자동 push 워처, launchd 설치
.github/workflows/deploy.yml  ← S3 배포 파이프라인
```

## 글 추가

`entries/`에 마크다운 파일 생성:

```
YYYY-MM-DD-slug.md
```

### Frontmatter

**Learning Note (기본)**
```yaml
---
title: "제목"
date: "2026-01-01"
summary: "한 줄 요약"
tags: ["태그1", "태그2"]
---
```

**Lab Note (프로젝트/실험)**
```yaml
---
title: "제목"
date: "2026-01-01"
summary: "한 줄 요약"
tags: ["태그1", "태그2"]
type: "lab"
category: "AI"          # AI | DevTools | Infra | Design
stage: "evergreen"      # evergreen | budding | seedling
links:
  - label: "GitHub"
    url: "https://..."
references:
  - label: "참고 문서"
    url: "https://..."
---
```

## 로컬 개발

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # 정적 빌드 → out/
```

## 배포 파이프라인

```
entries/*.md 저장
  → fswatch 감지 → git commit + push
  → GitHub Actions (Next.js SSG 빌드)
  → AWS S3 sync (HTML: no-cache, assets: immutable)
  → CloudFront 캐시 무효화
  → https://claude-learning.project-hh.com
```

### 자동 push 설정

```bash
brew install fswatch
bash scripts/install-launchd.sh   # 로그인 시 자동 시작
tail -f /tmp/claude-learn-watcher.log
```

## 인프라

| 항목 | 값 |
|------|-----|
| 호스팅 | AWS S3 + CloudFront |
| 리전 | ap-northeast-2 (서울) |
| 버킷 | claude-learning.project-hh |
| 도메인 | claude-learning.project-hh.com (Route53) |
| CI/CD | GitHub Actions |
