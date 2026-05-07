---
title: "thinking replay viewer"
date: "2026-05-07"
kind: "buildable"
scope: "standalone"
source: "claude-code"
origin_session_project: "claude-learning"
stage: "seedling"
tags: ["devtools", "claude", "viewer"]
---

## 한 줄 피치

Claude Code 세션 JSONL을 시각화해서 사용자 메시지 / 어시스턴트 응답 / thinking / tool 호출을 타임라인으로 재생하는 로컬 뷰어.

## 발상 맥락

claude-learning 레포에 thinking 자동 캡처 파이프라인을 만들면서, 정작 원본 JSONL 자체를 사람이 읽기 좋은 형태로 보는 도구가 없다는 걸 깨달음. 캡처는 캡처대로 가되, 회고용으로 세션 전체를 다시 훑어보는 "리플레이" 도구가 별도로 있으면 좋겠다.

## 간단 기획

- **무엇**: `~/.claude/projects/<path>/<session>.jsonl`을 입력으로 받아 타임라인 UI로 렌더링하는 단일 페이지 데스크탑/웹 앱
- **왜**: thinking이 디스크에 있긴 하지만 JSONL은 사람이 읽기 어렵다. 회고/디버깅/배움 추출에 시각화가 필요
- **핵심 기능**:
  - 세션 목록(프로젝트별 그룹핑)
  - 메시지 타임라인 (user / assistant / tool_use / tool_result / thinking 색상 구분)
  - thinking 토글 펼치기/접기
  - tool 호출과 결과 페어링
  - 텍스트 검색 / 토큰 사용량 / 소요 시간 표시
  - 마크다운 export (선택 구간만)
- **기술 스택 제안**: Tauri + React (로컬 파일 접근), 또는 순수 정적 웹 + File System Access API
- **MVP 범위**: 단일 JSONL 파일을 드래그 드롭 → 타임라인 표시 + thinking 토글까지

## 새 프로젝트 시작 프롬프트

```
프로젝트명: claude-session-replay
목표: Claude Code 세션 JSONL을 사람이 읽기 좋은 타임라인으로 시각화하는 로컬 뷰어

요구사항:
- ~/.claude/projects/<encoded-cwd>/<session-id>.jsonl 형식 파싱
- user / assistant / tool_use / tool_result / thinking 블록을 시각적으로 구분
- thinking 블록은 기본 접힘, 클릭 시 펼침
- tool 호출과 그에 대응하는 tool_result를 시각적으로 연결
- 세션 메타(시작 시각, 모델, cwd, 메시지 수) 헤더 표시
- 텍스트 검색 기능

기술 스택: Tauri + React + TypeScript, 또는 정적 사이트(File System Access API)

첫 단계로 다음을 수행하라:
1. 프로젝트 부트스트랩 (Tauri 또는 Vite) + 기본 라우팅
2. JSONL 파서 작성 및 타입 정의 (assistant.content[].type 분기)
3. 파일 드래그 드롭 → 파싱 결과를 콘솔에 덤프하는 최소 동작 확인
4. 타임라인 컴포넌트 (블록 타입별 색상 + thinking 토글)

작업 시 주의:
- 자격증명/내부 식별자가 JSONL에 섞여 있을 수 있으므로 export 시 마스킹 옵션 고려
- 큰 JSONL(수 MB)도 부드럽게 — 가상 스크롤 검토
```
