'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import ListLayout from './ListLayout'

const KIND_META = {
  spark:     { label: 'Spark',     emoji: '💭', color: 'blue' },
  buildable: { label: 'Buildable', emoji: '🔨', color: 'orange' },
}

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

  const sidebar = (
    <>
      <div className="s-card">
        <h3>💡 Ideas란?</h3>
        <div className="s-note">
          현재 작업 중인 프로젝트와 연관된 메모/생각을 모아두는 곳.
          Claude가 thinking 중 떠올린 발상이 자동 저장됩니다.
          <br /><br />
          <strong>Spark 💭</strong>: 스치는 생각<br />
          <strong>Buildable 🔨</strong>: 실제로 만들어볼만한 것
        </div>
      </div>
      <div className="s-card">
        <h3>📊 통계</h3>
        <div className="s-stat"><span className="l">전체</span><span className="v">{counts.all}</span></div>
        <div className="s-stat"><span className="l">💭 Spark</span><span className="v">{counts.spark}</span></div>
        <div className="s-stat"><span className="l">🔨 Buildable</span><span className="v">{counts.buildable}</span></div>
        <div className="s-stat"><span className="l">태그</span><span className="v">{allTags.length}</span></div>
      </div>
      <div className="s-card">
        <h3>🌱 별개 프로젝트</h3>
        <div className="s-note">
          현재 프로젝트와 무관한 새 프로젝트 아이디어는 별도로 관리됩니다.<br />
          <button
            onClick={() => router.push('/seeds')}
            style={{ marginTop: 8, color: 'var(--accent)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
          >
            → Seeds 보기
          </button>
        </div>
      </div>
    </>
  )

  return (
    <ListLayout
      stats={[{ label: 'Ideas', value: ideas.length, suffix: '개' }]}
      sidebar={sidebar}
    >
      <div className="controls">
        <input
          className="search-input"
          type="text"
          placeholder="🔍 제목, 본문, 태그 검색..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="tags-row">
          <span className="tags-label">종류</span>
          <button
            className={`tag-btn ${activeKind === 'all' ? 'active' : ''}`}
            onClick={() => setActiveKind('all')}
          >
            전체 ({counts.all})
          </button>
          <button
            className={`tag-btn ${activeKind === 'spark' ? 'active' : ''}`}
            onClick={() => setActiveKind('spark')}
          >
            💭 Spark ({counts.spark})
          </button>
          <button
            className={`tag-btn ${activeKind === 'buildable' ? 'active' : ''}`}
            onClick={() => setActiveKind('buildable')}
          >
            🔨 Buildable ({counts.buildable})
          </button>
        </div>
      </div>

      {byMonth.length === 0 ? (
        <div className="no-results">아직 캡처된 아이디어가 없습니다.</div>
      ) : (
        byMonth.map(([ym, items]) => (
          <div key={ym} className="year-group">
            <div className="year-label">{ym}</div>
            {items.map(idea => {
              const kind = KIND_META[idea.kind] || KIND_META.spark
              return (
                <div
                  key={idea.slug}
                  className="post-card cfg-card"
                  onClick={() => router.push(`/ideas/${idea.slug}`)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && router.push(`/ideas/${idea.slug}`)}
                >
                  <div className="pc-body">
                    <div className="pc-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`cfg-badge cfg-badge--${kind.color}`}>
                        {kind.emoji} {kind.label}
                      </span>
                      {idea.title}
                    </div>
                    <div className="pc-summary">{idea.excerpt}</div>
                    <div className="pc-footer">
                      <span style={{ color: 'var(--muted)', fontSize: 12 }}>{idea.date}</span>
                      {idea.tags?.map(tag => (
                        <span key={tag} className="pc-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))
      )}
    </ListLayout>
  )
}
