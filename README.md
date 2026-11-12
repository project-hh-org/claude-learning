# 📚 Claude Learning Log

다희의 개발 학습 기록 — [claude-learning.project-hh.com](https://claude-learning.project-hh.com)

Obsidian으로 작성하는 제텔카스텐 기반 학습 로그. 날짜 기반 **Entry**(학습 서사)와 원자적 **Concept**(영구 노트)으로 구성되며, `[[wikilink]]`로 노트 간 연결을 표현한다.

---

## 구조

```
entries/          ← 날짜 기반 학습 로그 (YYYY-MM-DD-slug.md)
concepts/         ← 원자적 개념 노트 (concept-name.md)
moc/              ← Map of Content — 주제별 인덱스 (선택적)
configs/          ← Claude rule/hook/command 파일
  rules/          ← 행동 규칙
  hooks/          ← PreToolUse 등 hook 스크립트
  commands/       ← 커스텀 slash command
src/
  app/
    [slug]/                     ← Entry 상세 페이지
    concept/[slug]/             ← Concept 상세 페이지
    configs/[category]/[slug]/  ← Config 상세 페이지
  components/
    PostDetail.jsx    ← Entry 렌더링 (관련 글 · 백링크 · 개념 칩)
    ConceptDetail.jsx ← Concept 렌더링
    PostList.jsx      ← 홈 목록
    ConfigDetail.jsx  ← Config 렌더링
  lib/
    posts.js      ← entries/ 파싱 + wikilink 변환 + 백링크 계산
    concepts.js   ← concepts/ 파싱
    wikilink.js   ← [[wikilink]] → HTML 링크 변환 유틸
    configs.js    ← configs/ 파싱
scripts/
.github/workflows/deploy.yml  ← S3 배포 파이프라인
TEMPLATE.md         ← Entry 작성 템플릿
CONCEPT_TEMPLATE.md ← Concept 작성 템플릿
```

---

## 노트 작성

### Entry (학습 로그)

`entries/YYYY-MM-DD-slug.md` 생성. 자세한 형식은 `TEMPLATE.md` 참고.

```yaml
---
title: "제목"
date: "2026-05-07"
summary: "한 줄 요약"
tags: ["태그1", "태그2"]
related:
  - slug: "2026-05-05-related-slug"
    label: "관련 글 제목"
concepts:
  - slug: "concept-slug"
    label: "개념 이름"
---
```

본문에서 `[[wikilink]]` 사용 — Obsidian에서 클릭 탐색, 블로그에서 링크로 렌더링.

```markdown
[[concept-slug|레이블]]              ← 개념 노트 링크
[[2026-05-05-slug|글 제목]]          ← 다른 entry 링크
```

### Concept (개념 노트)

`concepts/concept-name.md` 생성. 자세한 형식은 `CONCEPT_TEMPLATE.md` 참고.

```yaml
---
title: "개념 이름"
type: "concept"
stage: "seedling"   # seedling | budding | evergreen
tags: ["태그"]
related:
  - "2026-05-07-entry-slug"
created: "2026-05-07"
updated: "2026-05-07"
---
```

### Stage 의미

| 값 | 아이콘 | 의미 |
|---|---|---|
| `seedling` | 🌱 | 초안 |
| `budding` | 🌿 | 발전 중 |
| `evergreen` | 🌲 | 완성 |

---

## 새 기기 셋업

> **요약** — 레포는 GitHub로, Claude 설정은 iCloud 백업으로 옮긴다. 새 Mac에서 아래 세 명령이면 이 기기와 같은 환경이 된다.
> `git clone` → `restore-claude-home.sh`(새 기기에서 한 번만) → `bootstrap.sh`
> 끝나면 노트·설정 자동 배포, 학습 자동 캡처(Claude Code·Aside), 공개 검사가 모두 켜진다.

> ⚠️ **이 레포를 iCloud Drive 안에 두지 않는다.** iCloud가 `.git` 안의 파일을 내용 없는(dataless) 상태로 비우면 저장소가 깨진다. 레포는 `~/projects/claude-learning`에 두고 기기 간에는 GitHub로만 맞춘다.

### 준비물

| 항목 | 확인 방법 | 없으면 |
|---|---|---|
| macOS | — | launchd 기반이라 macOS 전용 |
| Homebrew | `brew --version` | [brew.sh](https://brew.sh) |
| Node.js 22 | `node -v` | `nvm install 22` (블로그 빌드·배포도 22) |
| GitHub SSH 키 | `ssh -T git@github.com` 가 `Hi <계정>!`을 출력 (성공해도 종료 코드는 1) | GitHub 설정에서 이 기기 키 등록 |
| Claude Code 로그인 | `claude -p "ok"` 가 ok를 출력 | `claude` 실행 후 `/login` |
| fswatch | `fswatch --version` | `brew install fswatch` |
| iCloud Drive 동기화 완료 | Finder에서 `iCloud Drive/claude/claude-code-home-backup`이 내려와 있는지 | 동기화가 끝날 때까지 대기 |
| (선택) Aside 앱 | `~/.aside/u/0` 존재 | 없으면 Aside 단계는 자동으로 건너뜀 |

### 1. 레포 받기

```bash
git clone git@github.com:project-hh-org/claude-learning.git ~/projects/claude-learning
```

### 2. Claude 설정 복원 — 새 기기에서 한 번만

iCloud 백업(`iCloud Drive/claude/claude-code-home-backup`)의 Claude 설정을 `~/.claude`에 링크로 연결한다.

```bash
bash ~/projects/claude-learning/scripts/restore-claude-home.sh
```

연결되는 것 (백업에 있는 것만):

- `~/.claude/` 의 `CLAUDE.md` · `AI-OS.md` · `rules/` · `agents/` · `commands/` · `settings.json` · `settings.local.json`
- `~/.claude/projects` (세션 기록 스냅샷)
- Claude Desktop의 `claude_desktop_config.json`

기존 실파일은 지우지 않고 `<이름>.bak-restore`로 옮겨 둔다.

> 이미 쓰고 있는 기기에서는 다시 실행하지 않는다. 지금 쓰는 `settings.json` 같은 실파일이 백업본 링크로 바뀐다. 그래서 `bootstrap.sh`는 이 단계를 자동으로 부르지 않는다.

### 3. bootstrap

```bash
bash ~/projects/claude-learning/scripts/bootstrap.sh
```

순서대로 하는 일:

| 단계 | 내용 |
|---|---|
| npm install | 블로그 빌드용 의존성 |
| `install-claude-config.sh` | 캡처 스킬·규칙·커맨드를 `~/.claude/...`에 링크, 캡처·설정 동기화 hook을 `settings.json`에 등록, 이 레포 경로를 `~/.claude/learning-vault.path`에 기록 (다른 프로젝트에서 작업해도 캡처가 항상 이 레포로 모인다) |
| 차단어 목록 | 공개 검사용 `~/.claude/learning-capture/public-denylist.txt`. 없으면 iCloud 백업 사본을 복사하고, 그것도 없으면 빈 양식을 만든다 |
| `install-launchd.sh` | launchd 작업 2개 — 자동 push 워처(상주), Aside 대화 캡처(30분마다). fswatch가 없으면 건너뛰고 안내 |
| `install-aside.sh` | Aside 스킬 링크 + Aside `AGENTS.md`에 캡처 규칙 블록. Aside가 없으면 건너뜀 |

여러 번 실행해도 결과가 같다. npm install이나 `install-claude-config.sh`가 실패하면(node가 없는 경우 등) 그 자리에서 멈추고, launchd·Aside 단계는 실패해도 경고를 남기고 다음으로 넘어간다.

### 4. 직접 채울 것

차단어 목록에 공개되면 안 되는 단어(회사명·내부 서비스명·내부 도메인·이메일 등)를 한 줄에 하나씩 적는다. 이 파일은 레포 밖에 있고, 수정하면 다음 Claude 턴이 끝날 때 iCloud 백업 사본이 자동으로 갱신된다.

```bash
open -e ~/.claude/learning-capture/public-denylist.txt
```

### 5. 확인

```bash
launchctl list | grep claude                         # learn-watcher, aside-capture 두 줄
```
```bash
tail -5 /tmp/claude-learn-watcher.log                # "감시 시작: entries concepts ideas seeds configs"
```
```bash
ls -la ~/.claude/skills/capture-concept              # → 레포의 configs/skills/capture-concept
```
```bash
tail -5 ~/.claude/learning-capture/capture.log       # 대화가 쌓이면 "후보 N개 중 N개 저장"
```

### 다시 실행해야 할 때

| 상황 | 명령 |
|---|---|
| node 버전을 바꾸거나 지웠다 (Aside 캡처가 node 경로를 기억함) | `bash scripts/install-launchd.sh` |
| 나중에 Aside를 설치했다 (한 번 사용해서 `~/.aside/u/0/sessions`가 생긴 뒤) | `bash scripts/install-aside.sh` 와 `bash scripts/install-launchd.sh` — 30분 캡처 작업은 launchd 쪽이 등록한다 |
| 캡처 hook·스킬 링크가 꼬였다 | `bash scripts/install-claude-config.sh` |
| iCloud 동기화가 덜 된 상태로 bootstrap을 돌렸다 | 동기화 후 `bash scripts/bootstrap.sh` 다시 |

### 두 기기를 같이 쓸 때

- 노트·설정은 두 기기의 워처가 각자 push한다. 다른 기기가 먼저 올렸으면 rebase 후 다시 올린다. 단, 코드에 미커밋 변경이 있으면 rebase하지 않고 로그에 경고만 남긴다.
- 코드 작업 전에는 `git pull`을 직접 한다. 워처는 push만 하고 미리 pull하지 않는다.
- 캡처 처리 위치(어디까지 읽었는지)는 기기마다 따로 관리된다. 각 기기는 자기 대화만 처리한다.

### 문제 해결

| 증상 | 원인·조치 |
|---|---|
| 워처 로그에 `🛑 공개 검사에 걸려 커밋 보류` | 표시된 줄의 자격증명·홈 경로·차단어를 고치면 다음 저장 때 다시 시도 |
| 워처 로그에 `차단어 목록을 읽을 수 없음` | 차단어 목록이 iCloud 경로를 가리키는 링크다. launchd는 iCloud를 못 읽으므로 로컬 실파일이어야 한다 — `bash scripts/bootstrap.sh`가 고친다 |
| 워처 로그에 `⏸️ push 보류` | push 안 한 코드 커밋이 있다. 직접 push하면 노트도 같이 올라간다 |
| `capture.log`에 `claude -p 실패` | `claude` 로그인 확인. 실패한 batch는 10분이 지난 뒤 다음 실행 때 다시 시도한다 (Claude Code 쪽은 다음 턴 종료 때, Aside 쪽은 다음 30분 작업 때) |
| Aside 대화가 캡처되지 않음 | `launchctl list \| grep aside-capture`로 작업이 있는지 확인. `~/.claude/learning-capture/capture.log`에 `node: command not found`가 있으면 `bash scripts/install-launchd.sh`. 그 밖의 실행 오류는 `/tmp/claude-aside-capture.log` |

---

## 로컬 개발

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # 정적 빌드 → out/
```

---

## 배포 파이프라인

```
entries/ · concepts/ · ideas/ · seeds/ · configs/ 에 파일 저장
  → launchd 워처 (scripts/watch-and-push.sh, 4초 debounce)
    - 공개 검사: 자격증명 패턴 · 홈 경로 · 차단어 목록 → 걸리면 커밋 보류
    - 그 5개 폴더만 commit + push (src/ 등 코드는 직접 커밋)
  → GitHub Actions (Next.js SSG 빌드)
  → AWS S3 sync → CloudFront 캐시 무효화
  → https://claude-learning.project-hh.com
```

워처 로그: `tail -f /tmp/claude-learn-watcher.log`

---

## 학습 자동 캡처

대화에서 새로 배운 개념과 만들어볼 만한 발상을 후보로 모으고, 사람이 고른 것만 공개한다.

| 단계 | 무엇이 | 결과 |
|---|---|---|
| 수집 (Claude Code) | Stop·SessionEnd hook `llm-capture.sh` — 새 대화를 haiku로 추출 | `concepts/_unsorted/`, `ideas/_unsorted/` (비공개, gitignore) |
| 수집 (Aside) | launchd 30분 작업 `llm-capture.sh --aside-sweep` | 위와 같음, `source: "aside"` |
| 검토 | `/review-captures` — 후보를 골라 일반화·공개 검사 후 승격 | `concepts/` · `ideas/` · `seeds/` → 워처가 배포 |
| 설정 공개 | `configs/sync.json`에 적은 `~/.claude` 설정만 Stop hook이 `configs/`로 복사 | Configs 탭 |

자세한 구조는 [`CLAUDE.md`](CLAUDE.md)의 "자동 캡처 파이프라인", 셋업 상세는 [`docs/idea-capture-setup.md`](docs/idea-capture-setup.md).

Claude Desktop **chat** 앱(claude.ai/download)은 hook·스킬을 같은 방식으로 지원하지 않아 별도 셋업이 필요하다: `bash scripts/setup-claude-desktop.sh`

---

## 인프라

| 항목 | 값 |
|------|-----|
| 호스팅 | AWS S3 + CloudFront |
| 리전 | ap-northeast-2 (서울) |
| CI/CD | GitHub Actions |
