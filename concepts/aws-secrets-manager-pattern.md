---
title: "AWS Secrets Manager 자격증명 패턴"
type: "concept"
stage: "budding"
tags: ["aws", "security", "secrets-manager", "cli"]
related:
  - "2026-05-07-clickhouse-terminal-access"
created: "2026-05-07"
updated: "2026-05-07"
---

## 핵심 아이디어

자격증명을 로컬 파일이나 환경변수에 저장하지 않고, 매 접속마다 AWS Secrets Manager에서 실시간으로 가져온다. 시크릿이 만료/교체되어도 스크립트 수정 없이 자동 반영된다.

## 패턴

```bash
# 매 실행 시 Secrets Manager에서 가져와 환경변수로 주입
eval $(aws secretsmanager get-secret-value \
  --secret-id "my-secret" \
  --query SecretString \
  --output text | jq -r 'to_entries[] | "export \(.key)=\(.value)"')
```

## 장점

- 자격증명이 디스크에 저장되지 않음 (메모리에만 존재)
- 시크릿 교체 시 스크립트 수정 불필요
- AWS IAM 권한으로 접근 제어 → 팀원별 세밀한 권한 관리

## 주의

- `aws` CLI와 `jq` 설치 필요
- IAM 권한(`secretsmanager:GetSecretValue`) 필요
- 매 실행마다 AWS API 호출 → 느릴 수 있음 (보통 200~500ms)

## 연결

- [[2026-05-07-clickhouse-terminal-access]] — ClickHouse 접속에 이 패턴 적용
