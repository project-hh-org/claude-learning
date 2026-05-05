---
title: "Obsidian Git 자동 push 설정 — 학습 로그 자동화"
date: "2026-05-05"
summary: "Obsidian Git 플러그인으로 entries/ 폴더 변경 시 자동 commit+push, GitHub Actions 트리거까지 연결하는 방법"
tags: ["obsidian", "git", "automation", "workflow", "obsidian-git"]
readTime: 4
---

## 🔍 배경 / 맥락

`iCloud/claude/learn/entries/`에 .md 파일을 추가하면 GitHub → GitHub Actions → AWS S3 배포까지 자동으로 이어지는 파이프라인을 구축했다. 마지막 퍼즐은 **파일 저장 → git push** 구간을 자동화하는 것.

다른 노트북에서 Obsidian Git 플러그인을 써봤는데, 이번에 새 맥에서 다시 설정한 기록.

---

## 💡 배운 것

### 옵션 비교

| 방식 | 장점 | 단점 |
|------|------|------|
| **Obsidian Git** | UI 내장, 주기적 자동 커밋 | Obsidian 앱 실행 중에만 동작 |
| **fswatch 스크립트** | Obsidian 없어도 작동, 백그라운드 | 터미널 설정 필요 |
| **launchd 데몬** | 로그인 시 자동 시작, 항상 실행 | plist 설정 복잡 |

→ **추천: Obsidian Git (주) + fswatch (보조)**

---

## ✅ 적용한 것

### A. Obsidian Git 플러그인 설정

1. Obsidian → **설정(⌘,)** → **커뮤니티 플러그인** → 안전 모드 끄기
2. **플러그인 탐색** → `obsidian-git` 검색 → 설치 → 활성화
3. **Obsidian Git 설정**:

```
Vault backup interval (minutes): 10     ← 10분마다 자동 커밋
Auto push after commit: ✅ 켜기         ← 커밋 즉시 push
Auto pull on startup: ✅ 켜기           ← 시작 시 pull (충돌 방지)
Commit message: "learn: {{date}} auto-backup"
Date format: YYYY-MM-DD HH:mm
```

4. **Vault 경로 확인**: Obsidian Vault가 `iCloud/claude/` 또는 `iCloud/claude/learn/`을 포함해야 함
   - Vault 루트가 `claude/`라면 → learn/ 폴더 전체가 자동 추적됨
   - Vault 루트가 `learn/`이라면 → entries/ 직접 추적

5. **단축키 등록** (선택):
   - `⌘⇧P` → "Obsidian Git: Create backup" — 즉시 커밋+push

### B. fswatch 스크립트 (Obsidian 없을 때 대안)

이 프로젝트에 미리 만들어둔 스크립트 사용:

```bash
# 사전 설치
brew install fswatch

# 1회 실행 (터미널 열어둬야 함)
bash scripts/watch-and-push.sh

# macOS 로그인 시 자동 시작 (권장)
bash scripts/install-launchd.sh

# 로그 확인
tail -f /tmp/claude-learn-watcher.log

# 자동 시작 제거
bash scripts/install-launchd.sh --uninstall
```

### C. 새 학습 로그 추가 워크플로우

```
1. entries/ 폴더에 날짜-제목.md 파일 생성
2. TEMPLATE.md 형식으로 내용 작성
3. 저장 → Obsidian Git이 10분 내 자동 push
   (또는 ⌘⇧P → "Create backup"으로 즉시 push)
4. GitHub Actions 트리거 → S3 빌드+배포 (~2분)
5. 도메인에서 새 글 확인
```

---

## 🔗 참고 자료

- [Obsidian Git GitHub](https://github.com/denolehov/obsidian-git)
- [Obsidian 커뮤니티 플러그인 안내](https://help.obsidian.md/Extending+Obsidian/Community+plugins)

---

_2026-05-05_
