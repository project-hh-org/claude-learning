'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import ListLayout from '../layout/ListLayout'
import MetaCard from '../ui/MetaCard'
import SearchInput from '../ui/SearchInput'
import { SeedBadge } from '../ui/Badge'
import SeedsSidebar from '../sidebar/SeedsSidebar'

export default function SeedList({ seeds }) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const allTags = useMemo(() => {
    const set = new Set()
    seeds.forEach(s => s.tags?.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [seeds])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return seeds.filter(s => {
      return !q ||
        s.title.toLowerCase().includes(q) ||
        s.pitch?.toLowerCase().includes(q) ||
        s.tags?.some(t => t.toLowerCase().includes(q))
    })
  }, [seeds, query])

  return (
    <ListLayout
      stats={[{ label: 'Seeds', value: seeds.length, suffix: '개' }]}
      sidebar={<SeedsSidebar count={seeds.length} tagCount={allTags.length} />}
    >
      <div className="controls">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="🔍 제목, 피치, 태그 검색..."
        />
      </div>

      {filtered.length === 0 ? (
        <div className="no-results">아직 캡처된 새 프로젝트 씨앗이 없습니다.</div>
      ) : (
        <div className="year-group">
          {filtered.map(seed => (
            <MetaCard
              key={seed.slug}
              badge={<SeedBadge />}
              title={seed.title}
              summary={seed.pitch || '— 한 줄 피치 없음 —'}
              tags={seed.tags}
              footerExtras={
                <>
                  <span className="meta-date">{seed.date}</span>
                  {seed.origin_session_project && (
                    <span className="meta-origin">
                      ← {seed.origin_session_project}에서 발상
                    </span>
                  )}
                </>
              }
              onClick={() => router.push(`/seeds/${seed.slug}`)}
            />
          ))}
        </div>
      )}
    </ListLayout>
  )
}
