# 테스팅 표준

## 테스트 작성 원칙

### AAA 패턴 준수
모든 테스트는 Arrange-Act-Assert 패턴을 따릅니다:

```typescript
describe('calculateTotal', () => {
  it('should calculate total with tax correctly', () => {
    // Arrange: 테스트 데이터 준비
    const items = [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 }
    ];
    const taxRate = 0.1;

    // Act: 테스트 대상 실행
    const result = calculateTotal(items, taxRate);

    // Assert: 결과 검증
    expect(result).toBe(275); // (200 + 50) * 1.1
  });
});
```

### 테스트 명명 규칙
- **영어 사용**: 국제 협업 고려
- **should 패턴**: "should [expected behavior] when [condition]"
- **구체적 설명**: 무엇을 테스트하는지 명확히

```typescript
// ✅ 좋은 예
it('should return null when user is not found')
it('should throw ValidationError when email is invalid')
it('should update cache after successful API call')

// ❌ 나쁜 예
it('works')
it('test user function')
it('should work correctly')
```

---

## 테스트 커버리지 기준

### 최소 커버리지
| 영역 | 최소 | 목표 |
|---|---|---|
| 전체 코드 | 80% | 90% |
| 비즈니스 로직 | 100% | 100% |
| 유틸리티 함수 | 90% | 100% |
| UI 컴포넌트 | 70% | 80% |

### 커버리지 측정

```bash
# 커버리지 리포트 생성
npm run test:coverage

# 특정 파일만 테스트
npm test -- path/to/file.test.ts

# Watch 모드로 실행
npm test -- --watch
```

---

## 테스트 유형별 가이드

### 단위 테스트 (Unit Tests)

#### 작성 대상
- 순수 함수
- 유틸리티 함수
- 비즈니스 로직
- 데이터 변환 함수

#### 작성 원칙

```typescript
// ✅ 독립적이고 격리된 테스트
describe('formatCurrency', () => {
  it('should format number with currency symbol', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
  });

  it('should handle zero correctly', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-500, 'USD')).toBe('-$500.00');
  });
});
```

### 통합 테스트 (Integration Tests)

#### 작성 대상
- API 엔드포인트
- 데이터베이스 연동
- 외부 서비스 통합
- 모듈 간 상호작용

#### Mock 사용 원칙

```typescript
// ✅ 외부 의존성만 Mock
describe('UserService', () => {
  let mockDatabase: jest.Mocked<Database>;

  beforeEach(() => {
    mockDatabase = {
      query: jest.fn(),
      insert: jest.fn()
    } as any;
  });

  it('should create user in database', async () => {
    const userData = { name: 'John', email: 'john@example.com' };
    mockDatabase.insert.mockResolvedValue({ id: '123', ...userData });

    const service = new UserService(mockDatabase);
    const result = await service.createUser(userData);

    expect(mockDatabase.insert).toHaveBeenCalledWith('users', userData);
    expect(result.id).toBe('123');
  });
});
```

### E2E 테스트 (End-to-End Tests)

#### 작성 대상
- 주요 사용자 시나리오
- 결제 플로우
- 회원가입/로그인
- 핵심 비즈니스 프로세스

#### 작성 원칙

```typescript
// ✅ 실제 사용자 관점에서 작성
describe('User Registration Flow', () => {
  it('should complete registration successfully', async () => {
    // 회원가입 페이지 방문
    await page.goto('/signup');

    // 폼 작성
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="confirmPassword"]', 'SecurePass123!');

    // 제출
    await page.click('button[type="submit"]');

    // 성공 확인
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('.welcome-message')).toBeVisible();
  });
});
```

---

## Mock 및 Stub 가이드

### Mock 사용 시점
- 외부 API 호출
- 데이터베이스 접근
- 파일 시스템 작업
- 시간 의존적 코드
- 랜덤 값 생성

### Mock 작성 예시

```typescript
// 시간 Mock
jest.useFakeTimers();
jest.setSystemTime(new Date('2025-02-20'));

// API Mock
jest.mock('@/lib/api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ id: '1', name: 'John' })
}));

// 환경 변수 Mock
process.env.API_KEY = 'test-key';
```

---

## 테스트 데이터 관리

### Factory 패턴 사용

