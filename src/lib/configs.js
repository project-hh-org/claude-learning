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
  skills:   { label: 'Skill',   emoji: '🧩', color: 'blue'   },
}

/**
 * skills/는 다른 카테고리와 구조가 다르다:
 *   rules/<file>.md          ← 평탄
 *   hooks/<file>.md          ← 평탄
 *   commands/<file>.md       ← 평탄
 *   skills/<name>/SKILL.md   ← 중첩 (skill 번들)
 *
 * Claude Code의 공식 Skill 발견 경로(~/.claude/skills/<name>/SKILL.md)와
 * 동일한 구조를 따른다.
 */
function listSkillEntries(skillsDir) {
  if (!fs.existsSync(skillsDir)) return []
  return fs.readdirSync(skillsDir)
    .filter(name => {
      const sub = path.join(skillsDir, name)
      return fs.statSync(sub).isDirectory() && fs.existsSync(path.join(sub, 'SKILL.md'))
    })
    .map(name => ({
      slug:     name,
      filePath: path.join(skillsDir, name, 'SKILL.md'),
    }))
}

function installPathFor(category, slug) {
  if (category === 'skills') return `~/.claude/skills/${slug}/SKILL.md`
  return `~/.claude/${category}/${slug}.md`
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

    const entries = category === 'skills'
      ? listSkillEntries(categoryDir)
      : fs.readdirSync(categoryDir)
          .filter(f => f.endsWith('.md'))
          .map(file => ({
            slug:     file.replace(/\.md$/, ''),
            filePath: path.join(categoryDir, file),
          }))

    for (const { slug, filePath } of entries) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(raw)
      configs.push({
        slug,
        category,
        title:       data.title       || data.name || slug,
        description: data.description || '',
        tags:        data.tags        || [],
        installPath: installPathFor(category, slug),
        ...(CATEGORY_META[category] || { label: category, emoji: '📄', color: 'muted' }),
      })
    }
  }

  return configs
}

/** 특정 config 상세 조회 + HTML 변환 */
export async function getConfigBySlug(category, slug) {
  const filePath = category === 'skills'
    ? path.join(CONFIGS_DIR, category, slug, 'SKILL.md')
    : path.join(CONFIGS_DIR, category, `${slug}.md`)

  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const contentHtml = await markdownToHtml(content)

  return {
    slug,
    category,
    title:       data.title       || data.name || slug,
    description: data.description || '',
    tags:        data.tags        || [],
    installPath: installPathFor(category, slug),
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
    const entries = category === 'skills'
      ? listSkillEntries(categoryDir).map(e => e.slug)
      : fs.readdirSync(categoryDir)
          .filter(f => f.endsWith('.md'))
          .map(f => f.replace(/\.md$/, ''))
    for (const slug of entries) {
      slugs.push({ category, slug })
    }
  }

  return slugs
}
