---
title: "검색 Phantom Match 패턴"
type: "concept"
stage: "evergreen"
tags: ["search", "data-quality", "silent-failure", "ai-agent"]
related: []
created: "2026-05-14"
updated: "2026-05-11"
---

# 검색 Phantom Match 패턴

검색 시스템에서 **발골(extraction)**은 쿼리에서 브랜드·카테고리·색상 같은 의미 있는 필터를 추출하는 핵심 과정이다. 이 발골 과정에 구조적 결함이 있는데도 결과가 나와서 문제를 인식하지 못하는 패턴이 Phantom Match다.

---

## 발골 사전(Extraction Dictionary) 구조

발골은 엔티티 테이블(brands, categories 등)이 아니라 별도 **발골 사전**을 통해 작동한다.

```
검색 쿼리 → 발골 사전 → 링크 테이블 → 엔티티
```

예를 들어:
- 브랜드 발골: `search_keywords(BRAND)` → `search_brand_keywords` → `brands`
- 카테고리 발골: `search_keywords(CATEGORY)` → `search_category_keywords` → 카테고리 엔티티

**핵심**: 엔티티 테이블에 브랜드가 존재해도 발골 사전에 등록되지 않으면 검색에서 추출되지 않는다.

반대로 **발골 사전에 등록됐지만 링크 테이블이 없으면** Phantom Match가 발생한다.

---

## Phantom Match 발생 조건

```
키워드 "나시" → 발골 사전에 CATEGORY 타입으로 등록 ✓
             → 카테고리 링크 테이블에 행 없음 ✗
             → 결과: Phantom Match
```

파이프라인이 이 키워드를 토큰으로 소비하기 때문에:

1. 키워드가 소비됨 → `has_extraction() = True`
2. "0건 조기 종료" 조건이 발동하지 않음
3. 카테고리 필터 없이 텍스트 매칭으로 결과 반환
4. **겉으로 보기엔 정상** (`result_count > 0`)

API 응답 패턴:
- `extracted_categories: []` (또는 `id: null`인 항목)
- `fallback_tier: 0` 또는 낮은 값 (결과가 나와서 fallback 불필요)
- `remaining_keyword: ""` (키워드가 소비됐으므로)

---

## Silent Failure vs Explicit Failure

| 구분 | 증상 | 탐지 난이도 |
|---|---|---|
| Explicit failure | result_count = 0, 빈 결과 화면 | 쉬움 — 바로 눈에 띔 |
| Phantom match (silent) | result_count > 0, 필터 미적용 | 어려움 — 담당자가 "잘 된다"고 인식 |

Phantom Match는 **0건보다 위험**한 이유가 있다. 0건은 사용자가 이탈하거나 담당자에게 피드백이 오지만, Phantom Match는 정밀도가 낮은 결과가 섞여 나오는데도 아무도 인식하지 못한 채 계속된다.

예시: "나시"를 검색했을 때 카테고리 필터 없이 텍스트에 "나시"가 포함된 상품이 모두 나온다면, 나시티셔츠와 전혀 관련없는 상품이 섞여 나올 수 있다.

---

## AI 에이전트로 탐지하는 방법

Phantom Match는 API를 매번 호출해 확인하기 전까지 수동 탐지가 어렵다. 데이터 스냅샷 기반 자동 탐지 방법:

**1단계: 발골 사전에 있지만 링크 없는 키워드 추출**

```sql
SELECT sk.id, sk.keyword, sk.keyword_type
FROM search_keywords sk
LEFT JOIN search_category_keywords sck ON sk.id = sck.search_keyword_id
WHERE sk.keyword_type = 'CATEGORY'
  AND sk.is_deleted = false
  AND sck.search_keyword_id IS NULL;
```

**2단계: 실제 검색량 교차 — 영향도 우선순위 정렬**

링크가 없는 키워드 중 실제 검색 이벤트가 많은 것을 우선 처리한다. 등록됐지만 아무도 검색 안 하는 키워드는 우선순위가 낮다.

**3단계: API 응답 검증 (샘플링)**

```
extracted_categories[0].id = null
+ fallback_tier >= 0
+ result_count > 0
```

이 조합이면 Phantom Match 확정.

**Reviewer 판단 기준:**
- 카테고리 링크만 추가하면 해결 → 수정 SQL 생성
- 어떤 카테고리에 연결해야 하는지 불명확 → 도메인 담당자 확인

---

## 관련 패턴

- **0건 조기 종료 트랩**: `has_extraction() = False AND remaining = []` → 결과 0건. Phantom Match와 반대로 발골 실패가 명시적으로 드러나는 케이스.
- **발골 사전 엔티티 분리 설계**: 발골 사전을 별도 테이블로 두면 검색 동작을 유연하게 제어할 수 있지만, 사전-링크-엔티티 일관성을 지속적으로 관리해야 하는 운영 비용이 발생한다.
