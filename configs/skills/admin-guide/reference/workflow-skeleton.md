# 페이지별 가이드 병렬 작성 — Workflow 스크립트 뼈대

페이지가 많을 때(수십~수백) 사용. **사용자가 멀티에이전트/워크플로우에 옵트인한 경우에만** Workflow 도구를 쓴다. 적으면 그냥 `admin-page-documenter` 에이전트를 직렬로 몇 개 호출해도 된다.

## 핵심 교훈 (이번 구현에서 실제로 깨진 것들)
- 워크리스트를 파일에서 "에이전트로 읽어 JSON 파싱"하면 prose가 섞여 `JSON.parse` 실패 → **배열을 스크립트에 인라인 임베드**한다.
- 워크플로우 스크립트는 **플레인 JS** (TS 문법 금지: 타입주석/제네릭 ✗). 본문 최상위 `return` 은 워크플로우 컨텍스트에서 정상.
- 결과(.md)는 워크플로우가 직접 파일을 못 쓰므로 **반환값으로 받아 메인 루프에서 기록**한다.
- `effort:'low'` 로 충분(코드 읽고 정리하는 작업). 동시성은 자동 cap(≈10~16).

## 스크립트 뼈대
```js
export const meta = {
  name: 'admin-guide-drafts',
  description: 'Generate user-facing markdown guides for admin pages by reading source code',
  phases: [{ title: 'Draft', detail: 'one agent per page: read code, write guide' }],
}

phase('Draft')

const PAGES = /* [{s,l,f,r,o}] 워크리스트를 여기에 인라인 임베드 */ []
const ADMIN = '<코드베이스 절대경로>'

const GUIDE_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['folder', 'markdown', 'captureNeeds', 'difficulty'],
  properties: {
    folder: { type: 'string' },
    markdown: { type: 'string', description: 'COMPLETE .md incl frontmatter' },
    difficulty: { type: 'string', enum: ['low', 'medium', 'high'] },
    captureNeeds: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['route', 'desc'], properties: { route: { type: 'string' }, desc: { type: 'string' } } } },
  },
}

function buildPrompt(p) {
  return [
    '비개발 운영자용 어드민 사용 가이드를 작성한다.',
    '메뉴 라벨: "' + p.l + '" / route: ' + p.r + ' / 폴더: ' + p.f + ' / order: ' + p.o,
    '코드베이스: ' + ADMIN,
    'pages' + p.r + '/index 또는 app' + p.r + '/page 를 찾고, import하는 components/hooks를 읽어 동작 파악.',
    '내부 하위화면(목록/생성/수정/탭/상태)까지 한 문서에 정리. 생성vs수정·탭 차이 명확히.',
    '개발 코드 내용(변수/함수/경로/API/수식) 금지. 화면 한글 버튼·탭·컬럼·토스트만 정확히 인용. 추측 금지.',
    '콜아웃: > ⚠️경고 · > 💡팁 · > 📌노트 · > 📷캡쳐.',
    'markdown 필드 = 완전한 .md. 프론트매터: group/title/slug/order/description. 그 다음 줄에 "> 🔗 **어드민에서 열기:** [URL](URL)".',
    '캡쳐 위치마다 ![__CAPTURE__:<설명>](__PENDING__) 한 줄. captureNeeds에 {route,desc}로도.',
    'folder 필드엔 "' + p.f + '" echo.',
  ].join('\n')
}

const results = await parallel(PAGES.map(p => () =>
  agent(buildPrompt(p), { label: 'draft:' + p.f, phase: 'Draft', schema: GUIDE_SCHEMA, effort: 'low' })
    .then(r => r ? { ...r, route: p.r, label: p.l, order: p.o } : null)
))
return { drafted: results.filter(Boolean).length, total: PAGES.length, drafts: results.filter(Boolean) }
```

## 메인 루프에서 결과 기록
워크플로우 `.output`(클린 JSON)을 읽어 각 draft를 `src/content/<folder>/<slug>.md` 로 기록.
그 다음 폴더별 고유 prefix로 `__PENDING__` 자리표시자 → `capture-<fid>-NN.png` 치환, `.worklist/capfinal.json` 저장.
