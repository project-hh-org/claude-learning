import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { wikilinkToHtml, extractWikilinks } from './wikilink.js'

const ENTRIES_DIR = path.join(process.cwd(), 'entries')

/** 마크다운 본문 → HTML 변환 (wikilink 포함) */
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

/** 전체 포스트 메타데이터 목록 (최신 순) */
export function getAllPosts() {
  if (!fs.existsSync(ENTRIES_DIR)) return []

  const files = fs.readdirSync(ENTRIES_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse()

  return files.map(file => {
    const raw = fs.readFileSync(path.join(ENTRIES_DIR, file), 'utf-8')
    const { data } = matter(raw)
    const slug = file.replace(/\.md$/, '')
    return {
      slug,
      title:    data.title    || slug,
      date:     data.date     || slug.slice(0, 10),
      summary:  data.summary  || '',
      tags:     data.tags     || [],
      type:     data.type     || 'note',
      category: data.category || null,
      stage:    data.stage    || null,
      links:    data.links    || [],
      related:  data.related  || [],
      concepts: data.concepts || [],
    }
  })
}

/**
 * 빌드 타임에 백링크 맵 계산
 * { targetSlug: [{ slug, title, summary }] }
 *
 * 모든 entry의 (1) related 필드 (2) 본문 [[wikilink]]를 스캔해서
 * "나를 참조하는 글" 역방향 인덱스를 만든다.
 */
export function buildBacklinkMap() {
  if (!fs.existsSync(ENTRIES_DIR)) return {}

  const map = {}

  const files = fs.readdirSync(ENTRIES_DIR).filter(f => f.endsWith('.md'))

  for (const file of files) {
    const raw = fs.readFileSync(path.join(ENTRIES_DIR, file), 'utf-8')
    const { data, content } = matter(raw)
    const sourceSlug = file.replace(/\.md$/, '')
    const sourceMeta = {
      slug:    sourceSlug,
      title:   data.title   || sourceSlug,
      summary: data.summary || '',
    }

    // (1) frontmatter related
    const relatedSlugs = (data.related || []).map(r =>
      typeof r === 'string' ? r : r.slug
    )
    // (2) 본문 [[wikilink]]
    const wikilinkSlugs = extractWikilinks(content)

    const allTargets = [...new Set([...relatedSlugs, ...wikilinkSlugs])]

    for (const target of allTargets) {
      if (target === sourceSlug) continue
      if (!map[target]) map[target] = []
      // 중복 방지
      if (!map[target].find(m => m.slug === sourceSlug)) {
        map[target].push(sourceMeta)
      }
    }
  }

  return map
}

/** 특정 포스트 슬러그로 조회 + HTML 변환 + 백링크 포함 */
export async function getPostBySlug(slug) {
  const filePath = path.join(ENTRIES_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const contentHtml = await markdownToHtml(content)

  // related slug → { slug, label } 정규화
  const related = (data.related || []).map(r =>
    typeof r === 'string'
      ? { slug: r, label: r }
      : { slug: r.slug, label: r.label || r.slug }
  )

  // 백링크 계산
  const backlinkMap = buildBacklinkMap()
  const backlinks = backlinkMap[slug] || []

  return {
    slug,
    title:      data.title      || slug,
    date:       data.date       || slug.slice(0, 10),
    summary:    data.summary    || '',
    tags:       data.tags       || [],
    type:       data.type       || 'note',
    category:   data.category   || null,
    stage:      data.stage      || null,
    links:      data.links      || [],
    references: data.references || [],
    related,
    concepts:   data.concepts   || [],
    backlinks,
    contentHtml,
  }
}

/** generateStaticParams용 slug 목록 */
export function getAllSlugs() {
  if (!fs.existsSync(ENTRIES_DIR)) return []
  return fs.readdirSync(ENTRIES_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => ({ slug: f.replace(/\.md$/, '') }))
}
