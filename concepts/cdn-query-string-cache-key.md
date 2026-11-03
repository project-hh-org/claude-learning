---
title: "CDN 캐시 키에서 쿼리스트링이 빠지면 이미지가 안 바뀐다"
type: "concept"
stage: "seedling"
category: "Engineering"
summary: "이미지를 저장해도 옛 이미지가 보이고 리사이징 파라미터가 무시될 때, 코드보다 먼저 그 경로에 걸린 CDN 캐시 정책이 쿼리스트링을 캐시 키에 넣는지 확인한다."
publish: true
tags: ["CDN", "CloudFront", "cache", "image"]
related: []
created: "2026-10-23"
updated: "2026-10-23"
---

## 핵심 아이디어

이미지를 저장해도 옛 이미지가 보이고 `?w=960&f=webp` 같은 리사이징 파라미터가 무시되면, 어드민이나 웹 코드보다 먼저 **그 경로에 연결된 CDN 캐시 정책**을 확인한다. 쿼리스트링을 캐시 키에서 빼는 정책이 붙어 있으면 모든 변형이 하나의 캐시로 뭉개진다.

## 실제로 있었던 일

- 특정 이미지 경로만 저장해도 바뀌지 않고, 리사이징도 되지 않았다.
- 원인은 그 경로 전용 behavior에 **폰트용 캐시 정책**이 잘못 연결된 것이었다. 이 정책은 쿼리스트링을 캐시 키에서 무시(`QueryStringBehavior: none`)하고 TTL이 1년이었다.
- 그래서 `?w=960`, `?w=480` 요청이 모두 같은 캐시를 받았고, 무효화하기 전에는 1년 동안 바뀌지 않았다.
- 리사이징 함수(Lambda@Edge)와 origin request 정책은 정상이었다. 무효화 코드도 정상이었다.

## 해결

1. 문제 경로 behavior의 캐시 정책을 미디어용 정책으로 바꾼다. 리사이징에 쓰는 쿼리스트링(`q`, `f`, `w`, `h`)을 whitelist로 캐시 키에 넣는 정책이다.
2. 정책을 바꿔도 이미 쌓인 캐시는 그대로다. 해당 경로를 **한 번 무효화**한다.

## 진단 방법

```bash
curl -sI 'https://<cdn>/<path>/image.png?w=960&f=webp&q=85' | grep -i content-type
```

- `content-type: image/webp`가 나오면 리사이징이 정상이다.
- 요청한 `f=webp`와 다르게 원본 형식(png, jpeg)이 그대로 오면, 그 behavior가 리사이징을 타지 않거나 쿼리스트링이 캐시 키나 origin으로 넘어가지 않는 것이다.

## 언제 쓰나

- '저장했는데 안 바뀐다'는 문제를 무효화 코드나 프론트 캐시부터 의심하고 있을 때
- 리사이징이 기본 behavior에서는 되는데 특정 경로에서만 안 될 때

## 주의

- CDN behavior는 경로 패턴별로 정책이 따로 붙는다. 기본 behavior가 정상이어도 전용 behavior는 다를 수 있다.
- 캐시 정책(캐시 키)과 origin request 정책(origin으로 넘기는 값)은 별개다. 둘 다 쿼리스트링을 넘겨야 리사이징 결과가 변형별로 캐시된다.
