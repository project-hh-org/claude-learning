# 코드 품질 표준

## 명명 규칙

### 변수 및 함수
- **camelCase 사용**: 변수와 함수는 소문자로 시작하고 각 단어의 첫 글자를 대문자로
  - ✅ `getUserData`, `isValid`, `totalCount`
  - ❌ `get_user_data`, `IsValid`, `total_count`

### 클래스 및 타입
- **PascalCase 사용**: 클래스, 인터페이스, 타입은 대문자로 시작
  - ✅ `UserProfile`, `ApiResponse`, `DatabaseConnection`
  - ❌ `userProfile`, `apiResponse`, `database_connection`

### 상수
- **UPPER_SNAKE_CASE 사용**: 변경 불가능한 상수
  - ✅ `MAX_RETRY_COUNT`, `API_BASE_URL`, `DEFAULT_TIMEOUT`
  - ❌ `maxRetryCount`, `apiBaseUrl`, `defaultTimeout`

### 파일명
- **kebab-case 사용**: 파일과 디렉토리명
  - ✅ `user-profile.ts`, `api-client.ts`, `database-config.ts`
  - ❌ `UserProfile.ts`, `api_client.ts`, `databaseConfig.ts`

### Boolean 변수
- **is/has/should/can 접두사 사용**
  - ✅ `isLoading`, `hasPermission`, `shouldUpdate`, `canEdit`
  - ❌ `loading`, `permission`, `update`, `edit`

---

## 함수 작성 원칙

### 단일 책임 원칙
- 각 함수는 하나의 명확한 작업만 수행
- 함수가 20줄을 초과하면 분리 검토
- 함수명이 "and"를 포함하면 분리 필요 신호

### 매개변수 관리
- 매개변수는 3개 이하로 제한
- 4개 이상 필요시 객체로 그룹화

```typescript
// ❌ 나쁜 예
function createUser(name, email, age, address, phone) {}

// ✅ 좋은 예
function createUser(userData: UserData) {}
```

### 반환값
- 일관된 반환 타입 유지
- null/undefined 대신 명시적 타입 사용
- 에러는 throw하거나 Result 타입 반환

---

## 에러 처리

### 명시적 에러 처리

```typescript
// ✅ 좋은 예
try {
  const data = await fetchData();
  return { success: true, data };
} catch (error) {
  logger.error('Failed to fetch data', { error });
  return { success: false, error: error.message };
}
```

### 에러 메시지
- 사용자 친화적이고 실행 가능한 메시지 작성
- 기술적 세부사항은 로그에만 기록
- 에러 코드로 분류 (ERR_AUTH_001, ERR_DB_002 등)

---

## 주석 작성 규칙

### JSDoc/TSDoc 사용

```typescript
/**
 * 사용자 데이터를 데이터베이스에서 조회합니다.
 *
 * @param userId - 조회할 사용자의 고유 식별자
 * @returns 사용자 정보 객체 또는 null
 * @throws {DatabaseError} 데이터베이스 연결 실패 시
 *
 * @example
 * const user = await getUserById('user-123');
 */
async function getUserById(userId: string): Promise<User | null> {}
```

### 주석 작성 시점
- **작성 필수**: 복잡한 알고리즘, 비즈니스 로직, 공개 API
- **작성 권장**: 성능 최적화 코드, 임시 해결책
- **작성 불필요**: 자명한 코드, 함수명으로 충분히 설명되는 코드

### TODO 주석 형식

```typescript
// TODO(username, 2025-02-20): 캐싱 로직 추가하여 성능 개선
// FIXME(username): 경계 조건 처리 누락
// HACK(username): 임시 해결책, 라이브러리 업데이트 후 제거 필요
```

---

## 코드 구조

### 파일 구조 순서
1. Import 문 (외부 라이브러리 → 내부 모듈)
2. 타입 정의
3. 상수
4. 헬퍼 함수
5. 메인 함수/클래스
6. Export 문

### Import 정리

```typescript
// ✅ 좋은 예: 그룹화 및 정렬
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

import { Button } from '@/components/ui';
import { useAuth } from '@/hooks';
import { ApiClient } from '@/lib/api';

import type { User, UserRole } from '@/types';
```

---

## 매직 넘버/문자열 금지

### 상수로 추출

```typescript
// ❌ 나쁜 예
if (user.age > 18) {}
setTimeout(callback, 3000);

// ✅ 좋은 예
const ADULT_AGE = 18;
const DEBOUNCE_DELAY_MS = 3000;

if (user.age > ADULT_AGE) {}
setTimeout(callback, DEBOUNCE_DELAY_MS);
```

---

## 불변성 원칙

### 데이터 변경 방지

```typescript
// ❌ 나쁜 예
function addItem(array, item) {
  array.push(item);
  return array;
}

// ✅ 좋은 예
function addItem(array, item) {
  return [...array, item];
}
```

---

## 조기 반환 패턴

### Guard Clauses 사용

```typescript
// ❌ 나쁜 예
function processUser(user) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        // 실제 로직
      }
    }
  }
}

// ✅ 좋은 예
function processUser(user) {
  if (!user) return;
  if (!user.isActive) return;
  if (!user.hasPermission) return;

  // 실제 로직
}
```

---

## 성능 고려사항

### 조기 최적화 금지
- 먼저 명확하고 올바른 코드 작성
- 프로파일링 후 병목 지점만 최적화
- 최적화 시 주석으로 이유 명시

### 메모리 관리
- 큰 객체는 사용 후 참조 해제
- 이벤트 리스너는 반드시 제거
- 타이머는 컴포넌트 언마운트 시 정리

---

## 복잡도 기준

| 지표 | 최대치 | 초과 시 조치 |
|---|---|---|
| 함수 줄 수 | 20줄 | 함수 분리 |
| 파일 줄 수 | 300줄 | 모듈 분리 |
| 중첩 깊이 | 3단계 | Guard clause 사용 |
| 매개변수 수 | 3개 | 객체로 그룹화 |
| 순환 복잡도 | 10 | 로직 단순화 |

---

## 금지 사항

### 절대 금지
- `any` 타입 사용 (TypeScript)
- `console.log` 프로덕션 코드에 남기기
- 하드코딩된 비밀 정보, API 키
- 주석 처리된 코드 커밋
- `eslint-disable` 무분별 사용

### 피해야 할 것
- 3단계 이상 중첩
- 100줄 이상 함수
- 부정 조건 (`!isNotValid`)
- 암묵적 타입 변환
- 전역 변수 사용

---

_이 규칙은 모든 프로젝트에 적용됩니다._
