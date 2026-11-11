'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import ListLayout from '../layout/ListLayout'
import EntryCard from '../ui/EntryCard'
import SearchInput from '../ui/SearchInput'
import TagFilter from '../ui/TagFilter'
import LogSidebar from '../sidebar/LogSidebar'
import { ConceptBadge } from '../ui/Badge'

const TOP_TAG_COUNT = 15
const TOGGLE = '__toggle-tags'

export default function PostList({ posts }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('all')
  const [showAllTags, setShowAllTags] = useState(false)

  const allTags = useMemo(() => {
    const set = new Set()
    posts.forEach(p => p.tags?.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [posts])

  // 태그가 100개를 넘어 필터가 첫 화면을 덮으므로, 기본은 많이 쓰인 태그만 보여준다
  const topTags = useMemo(() => {
    const count = {}
    posts.forEach(p => p.tags?.forEach(t => { count[t] = (count[t] || 0) + 1 }))
    return Object.keys(count)
      .sort((a, b) => count[b] - count[a] || a.localeCompare(b))
      .slice(0, TOP_TAG_COUNT)
  }, [posts])

  const visibleTags = showAllTags
    ? allTags
    : (activeTag === 'all' || topTags.includes(activeTag) ? topTags : [...topTags, activeTag])
  const hiddenCount = allTags.length - topTags.length

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return posts.filter(p => {
      const matchTag = activeTag === 'all' || p.tags?.includes(activeTag)
      const matchQ   = !q ||
        p.title.toLowerCase().includes(q) ||
        (p.summary || '').toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      return matchTag && matchQ
    })
  }, [posts, query, activeTag])

  const byYear = useMemo(() => {
    const map = {}
    filtered.forEach(p => {
      const year = p.date?.slice(0, 4) || '2026'
      if (!map[year]) map[year] = []
      map[year].push(p)
    })
    return Object.entries(map).sort(([a], [b]) => b - a)
  }, [filtered])

  const thisMonth = useMemo(() => {
    const now = new Date()
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return posts.filter(p => p.date?.startsWith(ym)).length
  }, [posts])

  return (
    <ListLayout
      stats={[
        { label: '총', value: posts.length, suffix: '개' },
        { label: '태그', value: allTags.length, suffix: '개' },
      ]}
      sidebar={<LogSidebar posts={posts} tags={allTags} cloudTags={topTags} thisMonth={thisMonth} onTagClick={setActiveTag} />}
    >
      <div className="controls">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="🔍 제목, 내용, 태그 검색..."
        />
        <TagFilter
          label="태그"
          options={[
            { value: 'all', label: '전체' },
            ...visibleTags.map(t => ({ value: t, label: t })),
            ...(hiddenCount > 0
              ? [{ value: TOGGLE, label: showAllTags ? '접기' : `+${hiddenCount} 더보기` }]
              : []),
          ]}
          active={activeTag}
          onSelect={v => (v === TOGGLE ? setShowAllTags(s => !s) : setActiveTag(v))}
        />
      </div>

      {byYear.length === 0 ? (
        <div className="no-results">검색 결과가 없습니다.</div>
      ) : (
        byYear.map(([year, yearPosts]) => (
          <div key={year} className="year-group">
            <div className="year-label">{year}</div>
            {yearPosts.map(post => (
              <EntryCard
                key={post.href}
                date={post.date}
                badge={post.kind === 'concept' ? <ConceptBadge stage={post.stage} /> : null}
                title={post.title}
                summary={post.summary}
                tags={post.tags}
                onClick={() => router.push(post.href)}
              />
            ))}
          </div>
        ))
      )}
    </ListLayout>
  )
}
