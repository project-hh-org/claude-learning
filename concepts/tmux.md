---
title: "tmux 기본 개념과 명령어"
type: "concept"
stage: "evergreen"
tags: ["tmux", "terminal", "devtools", "productivity"]
related:
  - "tmux-wave-pattern"
created: "2026-05-17"
updated: "2026-05-17"
---

## 정의

터미널 멀티플렉서(Terminal Multiplexer). 하나의 터미널에서 여러 세션/창/패널을 동시에 관리하고, 세션을 끊어도 작업이 유지되는 도구.

### 핵심 가치
- **세션 유지**: SSH 연결이 끊겨도 작업이 계속 살아있음
- **화면 분할**: 하나의 터미널을 여러 패널로 분할해 동시 작업
- **세션 공유**: 여러 사람이 같은 세션에 접속 가능 (페어 프로그래밍)

---

## 3계층 구조

```
Session (세션)
└── Window (창)  ← 탭과 유사
    └── Pane (패널) ← 화면 분할 단위
```

- **Session**: tmux의 최상위 단위. 독립적인 작업 컨텍스트. 여러 세션을 동시에 실행 가능
- **Window**: 세션 안의 탭. 각 창은 독립적인 레이아웃을 가짐
- **Pane**: 창 안의 분할된 영역. 각 패널은 독립적인 쉘 프로세스

---

## Prefix 키

모든 tmux 단축키는 **Prefix** 키 조합으로 시작한다. 기본값은 `Ctrl+b`.

```
Prefix = Ctrl + b
단축키 실행 = Prefix 누른 후 손을 떼고 → 다음 키 입력
```

`~/.tmux.conf`에서 변경 가능 (많은 사람이 `Ctrl+a`로 변경):
```bash
set -g prefix C-a
unbind C-b
bind C-a send-prefix
```

---

## 세션 관리

### 터미널에서 (tmux 밖)

```bash
tmux                          # 새 세션 시작
tmux new -s <name>            # 이름 지정해 새 세션 시작
tmux ls                       # 세션 목록
tmux attach                   # 마지막 세션에 재접속
tmux attach -t <name>         # 특정 세션에 재접속
tmux kill-session -t <name>   # 특정 세션 종료
tmux kill-server              # 모든 세션 종료
```

### tmux 안에서 (Prefix 사용)

| 단축키 | 동작 |
|---|---|
| `Prefix d` | 세션 detach (세션은 유지, 터미널만 빠져나옴) |
| `Prefix s` | 세션 목록 보기 + 전환 |
| `Prefix $` | 현재 세션 이름 변경 |
| `Prefix (` | 이전 세션으로 전환 |
| `Prefix )` | 다음 세션으로 전환 |

---

## 창(Window) 관리

| 단축키 | 동작 |
|---|---|
| `Prefix c` | 새 창 생성 |
| `Prefix ,` | 현재 창 이름 변경 |
| `Prefix &` | 현재 창 닫기 |
| `Prefix n` | 다음 창으로 이동 |
| `Prefix p` | 이전 창으로 이동 |
| `Prefix 0~9` | 번호로 창 이동 |
| `Prefix w` | 창 목록 보기 + 전환 |

---

## 패널(Pane) 관리

### 분할

| 단축키 | 동작 |
|---|---|
| `Prefix %` | 좌우 수직 분할 |
| `Prefix "` | 상하 수평 분할 |

### 이동

| 단축키 | 동작 |
|---|---|
| `Prefix 방향키` | 방향키로 패널 이동 |
| `Prefix o` | 다음 패널로 순환 이동 |
| `Prefix q` | 패널 번호 표시 (번호 입력하면 이동) |

### 크기 조절

| 단축키 | 동작 |
|---|---|
| `Prefix Ctrl+방향키` | 방향키로 패널 크기 조절 |
| `Prefix z` | 현재 패널 전체화면 토글 |
| `Prefix {` | 현재 패널을 왼쪽으로 이동 |
| `Prefix }` | 현재 패널을 오른쪽으로 이동 |

### 닫기 / 레이아웃

| 단축키 | 동작 |
|---|---|
| `Prefix x` | 현재 패널 닫기 |
| `Prefix Space` | 레이아웃 순환 전환 (even-horizontal, even-vertical, main-horizontal 등) |

---

## 복사 모드 (Copy Mode)

스크롤 및 텍스트 복사를 위한 모드.

```
Prefix [         → 복사 모드 진입
방향키 / PgUp/Dn → 스크롤
q                → 복사 모드 종료
```

vi 키 바인딩 사용 시 (`.tmux.conf`에 `setw -g mode-keys vi` 설정):
```
/        → 검색 (n으로 다음, N으로 이전)
Space    → 선택 시작
Enter    → 선택 복사
Prefix ] → 붙여넣기
```

---

## 명령 모드

`Prefix :` 로 진입. tmux 명령을 직접 입력.

```bash
Prefix :new-window        # 새 창
Prefix :split-window -h   # 수직 분할 (-v: 수평)
Prefix :kill-pane         # 현재 패널 종료
Prefix :set -g mouse on   # 마우스 모드 켜기
```

---

## `.tmux.conf` 기본 설정

```bash
# ~/.tmux.conf

# Prefix를 Ctrl+a로 변경
set -g prefix C-a
unbind C-b
bind C-a send-prefix

# 마우스 지원
set -g mouse on

# 창 번호 1부터 시작
set -g base-index 1
setw -g pane-base-index 1

# 상태바 갱신 주기 (초)
set -g status-interval 5

# vi 키 바인딩 (복사 모드)
setw -g mode-keys vi

# 직관적인 분할 단축키 (현재 경로 유지)
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"

# 설정 리로드
bind r source-file ~/.tmux.conf \; display "Reloaded!"
```

설정 반영:
```bash
tmux source-file ~/.tmux.conf
# 또는 tmux 안에서: Prefix r (위 설정 적용 시)
```

---

## 자주 쓰는 패턴

### 프로젝트별 세션 분리
```bash
tmux new -s frontend   # 프론트엔드 작업용
tmux new -s backend    # 백엔드 작업용
tmux new -s db         # DB 모니터링용
```

### 개발 환경 레이아웃 (한 창에서)
```
┌─────────────┬──────────┐
│             │  git log │
│   에디터    ├──────────┤
│  (vim/nvim) │  서버    │
│             │  실행    │
└─────────────┴──────────┘
```
```bash
# 설정 방법
tmux new -s dev
Prefix %          # 좌우 분할
Prefix "          # 오른쪽 패널 상하 분할
```

### 세션 종료 없이 터미널 닫기
```
Prefix d   ← detach. 세션은 백그라운드에서 계속 실행됨
```
나중에 `tmux attach -t <name>` 으로 다시 붙으면 작업 그대로 복원.

---

## 관련 개념

- [[tmux-wave-pattern]] — tmux를 활용한 멀티 에이전트 오케스트레이션 패턴
