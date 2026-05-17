---
title: "ClickHouse JSON 컬럼 필드 추출 패턴"
type: "concept"
stage: "evergreen"
tags: ["clickhouse", "sql", "json", "analytics"]
related:
  - slug: "2026-05-07-clickhouse-terminal-access"
    label: "ClickHouse 터미널 접속"
created: "2026-05-17"
updated: "2026-05-17"
---

## 왜 필요한가

analytics 이벤트 테이블은 보통 `properties` 같은 JSON 컬럼에 이벤트별 속성을 자유형으로 저장한다. ClickHouse는 이 JSON 컬럼에서 특정 필드를 추출하는 `JSONExtract*` 함수군을 제공한다.

```sql
-- 예: app_events 테이블의 properties 컬럼
-- {"event_name":"search_executed","discovery":{"search_query":"청바지"},"result_count":240}
```

---

## 기본 추출 함수

### 문자열 — `JSONExtractString`

```sql
-- top-level 필드
JSONExtractString(properties, 'event_name')           -- "search_executed"

-- 중첩 필드 (depth 순서로 키를 나열)
JSONExtractString(properties, 'discovery', 'search_query')  -- "청바지"
```

### 숫자 — 타입별로 함수가 다름

```sql
JSONExtractInt(properties, 'discovery', 'result_count')   -- 정수
JSONExtractUInt8(properties, 'fallback_tier')             -- 부호 없는 8bit 정수 (0~255)
JSONExtractFloat(properties, 'score')                     -- 부동소수점
```

타입을 잘못 쓰면 0이나 빈 문자열이 반환된다. 확실하지 않으면 `JSONExtractString`으로 먼저 꺼내고 캐스팅하는 게 안전하다.

```sql
-- 안전한 방법: 문자열로 꺼낸 뒤 변환
toUInt8OrZero(JSONExtractString(properties, 'fallback_tier'))
```

---

## 배열 처리

### 배열 전체를 문자열로

```sql
JSONExtractString(properties, 'applied_rules')
-- 결과: '["B3","F1","D7"]'
```

### 배열 멤버십 확인 — LIKE 사용

```sql
WHERE JSONExtractString(properties, 'applied_rules') LIKE '%"D7"%'
```

> `'%D7%'`가 아니라 `'%"D7"%'`로 써야 "D7X" 같은 다른 값과 구분된다.

### 배열을 행으로 펼치기 — `arrayJoin` + `JSONExtract`

```sql
SELECT
    JSONExtractString(properties, 'search_query') AS search_query,
    arrayJoin(
        JSONExtract(properties, 'result_ids', 'Array(Int64)')
    ) AS product_id
FROM app_events
WHERE event_name = 'search_executed'
```

---

## 집계와 함께 쓰기

`countIf`, `anyIf` 등 조건부 집계 함수와 자연스럽게 결합된다.

```sql
SELECT
    JSONExtractString(properties, 'search_query') AS search_query,
    count()                                                          AS total,
    countIf(JSONExtractInt(properties, 'discovery', 'result_count') = 0)  AS zero_result_count,
    countIf(JSONExtractString(properties, 'applied_rules') LIKE '%"D7"%') AS d7_count,
    avg(JSONExtractInt(properties, 'discovery', 'result_count'))           AS avg_result_count
FROM app_events
WHERE event_name = 'search_executed'
  AND event_date >= '2026-05-01'
GROUP BY search_query
ORDER BY total DESC
```

---

## 자주 하는 실수

| 실수 | 원인 | 해결 |
|------|------|------|
| 값이 항상 0 반환 | 타입 함수 불일치 (예: 문자열 필드에 `JSONExtractInt` 사용) | `JSONExtractString`으로 먼저 확인 |
| 중첩 필드가 빈 문자열 반환 | 키 순서 틀림 | JSON 구조를 `JSONExtractString(row, 'key')` 하나씩 단계별 확인 |
| LIKE로 배열 멤버 못 찾음 | 따옴표 누락 (`%D7%` → `%"D7"%`) | 값에 따옴표 포함해서 매칭 |
| `arrayJoin` 후 행 수 급증 | 배열 원소 수만큼 행이 늘어남 | 집계 전 LIMIT으로 확인 |

---

## top-level vs 중첩 경로 구분이 중요한 이유

같은 필드명이라도 어디에 저장됐는지에 따라 경로가 달라진다. analytics 이벤트는 보통 여러 그룹이 중첩되어 있다.

```sql
-- top-level (그룹 없이 바로)
JSONExtractString(properties, 'search_remaining_keyword')

-- 중첩 (discovery 그룹 안)
JSONExtractString(properties, 'discovery', 'search_query')
```

같은 데이터처럼 보여도 경로가 다르면 빈 문자열이 반환된다. 새 필드를 처음 쿼리할 때는 `SELECT properties FROM ... LIMIT 1`로 JSON 구조를 먼저 눈으로 확인하는 게 빠르다.
