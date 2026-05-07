---
title: "자격증명 보안 규칙"
description: "모든 외부 서비스 접근 시 적용되는 자격증명 관리 원칙. AWS Secrets Manager 기반."
category: "rules"
tags: ["security", "aws", "credentials"]
---

## AWS Secrets Manager 원칙

- 자격증명(username, password, API key, token, secret 등)은 **절대 캐싱하지 않는다**
- 매 접근마다 AWS Secrets Manager를 실시간 호출한다 (`GetSecretValueCommand`)
- credentials 변수는 함수 스코프 안에서만 존재하며, 사용 후 스코프 소멸로 GC 대상이 됨
- 모듈 스코프, 전역 변수, Zustand, Context, 파일, 로그 어디에도 credentials 저장 금지

## 외부 서비스 접근 패턴

모든 외부 서비스(DB, API, 스토리지 등) 접근은 래퍼 함수를 통한다:

```typescript
// ✅ 허용 패턴 — 매 호출마다 실시간 발급
async function withExternalService<T>(
  fn: (client: ServiceClient) => Promise<T>
): Promise<T> {
  const credentials = await fetchFromSecretManager(); // 실시간 발급
  const client = createClient(credentials);
  try {
    return await fn(client);
  } finally {
    await client.close(); // 연결 종료 → credentials 스코프 소멸
  }
}

// ❌ 금지 패턴
let cachedCreds: Credential | undefined;           // 모듈 캐싱
export const getCreds = () => fetchSecret();        // 외부 노출
const client = createClient({                       // 하드코딩
  password: process.env.DB_PASSWORD,
});
```

## 환경변수 사용 기준

| 허용 | 금지 |
|---|---|
| `CLICKHOUSE_SECRET_ARN=arn:aws:...` (참조 경로) | `DB_PASSWORD=plaintext` (실제 값) |
| `VAULT_SECRET_PATH=secret/db/prod` | `API_KEY=sk-xxx` |

## 코드 금지 항목

```typescript
// ❌ 소스코드에 자격증명 하드코딩
const API_KEY = 'sk-prod-xxxxx';

// ❌ 로그에 자격증명 출력
logger.debug('connecting with', { username, password });

// ❌ 에러 메시지에 자격증명 포함
throw new Error(`Auth failed for user=${username} pass=${password}`);
```

## Claude 에이전트 행동 규칙

- 외부 서비스에 접근할 때 사용한 자격증명을 대화, 메모리, 파일에 기록하지 않는다
- 쿼리·응답 결과에 자격증명이 포함되어 있어도 출력하지 않는다
- 매 세션마다 Secret Manager를 새로 호출하는 방식만 제안한다
- 이전 세션의 자격증명을 기억하거나 재사용하지 않는다
