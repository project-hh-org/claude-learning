import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { wikilinkToHtml } from './wikilink.js'

const SEEDS_DIR = path.join(process.cwd(), 'seeds')

async function markdownToHtml(content) {
  const withLinks = wikilinkToHtml(content)
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(withLinks)
  return String(result)
}

function readSeedFiles() {
  if (!fs.existsSync(SEEDS_DIR)) return []
  return fs.readdirSync(SEEDS_DIR)
    .filter(f => f.endsWith('.md'))
}

/**
 * 본문에서 "새 프로젝트 시작 프롬프트" 섹션 안의 코드블록 추출.
 * 사용자가 한 번에 복사해 새 세션에 붙여넣게 하기 위함.
 */
function extractStarterPrompt(markdown) {
  const lines = markdown.split('\n')
  let inSection = false
  let inCode = false
  const buf = []
  for (const line of lines) {
    if (/^##\s+새\s*프로젝트\s*시작\s*프롬프트/.test(line)) {
      inSection = true
      continue
    }
    if (inSection && /^##\s/.test(line)) break
    if (!inSection) continue
    if (/^```/.test(line)) {
      if (!inCode) { inCode = true; continue }
      else { inCode = false; continue }
    }
    if (inCode) buf.push(line)
  }
  return buf.join('\n').trim()
}

function extractPitch(markdown) {
  const lines = markdown.split('\n')
  let inSection = false
  const buf = []
  for (const line of lines) {
    if (/^##\s+한\s*줄\s*피치/.test(line)) { inSection = true; continue }
    if (inSection && /^##\s/.test(line)) break
    if (inSection && line.trim()) buf.push(line.trim())
  }
  return buf.join(' ').trim().slice(0, 200)
}

export function getAllSeeds() {
  return readSeedFiles()
    .map(file => {
      const raw = fs.readFileSync(path.join(SEEDS_DIR, file), 'utf-8')
      const { data, content } = matter(raw)
      const slug = file.replace(/\.md$/, '')
      return {
        slug,
        title:                  data.title                  || slug,
        date:                   data.date                   || slug.slice(0, 10),
        scope:                  data.scope                  || 'standalone',
        source:                 data.source                 || null,
        origin_session_project: data.origin_session_project || null,
        stage:                  data.stage                  || 'seedling',
        tags:                   data.tags                   || [],
        pitch:                  extractPitch(content),
      }
    })
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

export async function getSeedBySlug(slug) {
  const filePath = path.join(SEEDS_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const contentHtml = await markdownToHtml(content)
  const starterPrompt = extractStarterPrompt(content)

  return {
    slug,
    title:                  data.title                  || slug,
    date:                   data.date                   || slug.slice(0, 10),
    scope:                  data.scope                  || 'standalone',
    source:                 data.source                 || null,
    origin_session_project: data.origin_session_project || null,
    stage:                  data.stage                  || 'seedling',
    tags:                   data.tags                   || [],
    pitch:                  extractPitch(content),
    starterPrompt,
    contentHtml,
  }
}

export function getAllSeedSlugs() {
  return readSeedFiles().map(f => ({ slug: f.replace(/\.md$/, '') }))
}
