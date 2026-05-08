'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import ListLayout from './ListLayout'
import EntryCard from './EntryCard'
import SearchInput from './SearchInput'
import TagFilter from './TagFilter'

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

  const sidebar = (
    <>
      <div className="s-card">
        <h3>📊 통계</h3>
        <div className="s-stat"><span className="l">전체 글</span><span className="v">{posts.length}</span></div>
        <div className="s-stat"><span className="l">이번 달</span><span className="v">{thisMonth}</span></div>
        <div className="s-stat"><span className="l">태그 수</span><span className="v">{allTags.length}</span></div>
      </div>
      <div className="s-card">
        <h3>🏷️ 태그</h3>
        <div className="tag-cloud">
          {allTags.map(tag => (
            <button key={tag} className="cloud-tag" onClick={() => setActiveTag(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="s-card">
        <h3>📌 새 글 추가</h3>
        <div className="s-note">
          새로운 것을 배웠다면 Claude에게:<br />
          <em>&quot;오늘 [주제] 배웠어, 러닝 로그에 추가해줘&quot;</em><br /><br />
          <code className="s-inline-code">entries/</code>에 .md 저장 → 자동 push → S3 배포
        </div>
      </div>
      <div className="s-card">
        <h3>☁️ 배포</h3>
        <div className="s-note">git push → GitHub Actions → AWS S3 + CloudFront</div>
      </div>
    </>
  )

  return (
    <ListLayout
      stats={[
        { label: '총', value: posts.length, suffix: '개' },
        { label: '태그', value: allTags.length, suffix: '개' },
      ]}
      sidebar={sidebar}
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
