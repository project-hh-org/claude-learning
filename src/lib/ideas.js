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

const IDEAS_DIR = path.join(process.cwd(), 'ideas')

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

function readIdeaFiles() {
  if (!fs.existsSync(IDEAS_DIR)) return []
  return fs.readdirSync(IDEAS_DIR)
    .filter(f => f.endsWith('.md'))
}

export function getAllIdeas() {
  return readIdeaFiles()
    .map(file => {
      const raw = fs.readFileSync(path.join(IDEAS_DIR, file), 'utf-8')
      const { data, content } = matter(raw)
      const slug = file.replace(/\.md$/, '')
      const excerpt = content
        .replace(/^#+ .*/gm, '')
        .replace(/```[\s\S]*?```/g, '')
        .trim()
        .slice(0, 160)
      return {
        slug,
        title:                  data.title                  || slug,
        date:                   data.date                   || slug.slice(0, 10),
        kind:                   data.kind                   || 'spark',
        scope:                  data.scope                  || 'current-project',
        source:                 data.source                 || null,
        source_session_project: data.source_session_project || null,
        stage:                  data.stage                  || 'seedling',
        tags:                   data.tags                   || [],
        excerpt,
      }
    })
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

export async function getIdeaBySlug(slug) {
  const filePath = path.join(IDEAS_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const contentHtml = await markdownToHtml(content)

  return {
    slug,
    title:                  data.title                  || slug,
    date:                   data.date                   || slug.slice(0, 10),
    kind:                   data.kind                   || 'spark',
    scope:                  data.scope                  || 'current-project',
    source:                 data.source                 || null,
    source_session_project: data.source_session_project || null,
    stage:                  data.stage                  || 'seedling',
    tags:                   data.tags                   || [],
    contentHtml,
  }
}

export function getAllIdeaSlugs() {
  return readIdeaFiles().map(f => ({ slug: f.replace(/\.md$/, '') }))
}
