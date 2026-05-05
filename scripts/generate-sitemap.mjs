/**
 * generate-sitemap.mjs
 * 빌드 후 실행 — out/sitemap.xml 생성
 * 사용: node scripts/generate-sitemap.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const ENTRIES_DIR = path.join(ROOT, 'entries')
const OUT_DIR = path.join(ROOT, 'out')
const SITE_URL = 'https://claude-learning.project-hh.com'

// out/ 폴더가 없으면 생성
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

// entries/*.md → slug + date
const slugs = fs.readdirSync(ENTRIES_DIR)
  .filter(f => f.endsWith('.md'))
  .sort()
  .reverse()
  .map(file => {
    const raw = fs.readFileSync(path.join(ENTRIES_DIR, file), 'utf-8')
    const { data } = matter(raw)
    const slug = file.replace(/\.md$/, '')
    return { slug, date: data.date || slug.slice(0, 10) }
  })

const urls = [
  `  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`,
  ...slugs.map(({ slug, date }) => `  <url>
    <loc>${SITE_URL}/${slug}/</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`),
].join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), sitemap, 'utf-8')
console.log(`✅ sitemap.xml generated (${slugs.length} posts + home)`)
