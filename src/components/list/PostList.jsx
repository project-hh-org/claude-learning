'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import ListLayout from '../layout/ListLayout'
import EntryCard from '../ui/EntryCard'
import SearchInput from '../ui/SearchInput'
import TagFilter from '../ui/TagFilter'
import LogSidebar from '../sidebar/LogSidebar'

export default function PostList({ posts }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('all')

  const allTags = useMemo(() => {
    const set = new Set()
    posts.forEach(p => p.tags?.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [posts])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return posts.filter(p => {
      const matchTag = activeTag === 'all' || p.tags?.includes(activeTag)
      const matchQ   = !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
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
      sidebar={<LogSidebar posts={posts} tags={allTags} thisMonth={thisMonth} onTagClick={setActiveTag} />}
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
            ...allTags.map(t => ({ value: t, label: t })),
          ]}
          active={activeTag}
          onSelect={setActiveTag}
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
                key={post.slug}
                date={post.date}
                title={post.title}
                summary={post.summary}
                tags={post.tags}
                onClick={() => router.push(`/${post.slug}`)}
              />
            ))}
          </div>
        ))
      )}
    </ListLayout>
  )
}
