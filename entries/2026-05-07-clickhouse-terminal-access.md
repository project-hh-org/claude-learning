---
title: "ClickHouse 터미널 접속 — AWS Secrets Manager + ch 명령어"
date: "2026-05-07"
summary: "AWS Secrets Manager에서 자격증명을 매번 실시간으로 가져와 ClickHouse에 접속하는 ch 명령어를 설정했다."
tags: ["clickhouse", "aws", "secrets-manager", "security", "terminal", "devtools"]
---

## 🔍 배경 / 맥락

ClickHouse에 터미널에서 접속하고 싶었다. 보안 원칙상 자격증명을 메모리나 파일에 저장하지 않고, 매 접속마다 AWS Secrets Manager에서 실시간으로 가져오는 방식이 필요했다.

---

## 💡 배운 것

### 자격증명 위치

`danble-env-production` secret (리전: `ap-northeast-2`)에 ClickHouse 접속 정보가 포함되어 있다:

- `CLICKHOUSE_HOST`
- `CLICKHOUSE_DATABASE`
- `CLICKHOUSE_USER`
- `CLICKHOUSE_PASSWORD`

### clickhouse-client 설치 (macOS)

```bash
brew install clickhouse
```

macOS Gatekeeper가 바이너리를 차단하는 경우 격리 속성 제거:

```bash
brew reinstall --cask clickhouse && \
xattr -d com.apple.quarantine \
  /opt/homebrew/Caskroom/clickhouse/26.4.1.1141-stable/clickhouse-macos-aarch64
```

### ch 명령어 설치

매번 긴 명령어를 치지 않도록 `/opt/homebrew/bin/ch` 스크립트로 등록:

```bash
cat > /opt/homebrew/bin/ch << 'EOF'
#!/bin/bash
eval $(aws secretsmanager get-secret-value \
  --secret-id danble-env-production \
  --region ap-northeast-2 \
  --query SecretString --output text | \
  python3 -c "
import sys, json
s = json.load(sys.stdin)
print(f\"CH_HOST={s['CLICKHOUSE_HOST']}\")
print(f\"CH_DB={s['CLICKHOUSE_DATABASE']}\")
print(f\"CH_USER={s['CLICKHOUSE_USER']}\")
print(f\"CH_PASS={s['CLICKHOUSE_PASSWORD']}\")
")
clickhouse client \
  --host "$CH_HOST" \
  --database "$CH_DB" \
  --user "$CH_USER" \
  --password "$CH_PASS" \
  --secure
unset CH_HOST CH_DB CH_USER CH_PASS
EOF

chmod +x /opt/homebrew/bin/ch
```

이후 `ch` 만 치면 바로 접속된다.

---

## 🛠 접속 후 기본 쿼리

```sql
-- 테이블 목록
SHOW TABLES;

-- 스키마 확인
DESCRIBE TABLE 테이블명;

-- 샘플 조회
SELECT * FROM 테이블명 LIMIT 10;

-- 테이블별 용량
SELECT table, formatReadableSize(sum(bytes)) AS size, sum(rows) AS rows
FROM system.parts
WHERE active AND database = currentDatabase()
GROUP BY table ORDER BY sum(bytes) DESC;
```

---

## ✅ 결과

- `ch` 명령어 하나로 ClickHouse 접속
- 자격증명은 매 접속마다 AWS Secrets Manager에서 실시간 발급, 종료 후 `unset`으로 즉시 제거
- 자격증명이 히스토리·파일·환경변수 어디에도 남지 않음