```typescript
// test/factories/user.factory.ts
export function createUser(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    createdAt: new Date(),
    ...overrides
  };
}

// 사용
const user = createUser({ email: 'specific@example.com' });
```

### Fixture 파일 사용

```typescript
// test/fixtures/users.json
[
  {
    "id": "user-1",
    "name": "Test User",
    "email": "test@example.com"
  }
]

// 테스트에서 사용
import users from '@/test/fixtures/users.json';
```

---

## 비동기 테스트

### Promise 처리

```typescript
// ✅ async/await 사용
it('should fetch user data', async () => {
  const user = await fetchUser('123');
  expect(user.name).toBe('John');
});

// ❌ 콜백 사용 지양
it('should fetch user data', (done) => {
  fetchUser('123').then(user => {
    expect(user.name).toBe('John');
    done();
  });
});
```

### 타임아웃 처리

```typescript
it('should timeout after 5 seconds', async () => {
  await expect(longRunningOperation()).rejects.toThrow('Timeout');
}, 10000); // Jest 타임아웃 설정
```

### 폴링/재시도 테스트

```typescript
it('should retry on failure', async () => {
  const mockFetch = jest.fn()
    .mockRejectedValueOnce(new Error('Network error'))
    .mockRejectedValueOnce(new Error('Network error'))
    .mockResolvedValueOnce({ data: 'success' });

  const result = await fetchWithRetry(mockFetch, 3);

  expect(mockFetch).toHaveBeenCalledTimes(3);
  expect(result.data).toBe('success');
});
```

---

## 컴포넌트 테스트 (React)

### 렌더링 테스트

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('should render with given label', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 사용자 상호작용

```typescript
import userEvent from '@testing-library/user-event';

it('should update input value on type', async () => {
  const user = userEvent.setup();
  render(<Input />);

  const input = screen.getByRole('textbox');
  await user.type(input, 'Hello World');

  expect(input).toHaveValue('Hello World');
});
```

---

## 테스트 체크리스트

### 각 테스트에서 확인할 사항

- [ ] 정상 케이스 (Happy Path)
- [ ] 경계값 (Boundary Values)
- [ ] 에러 케이스 (Error Cases)
- [ ] 빈 값/null/undefined
- [ ] 엣지 케이스 (Edge Cases)

### 컴포넌트 테스트 체크리스트

- [ ] 기본 렌더링
- [ ] Props에 따른 조건부 렌더링
- [ ] 사용자 인터랙션
- [ ] 에러 상태
- [ ] 로딩 상태
- [ ] 빈 상태
- [ ] 접근성 (a11y)

### API 테스트 체크리스트

- [ ] 성공 응답 (200, 201)
- [ ] 클라이언트 에러 (400, 401, 403, 404)
- [ ] 서버 에러 (500, 502, 503)
- [ ] 네트워크 에러
- [ ] 타임아웃

---

## 안티패턴

### 피해야 할 것

```typescript
// ❌ 구현 세부사항 테스트
expect(component.state.isOpen).toBe(true);

// ❌ 스냅샷 과용
expect(component).toMatchSnapshot();

// ❌ 테스트 간 상태 공유
let sharedState;
beforeEach(() => { sharedState = {}; });

// ❌ 타이머 직접 사용
await new Promise(r => setTimeout(r, 1000));

// ❌ 테스트에서 로직 구현
const expected = items.filter(i => i.active).map(i => i.name);
```

### 올바른 방법

```typescript
// ✅ 사용자 관점 테스트
expect(screen.getByRole('dialog')).toBeVisible();

// ✅ 명시적 assertion
expect(screen.getByText('Hello')).toBeInTheDocument();

// ✅ 각 테스트에서 독립적 설정
it('test', () => {
  const state = createTestState();
});

// ✅ fake timers 사용
jest.useFakeTimers();
jest.advanceTimersByTime(1000);

// ✅ 테스트 데이터 명시
expect(screen.getByText('Active Item')).toBeInTheDocument();
```

---

## 테스트 환경 설정

### Jest 설정 (jest.config.js)

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### 테스트 셋업 (jest.setup.js)

```javascript
import '@testing-library/jest-dom';

// Mock 설정
jest.mock('next/router', () => require('next-router-mock'));

// 전역 설정
beforeEach(() => {
  jest.clearAllMocks();
});
```

---

_이 규칙은 모든 프로젝트에 적용됩니다._
