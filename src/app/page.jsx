// Server Component — 빌드 시 entries/*.md · concepts/*.md 직접 읽음
// Learning Log 탭은 / 와 /concept/... 둘 다 담당하므로 목록도 두 종류를 섞어 보여준다
import { getAllPosts } from '@/lib/posts'
import { getAllConcepts } from '@/lib/concepts'
import PostList from '@/components/list/PostList'

export default function HomePage() {
  const entries = getAllPosts().map(p => ({ ...p, kind: 'entry', href: `/${p.slug}` }))
  const concepts = getAllConcepts().map(c => ({
    ...c,
    kind: 'concept',
    href: `/concept/${c.slug}`,
    date: c.created || c.updated,
  }))
  const items = [...entries, ...concepts].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  return <PostList posts={items} />
}
