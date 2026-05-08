---
title: "AWS CLI Configuration"
type: "concept"
stage: "seedling"
tags: ["aws", "cli", "devops", "credentials"]
related: []
created: "2026-05-09"
updated: "2026-05-09"
---

## 핵심 아이디어

AWS CLI는 `~/.aws/credentials`와 `~/.aws/config` 두 파일로 자격증명과 설정을 관리하며, 프로필로 여러 계정을 전환한다.

## 상세

### 설정 파일 위치

| 파일 | 용도 |
|------|------|
| `~/.aws/credentials` | Access Key / Secret Key 저장 |
| `~/.aws/config` | Region, Output format 등 설정 |

### 자격증명 우선순위

AWS CLI는 다음 순서로 자격증명을 탐색한다:

1. 명령줄 옵션 (`--profile`)
2. 환경변수 (`AWS_ACCESS_KEY_ID` 등)
3. `~/.aws/credentials` 파일
4. `~/.aws/config` 파일
5. ECS/EKS 컨테이너 자격증명
6. EC2 인스턴스 메타데이터 (IAM Role)

## 예시 / 코드

### credentials 파일
```ini
[default]
aws_access_key_id = AKIA...
aws_secret_access_key = xxxx...

[work]
aws_access_key_id = AKIA...
aws_secret_access_key = xxxx...

[personal]
aws_access_key_id = AKIA...
aws_secret_access_key = xxxx...
```

### config 파일
```ini
[default]
region = ap-northeast-2
output = json

[profile work]
region = ap-northeast-2
output = json

[profile personal]
region = us-east-1
output = json
```

> `credentials`는 `[work]`, `config`는 `[profile work]`로 표기 (default 제외)

### 프로필 사용
```bash
# 명령어마다 지정
aws s3 ls --profile work

# 세션 기본값 (환경변수)
export AWS_PROFILE=personal

# 영구 기본값 (~/.zshrc에 추가)
echo 'export AWS_PROFILE=personal' >> ~/.zshrc
source ~/.zshrc
```

### 주요 환경변수
```bash
AWS_PROFILE              # 사용할 프로필명
AWS_ACCESS_KEY_ID        # Access Key (파일보다 우선)
AWS_SECRET_ACCESS_KEY    # Secret Key (파일보다 우선)
AWS_DEFAULT_REGION       # 기본 리전
AWS_SESSION_TOKEN        # 임시 자격증명 토큰 (STS 사용 시)
```

### 유용한 명령어
```bash
# 현재 자격증명 확인
aws sts get-caller-identity

# 설정된 프로필 목록
aws configure list-profiles

# 현재 프로필 설정 내용
aws configure list
```

## 언제 쓰나

- 로컬에서 여러 AWS 계정(개인, 회사 등)을 전환하며 작업할 때
- 팀 프로젝트와 사이드 프로젝트를 동시에 운영할 때
- CI/CD 환경변수로 자격증명을 주입할 때

## 주의

- `credentials` 파일에 키를 하드코딩하므로 절대 git에 커밋하지 않는다
- Python 번들 이슈로 Homebrew AWS CLI가 동작하지 않을 수 있음 → 공식 pkg 인스톨러 사용 권장
- 장기 Access Key 대신 IAM Identity Center(SSO) 사용을 권장하는 추세

## 연결

- [[aws-secrets-manager-pattern|AWS Secrets Manager 패턴]] — 자격증명을 코드에서 분리하는 방법
