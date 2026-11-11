# /ship — 기획부터 배포까지 전체 자동 실행

**순서**: plan → (debate 자동 판단) → build → review → deploy
**목적**: 명령어 하나로 전체 파이프라인 완주. 중간에 멈추지 않음.
**유일한 멈춤**: 프로덕션 배포 최종 승인 1회만.

---

아래 기능을 기획부터 스테이징 배포까지 자동으로 진행해줘.

**기능**: $ARGUMENTS

## 진행 상황 표시 (매 단계마다 출력)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /ship "<기능명>" 진행 중
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ PHASE 1  기획      완료
  ✅ PHASE 2  토론      건너뜀 (단순 기능)
  🔄 PHASE 3  구현      진행 중...
  ⬜ PHASE 4  리뷰      대기
  ⬜ PHASE 5  배포      대기
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## PHASE 1 — 기획 (plan)

product + architect + db 3명 팀 소집.
완료 시 `plan-<기능명>.md` 생성.

## PHASE 2 — 토론 자동 판단 (debate)

**사용자에게 묻지 않는다.** 아래 기준으로 자동 판단:

**자동 실행 조건** (하나라도 해당하면 debate 실행):
- 기능명 또는 plan.md 에 아래 키워드 포함:
  결제·payment·인증·auth·로그인·login·회원가입·개인정보·권한·permission·
  마이그레이션·migration·삭제·delete·리팩터링·refactor·핵심·core
- plan.md 의 리스크 메모 항목이 3개 이상
- DB 스키마 변경이 포함된 경우

**건너뜀 조건**: UI 컴포넌트 추가, 텍스트 수정, 스타일 변경 등 단순 작업

## PHASE 3 — 구현 (build)

backend + frontend + test 3명 팀 소집. tmux 3분할로 병렬 작업.
하네스 게이트: tsc → eslint → test → build
실패 시 피드백 루프 (최대 3회). 완료 시 브랜치 + Draft PR 자동 생성.

## PHASE 4 — 리뷰 (review)

reviewer + security + test 3명.
- reviewer는 새 컨텍스트로 diff만 보고, 레포에 `REVIEW.md`가 있으면 그 기준을 따른다.
- `/code-review`와 `/security-review`를 함께 돌린다.
- 판정은 Important 기준: Important 0개면 LGTM, 1개 이상이면 BLOCKING.
- LGTM → 자동으로 PHASE 5
- BLOCKING → 수정 후 1회 재시도
- 재시도도 BLOCKING → 즉시 중단 + 리포트

## PHASE 5 — 배포 (deploy)

devops + security + test 3명.
게이트 재검증 → 스테이징 자동 배포 → 스테이징 URL 출력.

스테이징 완료 후 **유일한 멈춤**:
```
프로덕션 배포할까요? (yes / no)
```

## 중단 조건
```
🚨 /ship 중단
PHASE: N / 원인: <실패 내용> / 권장 행동: /debug "<증상>"
```
