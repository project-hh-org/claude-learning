'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import ListLayout from '../layout/ListLayout'
import MetaCard from '../ui/MetaCard'
import SearchInput from '../ui/SearchInput'
import TagFilter from '../ui/TagFilter'
import { KindBadge } from '../ui/Badge'
import IdeasSidebar from '../sidebar/IdeasSidebar'

export default function IdeaList({ ideas }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeKind, setActiveKind] = useState('all')

  const allTags = useMemo(() => {
    const set = new Set()
    ideas.forEach(i => i.tags?.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [ideas])

  const counts = useMemo(() => ({
    all:       ideas.length,
    spark:     ideas.filter(i => i.kind === 'spark').length,
    buildable: ideas.filter(i => i.kind === 'buildable').length,
  }), [ideas])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return ideas.filter(i => {
      const matchKind = activeKind === 'all' || i.kind === activeKind
      const matchQ = !q ||
        i.title.toLowerCase().includes(q) ||
        i.excerpt?.toLowerCase().includes(q) ||
        i.tags?.some(t => t.toLowerCase().includes(q))
      return matchKind && matchQ
    })
  }, [ideas, query, activeKind])

  const byMonth = useMemo(() => {
    const map = {}
    filtered.forEach(i => {
      const ym = i.date?.slice(0, 7) || 'unknown'
      if (!map[ym]) map[ym] = []
      map[ym].push(i)
    })
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  return (
    <ListLayout
      stats={[{ label: 'Ideas', value: ideas.length, suffix: '개' }]}
      sidebar={<IdeasSidebar counts={counts} tagCount={allTags.length} />}
    >
      <div className="controls">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="🔍 제목, 본문, 태그 검색..."
        />
        <TagFilter
          label="종류"
          options={[
            { value: 'all',       label: `전체 (${counts.all})` },
            { value: 'spark',     label: `💭 Spark (${counts.spark})` },
            { value: 'buildable', label: `🔨 Buildable (${counts.buildable})` },
          ]}
          active={activeKind}
          onSelect={setActiveKind}
        />
      </div>

      {byMonth.length === 0 ? (
        <div className="no-results">아직 캡처된 아이디어가 없습니다.</div>
      ) : (
        byMonth.map(([ym, items]) => (
          <div key={ym} className="year-group">
            <div className="year-label">{ym}</div>
            {items.map(idea => (
              <MetaCard
                key={idea.slug}
                badge={<KindBadge kind={idea.kind} />}
                title={idea.title}
                summary={idea.excerpt}
                tags={idea.tags}
                footerExtras={<span className="meta-date">{idea.date}</span>}
                onClick={() => router.push(`/ideas/${idea.slug}`)}
              />
            ))}
          </div>
        ))
      )}
    </ListLayout>
  )
}
