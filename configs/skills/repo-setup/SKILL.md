---
name: repo-setup
description: 레포에 AI 개발·리뷰 기본 구성(짧은 CLAUDE.md, REVIEW.md, PR 템플릿, CI, Claude 리뷰 Action)을 만든다. "레포 셋업", "리뷰 체계 붙여줘", 새 프로젝트 시작 시 사용.
---

# 레포 AI 개발 기본 구성

Anthropic Claude Code 팀의 리뷰 방식(2026-10 claude.dev 블로그)을 개인 레포 규모로 옮긴 것이다. 목표: 사람이 읽는 양은 줄이고, 기계 검증과 빠른 되돌리기로 품질을 지킨다.

## 0. 먼저 확인 (GROUND)
- `package.json` scripts, lockfile(패키지 매니저), 기존 `.github/`, `CLAUDE.md`, `AGENTS.md`, 테스트 러너를 읽는다.
- 이미 있는 파일은 덮어쓰지 않는다. 바꿀 내용을 diff로 보여 주고 승인 후 수정한다.
- 만들 파일 목록과 각 파일의 핵심 내용을 먼저 제시한다.

## 1. CLAUDE.md (40줄 이하 목표)
- 레포 목적 1~2줄.
- Claude가 직접 돌릴 검증 명령: 실제 존재하는 typecheck / lint / test / build 명령만.
- 파일만 봐서는 모르는 함정(경계 규칙, 수정 금지 영역, 런타임 제약)에 분량을 쓴다.
- 폴더 구조처럼 Claude가 직접 볼 수 있는 내용은 쓰지 않는다. 긴 절차는 `.claude/skills/`로 분리하고 링크만 건다.

## 2. REVIEW.md (코드 소유자 = 다희가 확정)
초안을 만들고 다희에게 확인받는다. 포함할 항목:
- 이 레포에서 "실패"의 정의 (예: 데이터 손실, 결제 오류, 엔진 경계 위반, 접근성 회귀)
- 항상 사람이 보는 경로 (인증, 결제, CI 워크플로, 배포, 마이그레이션)
- 리뷰에서 건너뛸 경로 (생성 파일, `ios/` `android/` 네이티브 산출물 등)
- Nit 최대 3개, 모든 지적에 `파일:줄` 근거 필수
- 요약 첫 줄은 `Important N · Nit N · Pre-existing N`, 없으면 "수정 필요 없음"
- 반복되는 리뷰 지적은 이 파일에 계속 추가한다.

## 3. `.github/pull_request_template.md`
```
## 변경 내용
## 테스트 방법
(실행한 명령과 결과, UI면 스크린샷)
## 위험
(영향 범위, 낮음/중간/높음)
## 되돌리는 법
```

## 4. CI (`.github/workflows/ci.yml`)
- PR과 main push에서 실행: install → typecheck → lint → test → build. 레포에 없는 단계는 넣지 않는다.
- 패키지 매니저와 Node 버전은 레포 설정에 맞춘다. 액션 버전은 고정한다.

## 5. Claude 리뷰 Action (선택, 다희 승인 후)
- `anthropics/claude-code-action`으로 PR 리뷰 워크플로를 추가하고, 프롬프트에서 REVIEW.md를 따르게 한다.
- 인증 토큰은 다희가 직접 GitHub Secrets에 넣는다. Claude는 키 값을 다루지 않는다.
- 레포 하나에서 몇 주 REVIEW.md를 다듬은 뒤 다른 레포로 넓힌다.

## 6. 마무리
- 브랜치 보호 권장 사항(CI 필수, 리뷰 스레드 해결 필수, force push 금지)을 안내만 한다. GitHub 설정 변경은 승인 후.
- 만든 파일로 CI를 한 번 돌려 통과를 확인하고 결과를 보고한다.
