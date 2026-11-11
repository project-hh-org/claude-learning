import fs from 'fs'
import path from 'path'

/**
 * Obsidian wikilink를 링크 노드로 바꾸는 remark 플러그인
 *
 * 대상은 파일이 실제로 있는 곳으로 정한다 (Obsidian처럼 접두사 없이 써도 됨):
 * [[slug]] / [[slug|레이블]]  → entries/에 있으면 /slug, concepts/에 있으면 /concept/slug
 * [[concepts/slug]]           → /concept/slug
 * 어디에도 없으면 링크 없이 레이블만 남긴다 (404 링크 방지)
 *
 * 문자열을 raw <a>로 미리 치환하면 remark-rehype가 raw HTML을 버려 링크가
 * 사라진다. 트리의 text 노드만 바꾸므로 코드 블록·인라인 코드 안의
 * [[...]]는 그대로 남는다.
 */
export function remarkWikilink() {
  return tree => replaceInChildren(tree)
}

/**
 * 파싱 전 전처리: 표 행 안의 [[slug|레이블]]에서 `|`를 `\|`로 이스케이프한다.
 * remark-gfm이 표를 먼저 파싱하면서 wikilink 안의 `|`를 셀 경계로 자르기 때문.
 * 이미 `\|`로 쓴 것은 그대로 둔다.
 */
export function escapeWikilinkPipesInTables(content) {
  return content
    .split('\n')
    .map(line => line.trimStart().startsWith('|')
      ? line.replace(/\[\[[^\]]*\]\]/g, link => link.replace(/(?<!\\)\|/g, '\\|'))
      : line)
    .join('\n')
}

const WIKILINK = /\[\[([^\]]+)\]\]/g

function replaceInChildren(node) {
  if (!Array.isArray(node.children)) return
  node.children = node.children.flatMap(child => {
    if (child.type === 'text') return splitText(child.value)
    // 링크 안에 링크를 만들지 않는다
    if (child.type !== 'link' && child.type !== 'linkReference') replaceInChildren(child)
    return [child]
  })
}

function splitText(value) {
  const nodes = []
  let last = 0
  for (const m of value.matchAll(WIKILINK)) {
    if (m.index > last) nodes.push({ type: 'text', value: value.slice(last, m.index) })
    nodes.push(linkNode(m[1]))
    last = m.index + m[0].length
  }
  if (last === 0) return [{ type: 'text', value }]
  if (last < value.length) nodes.push({ type: 'text', value: value.slice(last) })
  return nodes
}

// 빌드 1회 동안 슬러그 목록을 한 번만 읽는다
let slugSets = null
function existingSlugs() {
  if (slugSets) return slugSets
  const read = dir => {
    const abs = path.join(process.cwd(), dir)
    return new Set(fs.existsSync(abs)
      ? fs.readdirSync(abs).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''))
      : [])
  }
  slugSets = { entries: read('entries'), concepts: read('concepts') }
  return slugSets
}

function linkNode(inner) {
  const [ref, label] = inner.split('|').map(s => s.trim())
  const slug = ref.replace(/^(concepts|entries)\//, '')
  const { entries, concepts } = existingSlugs()
  const kind = ref.startsWith('concepts/') || (!entries.has(slug) && concepts.has(slug))
    ? 'concept'
    : entries.has(slug) ? 'entry' : null
  const text = { type: 'text', value: label || slug }
  if (!kind) return text
  return {
    type: 'link',
    url: kind === 'concept' ? `/concept/${slug}` : `/${slug}`,
    data: { hProperties: { className: ['wikilink', `wikilink--${kind}`] } },
    children: [text],
  }
}

/**
 * 마크다운 본문에서 wikilink로 참조된 슬러그 목록 추출
 * 백링크 계산에 사용
 */
export function extractWikilinks(content) {
  const links = []
  const regex = /\[\[([^\]]+)\]\]/g
  let match
  while ((match = regex.exec(content)) !== null) {
    const ref = match[1].split('|')[0].trim()
    links.push(ref)
  }
  return links
}
