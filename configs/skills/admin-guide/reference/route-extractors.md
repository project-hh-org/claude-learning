# 라우트 추출 레시피 (프로젝트 타입별)

목표: "사용자가 실제로 들어가는 화면" 의 `{label, route}` 목록을 만든다. 외부 링크(`https://`)는 제외.

## 0. 메뉴 정의 파일이 최우선
대부분의 어드민은 사이드바/대시보드 메뉴를 데이터로 정의한다. 이게 있으면 라우트 파일 스캔보다 정확하다.
```bash
# 메뉴 배열/컴포넌트 후보 찾기
grep -rln "drawerList\|navList\|navigationList\|menuItems\|sidebar\|GNB\|adminDrawer" src components 2>/dev/null | grep -iv node_modules
```
찾으면 `node -e` 로 require 해서 `label→route` 를 뽑는다(예: `src/lib/data/adminDrawerList.js` 의 `drawerList[].inner[]` 형태).

## 1. Next.js Pages Router
```bash
find pages -type f \( -name "*.js" -o -name "*.tsx" \) | grep -v "_app\|_document\|api/\|404\|_error\|login" \
  | sed 's|pages||;s|\.js$||;s|\.tsx$||;s|/index$||' | sort
```
`[id]`·`[slug]` 는 상세/수정 화면 — 진입 라우트의 하위로 묶는다.

## 2. Next.js App Router
```bash
find app -name "page.tsx" -o -name "page.js" | sed 's|app||;s|/page\.[jt]sx\?$||' | sort
```

## 3. React Router / Vue Router
```bash
grep -rhoE "path[:=]\s*['\"][^'\"]+['\"]" src | sed -E "s/.*['\"]([^'\"]+)['\"].*/\1/" | sort -u
```

## 라벨/폴더 정리 규칙
- `[NEW]`, `[C1 Score]`, `[추천]` 등 `[...]` 태그 prefix 제거 → 단, 의미가 사라지면 풀어쓰기(`[C2 Unit] 관리` → `C2_Unit_관리`).
- 폴더 슬러그: 공백→`_`, `/`·`()` 제거, `?` 제거, 연속 `_` 축약.
- 같은 라벨이 둘이면 맥락으로 구분: `배너 리스트`(일반) vs `스포츠골프_배너_리스트`, `프로모션_기존` vs `프로모션_신규`.
- order = 워크리스트 내 등장 순서(메뉴 순서대로). 사이드바 정렬에 사용.

## 결과 저장
`<guide-repo>/.worklist/worklist.json` 에 `[{section,label,folder,route,order}]` 로 저장.
워크플로우에 넘길 때는 이 배열을 **스크립트에 인라인 임베드**(에이전트가 파일 파싱 시 prose 섞임 위험).
