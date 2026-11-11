// 자동 하이라이터 v4 — Chrome DevTools MCP의 evaluate_script function 본문에 그대로 넣는다.
// 페이지의 핵심 UI를 "기능(영역) 단위"로 색 구분 번호 배지 + 같은 색 테두리로 표시한다.
//   상단 액션 버튼(등록/추가/업로드/다운로드 등, 검색류 제외) = 빨강
//   탭 = 보라
//   검색/필터 영역 = 초록 — ★ 필터 입력칸 + 검색/조회/초기화 버튼을 "한 박스"로 묶는다(연관된 것끼리)
//   표 헤더 = 파랑
// 배지는 박스 좌상단 "바깥쪽"(위·왼쪽으로 30px)에 둬서 테두리와 겹치지 않게 한다.
// 캡쳐 후 document.getElementById('__hl_layer')?.remove() 로 정리.
() => {
  document.getElementById('__hl_layer')?.remove();
  const L = document.createElement('div'); L.id = '__hl_layer';
  Object.assign(L.style, { position: 'absolute', left: 0, top: 0, width: '100%', height: document.body.scrollHeight + 'px', pointerEvents: 'none', zIndex: 2147483647 });
  document.body.appendChild(L);
  const C = { blue: '#2563eb', green: '#16a34a', orange: '#ea580c', purple: '#7c3aed', red: '#dc2626' };
  const circ = ['①', '②', '③', '④', '⑤', '⑥']; let idx = 0; const used = [];
  // 배지: 박스 좌상단 바깥(위·왼쪽 30px) — 테두리와 겹침 방지
  const bd = (s, c, x, y) => { const b = document.createElement('div'); b.textContent = s; Object.assign(b.style, { position: 'absolute', left: (x - 30) + 'px', top: (y - 30) + 'px', width: '30px', height: '30px', background: c, color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 16px sans-serif', boxShadow: '0 2px 6px rgba(0,0,0,.4)', border: '2px solid #fff' }); L.appendChild(b); };
  // 박스: 문서 가로 폭(scrollWidth) 안으로 좌/우 클램프 → 뷰포트 밖으로 잘리지 않게 한다.
  const docW = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth, innerWidth);
  const bx = (r, c, p) => { p = p ?? 6; let bl = r.left + scrollX - p, bt = r.top + scrollY - p, bw = r.width + p * 2; if (bl < 2) { bw += bl - 2; bl = 2; } if (bl + bw > docW - 2) bw = docW - 2 - bl; const d = document.createElement('div'); Object.assign(d.style, { position: 'absolute', left: bl + 'px', top: bt + 'px', width: bw + 'px', height: (r.height + p * 2) + 'px', border: '3px solid ' + c, borderRadius: '8px', boxSizing: 'border-box' }); L.appendChild(d); return { bl, bt }; };
  const sy = scrollY, vw = innerHeight;
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 8 && r.height > 8 && r.bottom > sy - 40 && r.top < sy + vw + 40; };
  const rectsOf = els => els.map(e => e.getBoundingClientRect());
  const gr = rs => ({ left: Math.min(...rs.map(r => r.left)), top: Math.min(...rs.map(r => r.top)), width: Math.max(...rs.map(r => r.right)) - Math.min(...rs.map(r => r.left)), height: Math.max(...rs.map(r => r.bottom)) - Math.min(...rs.map(r => r.top)) });
  // 배지는 박스의 (클램프된) 좌상단 기준 → 박스가 화면 안으로 당겨지면 배지도 같이 들어온다.
  const mark = (rs, c) => { if (!rs.length) return; const r = gr(rs); const { bl, bt } = bx(r, c, 6); bd(circ[idx++], c, bl + 6, bt + 6); used.push(c); };
  const m = document.querySelector('main') || document.body; const mt = m.getBoundingClientRect().top + sy;
  // 검색 액션 버튼은 '검색'(정확)/'초기화'/'적용'/'필터'만. '배송조회'·'상세조회' 류 행 버튼이 '조회' 부분매칭으로 잡혀
  // 초록 박스가 표 끝까지 늘어나던 버그 방지 → 단독 '조회' 매칭 제거.
  const isSearch = t => { t = (t || '').trim(); return t === '검색' || t === '초기화' || t === '적용' || t === '필터' || /^search$/i.test(t); };
  const tabs = [...m.querySelectorAll('[role=tab],.MuiTab-root')].filter(vis);
  const allBtns = [...m.querySelectorAll('button,.MuiButton-root')].filter(e => vis(e) && !tabs.includes(e) && e.textContent.trim() && e.textContent.trim().length < 28);
  // 입력칸: 체크박스/스위치/라디오 제외
  const inputsAll = [...m.querySelectorAll('input,textarea,select,.MuiSelect-select,[role=combobox]')].filter(vis)
    .filter(i => !/checkbox|radio/i.test(i.type || '') && !/PrivateSwitchBase|MuiSwitch/.test(i.className || ''));
  // 검색 행 기준선(anchor): 검색버튼 최상단, 없으면 첫 입력칸
  let searchBtns = allBtns.filter(b => isSearch(b.textContent));
  const anchorTop = searchBtns.length ? Math.min(...searchBtns.map(b => b.getBoundingClientRect().top)) : (inputsAll[0] ? inputsAll[0].getBoundingClientRect().top : mt + 10);
  // 검색 영역은 anchor 근처(±70px)만 → 표 행의 입력/버튼이 박스를 키우는 것 방지
  const fInputs = inputsAll.filter(i => Math.abs(i.getBoundingClientRect().top - anchorTop) < 70);
  searchBtns = searchBtns.filter(b => Math.abs(b.getBoundingClientRect().top - anchorTop) < 70);
  const topBtns = allBtns.filter(b => !isSearch(b.textContent) && (b.getBoundingClientRect().top + sy) < mt + 300 && Math.abs(b.getBoundingClientRect().top - anchorTop) >= 70);
  // 표 헤더: 검색 행(anchor ±70px)과 겹치는 헤더는 제외 → 검색창이 파랑으로 잡히는 것 방지.
  const ths = [...m.querySelectorAll('thead th,[role=columnheader]')].filter(vis)
    .filter(th => Math.abs(th.getBoundingClientRect().top - anchorTop) >= 70);
  // 순서: 상단 버튼 → 탭 → 검색/필터(+검색버튼) → 표 헤더
  if (topBtns.length) mark(rectsOf(topBtns.slice(0, 8)), C.red);
  if (tabs.length) mark(rectsOf(tabs), C.purple);
  if (fInputs.length || searchBtns.length) mark(rectsOf([...fInputs.slice(0, 16), ...searchBtns]), C.green);
  if (ths.length) mark(rectsOf(ths), C.blue);
  if (idx === 0) { const nav = m.querySelector('nav'); if (nav && vis(nav)) mark([nav.getBoundingClientRect()], C.purple); }
  return { used };
}
