import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

/**
 * 사이트 전체 노트 색인 — 링크 해석과 백링크의 단일 출처.
 *
 * 노트 종류와 경로:
 *   entries/<slug>.md            → /<slug>
 *   concepts/<slug>.md           → /concept/<slug>
 *   ideas/<slug>.md              → /ideas/<slug>
 *   seeds/<slug>.md              → /seeds/<slug>
 *   configs/<cat>/<slug>.md      → /configs/<cat>/<slug>   (skills는 <slug>/SKILL.md)
 *
 * [[wikilink]]와 frontmatter related의 대상(ref)은 resolveRef로 해석한다:
 *   접두사(concepts/ ideas/ seeds/ configs/<cat>/ entries/)가 있으면 그 종류,
 *   없으면 entries → concepts → ideas → seeds 순서로 실제 파일이 있는 곳.
 * 빌드 1회 동안 색인을 한 번만 만든다.
 */

const ROOT = process.cwd()
const WIKILINK = /\[\[([^\]]+)\]\]/g
const CONFIG_CATEGORIES = ['rules', 'commands', 'agents', 'hooks', 'skills']

let index = null

function readNote(kind, slug, filePath, href) {
  const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'))
  return {
    kind,
    slug,
    href,
    title:   data.title || data.name || slug,
    summary: data.summary || data.description || '',
    related: data.related || [],
    content,
  }
}

function listMarkdown(dir) {
  const abs = path.join(ROOT, dir)
  return fs.existsSync(abs)
    ? fs.readdirSync(abs).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''))
    : []
}

function buildIndex() {
  const notes = []
  for (const slug of listMarkdown('entries'))  notes.push(readNote('entry',   slug, path.join(ROOT, 'entries',  `${slug}.md`), `/${slug}`))
  for (const slug of listMarkdown('concepts')) notes.push(readNote('concept', slug, path.join(ROOT, 'concepts', `${slug}.md`), `/concept/${slug}`))
  for (const slug of listMarkdown('ideas'))    notes.push(readNote('idea',    slug, path.join(ROOT, 'ideas',    `${slug}.md`), `/ideas/${slug}`))
  for (const slug of listMarkdown('seeds'))    notes.push(readNote('seed',    slug, path.join(ROOT, 'seeds',    `${slug}.md`), `/seeds/${slug}`))

  for (const cat of CONFIG_CATEGORIES) {
    const dir = path.join(ROOT, 'configs', cat)
    if (!fs.existsSync(dir)) continue
    const href = slug => `/configs/${cat}/${slug}`
    if (cat === 'skills') {
      for (const slug of fs.readdirSync(dir).filter(n => fs.existsSync(path.join(dir, n, 'SKILL.md')))) {
        notes.push(readNote(`config:${cat}`, slug, path.join(dir, slug, 'SKILL.md'), href(slug)))
      }
      continue
    }
    for (const slug of listMarkdown(`configs/${cat}`)) {
      notes.push(readNote(`config:${cat}`, slug, path.join(dir, `${slug}.md`), href(slug)))
    }
    // hook 스크립트(.sh)도 페이지가 있으므로 링크 대상에 넣는다 — 본문은 코드라 링크 출처로는 보지 않음
    if (cat === 'hooks') {
      for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.sh'))) {
        const slug = f.replace(/\.sh$/, '')
        notes.push({ kind: 'config:hooks', slug, href: href(slug), title: f, summary: '', related: [], content: '' })
      }
    }
  }

  const byHref = new Map(notes.map(n => [n.href, n]))
  const has = (kind, slug) => byHref.get(hrefFor(kind, slug))
  return { notes, byHref, has }
}

function hrefFor(kind, slug) {
  if (kind === 'entry')   return `/${slug}`
  if (kind === 'concept') return `/concept/${slug}`
  if (kind === 'idea')    return `/ideas/${slug}`
  if (kind === 'seed')    return `/seeds/${slug}`
  return `/configs/${kind.replace('config:', '')}/${slug}`
}

// 빌드에서는 1회만 만든다. next dev에서는 노트가 바뀌어도 반영되도록 2초가 지나면 다시 만든다
// (링크 하나 해석할 때마다 전체 파일을 다시 읽지 않게 짧게 캐시)
const DEV = process.env.NODE_ENV === 'development'
let builtAt = 0

function getIndex() {
  if (!index || (DEV && Date.now() - builtAt > 2000)) {
    index = buildIndex()
    builtAt = Date.now()
  }
  return index
}

/** ref(슬러그, 접두사 포함 가능) → 노트 또는 null */
export function resolveRef(ref) {
  const { has } = getIndex()
  const clean = String(ref).trim().replace(/^\//, '')

  const prefixed = clean.match(/^(entries|concepts|ideas|seeds)\/(.+)$/)
  if (prefixed) {
    const kind = { entries: 'entry', concepts: 'concept', ideas: 'idea', seeds: 'seed' }[prefixed[1]]
    return has(kind, prefixed[2]) || null
  }
  const config = clean.match(/^configs\/([a-z]+)\/(.+)$/)
  if (config) return has(`config:${config[1]}`, config[2]) || null

  for (const kind of ['entry', 'concept', 'idea', 'seed']) {
    const note = has(kind, clean)
    if (note) return note
  }
  return null
}

/** frontmatter related(문자열 또는 {slug,label}) → [{ href, label }] — 해석 안 되는 것은 뺀다 */
export function resolveRelated(related = []) {
  return related.flatMap(r => {
    const ref = typeof r === 'string' ? r : r?.slug
    const note = ref && resolveRef(ref)
    if (!note) return []
    const label = (typeof r === 'object' && r.label) || note.title
    return [{ href: note.href, label }]
  })
}

let backlinkMap = null
let backlinkIndex = null   // backlinkMap을 만든 색인 — 색인이 새로 만들어지면 다시 계산

// href → [이 노트를 가리키는 노트]. 코드 블록·인라인 코드 안의 [[예시]]는 링크로 치지 않는다
function getBacklinkMap() {
  const current = getIndex()
  if (backlinkMap && backlinkIndex === current) return backlinkMap
  backlinkIndex = current
  backlinkMap = new Map()
  for (const n of current.notes) {
    const prose = n.content.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
    const refs = [
      ...n.related.map(r => (typeof r === 'string' ? r : r?.slug)),
      ...[...prose.matchAll(WIKILINK)].map(m => m[1].split('|')[0].replace(/\\$/, '')),
    ].filter(Boolean)
    const targets = new Set(refs.map(ref => resolveRef(ref)?.href).filter(t => t && t !== n.href))
    for (const t of targets) {
      if (!backlinkMap.has(t)) backlinkMap.set(t, [])
      backlinkMap.get(t).push({ href: n.href, title: n.title, summary: n.summary })
    }
  }
  return backlinkMap
}

/** 이 노트를 related 또는 본문 [[wikilink]]로 가리키는 다른 노트들 */
export function getBacklinks(href) {
  return getBacklinkMap().get(href) || []
}
