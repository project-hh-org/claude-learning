import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'

const ENTRIES_DIR = path.join(process.cwd(), 'entries')

/** 마크다운 본문 → HTML 변환 (빌드 시 서버에서 실행) */
async function markdownToHtml(content) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(content)
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
      type:     data.type     || 'note',   // 'note' | 'lab'
      category: data.category || null,
      stage:    data.stage    || null,
      links:    data.links    || [],
    }
  })
}

/** 특정 포스트 슬러그로 조회 + HTML 변환 */
export async function getPostBySlug(slug) {
  const filePath = path.join(ENTRIES_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const contentHtml = await markdownToHtml(content)

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
