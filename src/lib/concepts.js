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

const CONCEPTS_DIR = path.join(process.cwd(), 'concepts')

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

/** 전체 개념 노트 목록 */
export function getAllConcepts() {
  if (!fs.existsSync(CONCEPTS_DIR)) return []

  return fs.readdirSync(CONCEPTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const raw = fs.readFileSync(path.join(CONCEPTS_DIR, file), 'utf-8')
      const { data } = matter(raw)
      const slug = file.replace(/\.md$/, '')
      return {
        slug,
        title:    data.title    || slug,
        type:     'concept',
        stage:    data.stage    || 'seedling',
        tags:     data.tags     || [],
        related:  data.related  || [],
        created:  data.created  || null,
        updated:  data.updated  || null,
      }
    })
    .sort((a, b) => (b.updated || '').localeCompare(a.updated || ''))
}

/** 슬러그로 개념 노트 조회 + HTML 변환 */
export async function getConceptBySlug(slug) {
  const filePath = path.join(CONCEPTS_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const contentHtml = await markdownToHtml(content)

  return {
    slug,
    title:       data.title    || slug,
    type:        'concept',
    stage:       data.stage    || 'seedling',
    tags:        data.tags     || [],
    related:     data.related  || [],
    created:     data.created  || null,
    updated:     data.updated  || null,
    contentHtml,
  }
}

/** generateStaticParams용 slug 목록 */
export function getAllConceptSlugs() {
  if (!fs.existsSync(CONCEPTS_DIR)) return []
  return fs.readdirSync(CONCEPTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => ({ slug: f.replace(/\.md$/, '') }))
}
