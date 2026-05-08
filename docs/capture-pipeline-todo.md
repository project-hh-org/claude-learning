# 캡처 파이프라인 — 향후 작업 TODO

자동 캡처 파이프라인은 단계적으로 확장 중이다. 현재까지 완료된 것과 보류된 작업을 한곳에 기록.

## ✅ 현재 활성화된 캡처 (Hybrid: 즉시 캡처 + Stop hook 합성)

| 영역 | 트리거 | 저장 위치 | 도구 | 적용 환경 |
|---|---|---|---|---|
| **발상 (Ideas)** | thinking 중 "이런 방법도 있겠다" / "곁가지 발상" | `ideas/` | `capture-idea` skill | Code · Code Desktop · Desktop chat (셋업 후) |
| **새 프로젝트 씨앗 (Seeds)** | thinking 중 "별개 프로젝트로 만들어보면" | `seeds/` (+ starter prompt) | `capture-idea` skill | 동일 |
| **개념 (Concepts) — 즉시** | 사용자가 정의/원리/패턴/용어를 학습 | `concepts/` (seedling) | `capture-concept` skill | 동일 |
| **개념 (Concepts) — 합성 안전망** | 세션 종료 시 정의 Q&A 쌍 추출 | `concepts/_unsorted/` | `concept-synthesis.sh` Stop hook | Code/Code Desktop |
| **발상 누락 안전망** | 세션 종료 시 thinking 후처리 | `ideas/_unsorted/` | `idea-safety-net.sh` Stop hook | Code/Code Desktop |

세 영역은 **분리된 폴더**: `ideas/` · `seeds/` · `concepts/`. 폴더 단위로 성격이 다르다 (발상 vs 별개 프로젝트 vs 영구 지식).

`_unsorted/` 폴더는 Stop hook이 자동으로 떨군 후보 — 사용자가 검토 후 정식 위치로 이동(또는 삭제)해야 한다.

---

## 🚧 보류 — 다음 단계 작업

### 1. ✅ Entry 초안 슬래시 명령 (`/log-entry`) — 완료

`configs/commands/log-entry.md` 신규. 사용자가 `/log-entry` 또는 `/log-entry <주제>`로 호출 시:
- 세션 thinking/대화/작업 회고 → entries/<YYYY-MM-DD>-<slug>.md 초안 작성
- frontmatter 자동(title/date/summary/tags/related/concepts)
- 기존 entries의 1인칭 한국어 서사 어조 모방
- 사용자에게 먼저 보여주고 검토 → 승인 후 저장
- **양방향 링크 자동 갱신**: 같은 세션에서 만든 concept들의 `related`에 entry 슬러그 추가 (#3 항목도 이 명령에 임베드되어 함께 완료)

`scripts/install-claude-config.sh`에 `configs/commands/*.md` → `~/.claude/commands/*.md` 심볼릭 링크 로직 추가. `--uninstall`도 정리.

### 2. 통합된 3-way 분류 룰

현재 capture-ideas와 capture-concepts가 분리된 룰 파일이다. 동작은 잘하지만 사용자가 한 군데서 전체 흐름을 보기 어려우므로 향후 `configs/rules/capture-knowledge.md`로 통합 검토:

```
사용자가 "정의/원리"를 배운 순간   → capture-concept (concepts/)
thinking에서 "발상"이 떠오름        → capture-idea (ideas/ 또는 seeds/)
사용자가 "오늘 회고"를 요청         → /log-entry 명령
```

단, 통합으로 인한 룰 비대화 위험이 있어 우선 분리 운용 후 마찰점이 생기면 통합 검토.

### 3. 캡처 결과 후처리 자동화

- **Concept 슬러그 충돌 자동 해결**: 같은 슬러그의 기존 concept이 있을 때 보강 vs 새 슬러그 결정 로직을 스킬에서 더 명확히
- **Concept↔Entry 양방향 링크 자동 갱신**: ✅ `/log-entry` 명령에 임베드 완료 (위 #1 참조)
- **태그 표준화**: 자유로운 태그 입력으로 시간이 지나면 비슷한 태그가 갈라짐 (`tmux`, `tmux-multi`, `multi-tmux` 등) → 주기적으로 정규화하는 작은 스크립트

### 4. 모바일 자동 캡처 (현재 불가)

| 옵션 | 가능성 | 비용 |
|---|---|---|
| 로컬 MCP | ❌ 불가능 (모바일 OS 제약) | — |
| 원격 MCP 서버 운영 | ⚠️ 가능하지만 별도 프로젝트 | 서버 인프라 + 인증 + 과금 가능성 |
| Custom Instructions로 응답에 명시 출력 → 사용자가 수동 이동 | ✅ 즉시 가능 | 자동 아님 |

당장은 옵션 3(수동)만 권장. 원격 MCP는 Pro/Max 플랜 + 자체 서버 환경이 필요하므로 별개 seed로 분리해 다룰 것.

### 5. Desktop chat app의 Skill/Hook 지원 여부 공식 확인

현재 셋업은 **Skill/Hook이 chat app에서 동작하지 않을 수 있다는 가정** 아래 MCP+Custom Instructions로 우회한다. 추후 공식 문서나 실험으로 chat app도 `~/.claude/skills/`를 읽는다는 게 확인되면 setup-claude-desktop.sh를 단순화할 수 있다 — install-claude-config.sh로 통합 가능.

확인 방법:
- chat app에 `~/.claude/skills/capture-idea` 심볼릭 링크가 있는 상태에서 발동되는지 테스트
- 공식 문서 갱신 모니터링

---

## 우선순위 가이드

작업 순서 추천:

1. ✅ **현재 활성화된 캡처 정착** — 일주일~열흘 사용하며 노이즈/품질 관찰
2. **#1 (`/log-entry`)** — entries 큐레이션 보조. 가장 자주 쓸 가능성 높음
3. **#3 (양방향 링크/슬러그 충돌)** — 자료가 쌓인 후 마찰점 명확해짐
4. **#2 (통합 룰)** — 마찰이 생기면 그때 통합
5. **#5 (Desktop chat app 검증)** — 공식 문서 갱신 시 재검토
6. **#4 (모바일)** — 별도 seed로 다루기 (`seeds/`)
