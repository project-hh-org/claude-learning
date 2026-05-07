import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'

const CONFIGS_DIR = path.join(process.cwd(), 'configs')

export const CATEGORY_META = {
  rules:    { label: 'Rule',    emoji: '📋', color: 'orange' },
  hooks:    { label: 'Hook',    emoji: '🪝', color: 'green'  },
  commands: { label: 'Command', emoji: '⚡', color: 'blue'   },
}

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

/** 전체 config 목록 (카테고리별) */
export function getAllConfigs() {
  if (!fs.existsSync(CONFIGS_DIR)) return []

  const configs = []
  const categories = fs.readdirSync(CONFIGS_DIR)
    .filter(f => fs.statSync(path.join(CONFIGS_DIR, f)).isDirectory())

  for (const category of categories) {
    const categoryDir = path.join(CONFIGS_DIR, category)
    const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.md'))

    for (const file of files) {
      const raw = fs.readFileSync(path.join(categoryDir, file), 'utf-8')
      const { data } = matter(raw)
      const slug = file.replace(/\.md$/, '')
      configs.push({
        slug,
        category,
        title:       data.title       || slug,
        description: data.description || '',
        tags:        data.tags        || [],
        ...(CATEGORY_META[category] || { label: category, emoji: '📄', color: 'muted' }),
      })
    }
  }

  return configs
}

/** 특정 config 상세 조회 + HTML 변환 */
export async function getConfigBySlug(category, slug) {
  const filePath = path.join(CONFIGS_DIR, category, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const contentHtml = await markdownToHtml(content)

  return {
    slug,
    category,
    title:       data.title       || slug,
    description: data.description || '',
    tags:        data.tags        || [],
    contentHtml,
    ...(CATEGORY_META[category] || { label: category, emoji: '📄', color: 'muted' }),
  }
}

/** generateStaticParams용 */
export function getAllConfigSlugs() {
  if (!fs.existsSync(CONFIGS_DIR)) return []

  const slugs = []
  const categories = fs.readdirSync(CONFIGS_DIR)
    .filter(f => fs.statSync(path.join(CONFIGS_DIR, f)).isDirectory())

  for (const category of categories) {
    const categoryDir = path.join(CONFIGS_DIR, category)
    const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.md'))
    for (const file of files) {
      slugs.push({ category, slug: file.replace(/\.md$/, '') })
    }
  }

  return slugs
}
