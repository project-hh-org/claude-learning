---
title: "AWS Secrets Manager 자격증명 패턴"
type: "concept"
stage: "evergreen"
tags: ["aws", "security", "secrets-manager", "python", "boto3"]
related:
  - "2026-05-07-clickhouse-terminal-access"
created: "2026-05-07"
updated: "2026-05-08"
---

## 핵심 아이디어

자격증명(DB 비밀번호, API 키 등)을 코드나 `.env` 파일에 직접 적지 않는다.
**"secret의 이름"만 환경변수에 두고, 실제 값은 런타임에 AWS Secrets Manager에서 가져온다.**

코드에 값이 없으므로 커밋해도 안전하고, 시크릿이 교체되어도 배포 없이 즉시 반영된다.

---

## 왜 이 패턴인가

### 나쁜 예 — 값을 직접 저장

```bash
# .env (절대 커밋 금지지만, 실수로 커밋되면 즉시 유출)
DB_PASSWORD=super_secret_password

# 코드 내 하드코딩
password = "super_secret_password"
```

문제: 유출 시 코드 수정 + 재배포 필요. 히스토리에서 제거하기도 번거롭다.

### 좋은 예 — 이름만 저장

```bash
# .env 또는 환경변수 (커밋해도 무방)
SKQA_SECRET_NAME=prod/skqa-agent/db   # 이름만, 값은 없음
AWS_REGION=ap-northeast-2
```

실제 비밀값은 AWS Secrets Manager 내부에만 존재한다.

---

## 런타임 fetch 구조 (Python / boto3)

### 모듈 로드 시 1회 fetch

```python
# config.py
import boto3, json, os

AWS_REGION       = os.getenv("AWS_REGION", "ap-northeast-2")
SKQA_SECRET_NAME = os.environ["SKQA_SECRET_NAME"]  # 미설정 시 즉시 KeyError

def _fetch_secrets() -> dict:
    client = boto3.client("secretsmanager", region_name=AWS_REGION)
    resp   = client.get_secret_value(SecretId=SKQA_SECRET_NAME)
    return json.loads(resp["SecretString"])

# 모듈 import 시 딱 1회 실행
_secrets = _fetch_secrets()

# 이후 모든 곳에서 dict처럼 참조
DB_HOST     = _secrets["DB_HOST"]
DB_PASSWORD = _secrets["DB_PASSWORD"]
CH_HOST     = _secrets["CLICKHOUSE_HOST"]
```

**핵심 흐름:**
1. 프로세스 시작 → `import config` 실행
2. `_fetch_secrets()` → AWS SM에 HTTP 요청 1회
3. 반환된 JSON을 dict로 파싱, 모듈 변수에 바인딩
4. 이후 실행 내내 메모리에서 참조 (추가 API 호출 없음)

---

## Bash 패턴 (스크립트/CLI용)

```bash
# 매 실행 시 가져와 현재 쉘에 export
eval $(aws secretsmanager get-secret-value \
  --secret-id "prod/myapp/db" \
  --query SecretString \
  --output text | jq -r 'to_entries[] | "export \(.key)=\(.value)"')

# 이후 일반 환경변수처럼 사용
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME"
```

Python과 달리 Bash 패턴은 매 스크립트 실행마다 AWS API를 호출한다.

---

## AWS Secrets Manager에 값 저장하는 법

```bash
# 신규 생성
aws secretsmanager create-secret \
  --name "prod/myapp/db" \
  --region ap-northeast-2 \
  --secret-string '{
    "DB_HOST":     "db.example.com",
    "DB_USER":     "myuser",
    "DB_PASSWORD": "mypassword"
  }'

# 기존 업데이트 (키 교체 시)
aws secretsmanager update-secret \
  --secret-id "prod/myapp/db" \
  --secret-string '{"DB_PASSWORD": "new_password"}'
```

업데이트 후 다음 프로세스 시작 시 자동으로 새 값을 읽는다.
(실행 중인 프로세스는 재시작 전까지 이전 값 사용)

---

## 필요한 IAM 권한

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "secretsmanager:GetSecretValue",
    "Resource": "arn:aws:secretsmanager:ap-northeast-2:123456789:secret:prod/myapp/*"
  }]
}
```

EC2·Lambda·ECS라면 인스턴스/태스크 Role에 위 정책 부여. 로컬 개발이라면 `aws configure`로 프로파일 설정.

---

## 실제 적용 예 — skqa-agent

```
환경변수로 관리:        SKQA_SECRET_NAME=prod/skqa-agent/db
AWS SM 내부에 저장:    DB_HOST, DB_USER, DB_PASSWORD, CLICKHOUSE_HOST, ...
```

에이전트 실행 흐름:
```
python agent.py
  └─ import config
       └─ _fetch_secrets()  ← AWS SM 1회 호출
            └─ PG_DSN, CH_HOST, ... 설정 완료
  └─ 이후 DB 접속 / Claude CLI 서브에이전트 실행
```

Secret 교체가 필요할 때: AWS 콘솔에서 값만 바꾸면 다음 실행부터 자동 반영. 코드·환경변수 변경 없음.

---

## 언제 쓰나

- DB 비밀번호, API 키, 인증 토큰을 여러 서버/개발자가 공유해야 할 때
- 시크릿을 주기적으로 교체(rotate)해야 하는 규정이 있을 때
- `.env` 파일 관리가 번거롭거나 커밋 실수가 걱정될 때
- 팀원별로 접근 가능한 시크릿을 IAM으로 세분화하고 싶을 때

---

## 주의

- `boto3` 설치 필요 (`pip install boto3`)
- IAM 권한 `secretsmanager:GetSecretValue`가 없으면 실행 즉시 오류
- 로컬 개발 시 AWS CLI 설정 필요 (`aws configure` 또는 `~/.aws/credentials`)
- 모듈 로드 시점에 fetch하므로, 환경변수 `SKQA_SECRET_NAME`이 없으면 import 단계에서 `KeyError` 발생
- 실행 중 시크릿 교체 → 현재 프로세스는 재시작 전까지 이전 값 사용 (의도적 설계)

---

## 연결

- [[2026-05-07-clickhouse-terminal-access]] — Bash 패턴으로 ClickHouse 접속에 적용
- [[aws-secrets-manager-pattern]] — Python boto3 런타임 fetch 패턴 (skqa-agent 적용 사례)
