---
title: "launchd 작업은 절대 경로로 실행 파일을 지정한다"
type: "concept"
stage: "seedling"
summary: "launchd는 쉘의 PATH 설정을 물려받지 않으므로, 버전 관리자로 설치한 실행 파일은 plist에 절대 경로로 적어야 하고 버전이 바뀌면 다시 설치해야 한다."
publish: false
tags: ["launchd", "macOS", "환경변수"]
related: []
created: "2026-11-11"
updated: "2026-11-11"
source: "llm-capture"
---

## 한 줄 정의
launchd로 실행되는 작업은 쉘의 환경(PATH 등)을 물려받지 않으므로, 실행 파일을 절대 경로로 지정해야 하는 방식이다.

## 핵심
- nvm처럼 버전별 경로에 설치된 node는 쉘에서만 잡히므로, launchd에서는 설치 시점의 절대 경로를 plist에 고정해야 한다.
- 나중에 node 버전을 바꾸거나 지우면 작업이 실패하는데, 실패는 별도 로그 파일에만 남아 알아채기 어렵다. 설치 스크립트를 다시 실행하도록 적어 둔다.
- 테스트할 때 환경 변수를 전부 지우면 로그인 실패처럼 보일 수 있다. 실제 plist와 같은 환경으로 검증해야 원인을 정확히 알 수 있다.

## 예시
설치 스크립트가 현재 쉘의 node 절대 경로를 찾아 plist에 기록하고, 작업을 다시 로드한다.
