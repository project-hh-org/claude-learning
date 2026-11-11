import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { remarkWikilink, escapeWikilinkPipesInTables } from './wikilink.js'
import { resolveRelated, getBacklinks } from './links.js'

const CONFIGS_DIR = path.join(process.cwd(), 'configs')

export const CATEGORY_META = {
  rules:    { label: 'Rule',    emoji: '📋', color: 'orange' },
  hooks:    { label: 'Hook',    emoji: '🪝', color: 'green'  },
  commands: { label: 'Command', emoji: '⚡', color: 'blue'   },
  skills:   { label: 'Skill',   emoji: '🧩', color: 'blue'   },
  agents:   { label: 'Agent',   emoji: '🤖', color: 'muted'  },
}

const metaFor = category => CATEGORY_META[category] || { label: category, emoji: '📄', color: 'muted' }

/**
 * 카테고리별 파일 구조:
 *   rules/<file>.md · commands/<file>.md · agents/<file>.md  ← 평탄
 *   hooks/<file>.sh (또는 .md)                               ← 평탄, 스크립트는 코드 블록으로 표시
 *   skills/<name>/SKILL.md                                   ← 중첩 (skill 번들)
 *
 * Claude Code의 공식 발견 경로(~/.claude/<category>/...)와 같은 구조를 따른다.
 */
function listEntries(category) {
  const dir = path.join(CONFIGS_DIR, category)
  if (!fs.existsSync(dir)) return []
  if (category === 'skills') {
    return fs.readdirSync(dir)
      .filter(name => fs.statSync(path.join(dir, name)).isDirectory() && fs.existsSync(path.join(dir, name, 'SKILL.md')))
      .map(name => ({ slug: name, filePath: path.join(dir, name, 'SKILL.md') }))
  }
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') || (category === 'hooks' && f.endsWith('.sh')))
    .map(file => ({ slug: file.replace(/\.(md|sh)$/, ''), filePath: path.join(dir, file) }))
}

function listCategories() {
  if (!fs.existsSync(CONFIGS_DIR)) return []
  return fs.readdirSync(CONFIGS_DIR).filter(f => fs.statSync(path.join(CONFIGS_DIR, f)).isDirectory())
}

/**
 * 파일 → { data, content }. 셸 스크립트는 frontmatter가 없으므로
 * 상단 주석 블록의 첫 설명 문단을 description으로 쓰고 본문은 bash 코드 블록으로 감싼다.
 */
function readConfig(filePath, slug) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  if (!filePath.endsWith('.sh')) return matter(raw)

  const desc = []
  for (const line of raw.split('\n').slice(1)) {
    if (!line.startsWith('#')) break
    const text = line.replace(/^#\s?/, '').trim()
    if (/^=+$/.test(text) || text === `${slug}.sh`) continue
    if (!text) { if (desc.length) break; continue }
    desc.push(text)
  }
  return { data: { title: `${slug}.sh`, description: desc.join(' ') }, content: '```bash\n' + raw + '\n```\n' }
}

function installPathFor(category, slug, filePath) {
  if (category === 'skills') return `~/.claude/skills/${slug}/SKILL.md`
  return `~/.claude/${category}/${path.basename(filePath)}`
}

async function markdownToHtml(content) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkWikilink)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(escapeWikilinkPipesInTables(content))
  return String(result)
}

/** 전체 config 목록 (카테고리별) */
export function getAllConfigs() {
  return listCategories().flatMap(category =>
    listEntries(category).map(({ slug, filePath }) => {
      const { data } = readConfig(filePath, slug)
      return {
        slug,
        category,
        title:       data.title       || data.name || slug,
        description: data.description || '',
        tags:        data.tags        || [],
        installPath: installPathFor(category, slug, filePath),
        ...metaFor(category),
      }
    })
  )
}

/** 특정 config 상세 조회 + HTML 변환 */
export async function getConfigBySlug(category, slug) {
  const entry = listEntries(category).find(e => e.slug === slug)
  if (!entry) return null

  const { data, content } = readConfig(entry.filePath, slug)
  const contentHtml = await markdownToHtml(content)

  return {
    slug,
    category,
    title:       data.title       || data.name || slug,
    description: data.description || '',
    tags:        data.tags        || [],
    installPath: installPathFor(category, slug, entry.filePath),
    related:     resolveRelated(data.related),
    backlinks:   getBacklinks(`/configs/${category}/${slug}`),
    contentHtml,
    ...metaFor(category),
  }
}

/** generateStaticParams용 */
export function getAllConfigSlugs() {
  return listCategories().flatMap(category =>
    listEntries(category).map(({ slug }) => ({ category, slug }))
  )
}
