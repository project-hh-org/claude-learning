'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import ListLayout from './ListLayout'

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

  const sidebar = (
    <>
      <div className="s-card">
        <h3>🌱 Seeds란?</h3>
        <div className="s-note">
          현재 작업 중인 프로젝트와 <strong>완전히 무관한</strong> 새 프로젝트 아이디어 모음.
          <br /><br />
          각 항목에는 간단 기획과 새 Claude 세션에 그대로 붙여넣을 수 있는 <strong>starter prompt</strong>가 포함됩니다.
          <br /><br />
          나중에 새 레포를 시작할 때 starter prompt를 복사해 작업을 즉시 시작할 수 있습니다.
        </div>
      </div>
      <div className="s-card">
        <h3>📊 통계</h3>
        <div className="s-stat"><span className="l">전체 씨앗</span><span className="v">{seeds.length}</span></div>
        <div className="s-stat"><span className="l">태그</span><span className="v">{allTags.length}</span></div>
      </div>
      <div className="s-card">
        <h3>💡 메모 보기</h3>
        <div className="s-note">
          현재 프로젝트 맥락의 메모는 별도로 관리됩니다.<br />
          <button
            onClick={() => router.push('/ideas')}
            style={{ marginTop: 8, color: 'var(--accent)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
          >
            → Ideas 보기
          </button>
        </div>
      </div>
    </>
  )

  return (
    <ListLayout
      stats={[{ label: 'Seeds', value: seeds.length, suffix: '개' }]}
      sidebar={sidebar}
    >
      <div className="controls">
        <input
          className="search-input"
          type="text"
          placeholder="🔍 제목, 피치, 태그 검색..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="no-results">아직 캡처된 새 프로젝트 씨앗이 없습니다.</div>
      ) : (
        <div className="year-group">
          {filtered.map(seed => (
            <div
              key={seed.slug}
              className="post-card cfg-card"
              onClick={() => router.push(`/seeds/${seed.slug}`)}
              role="link"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && router.push(`/seeds/${seed.slug}`)}
            >
              <div className="pc-body">
                <div className="pc-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="cfg-badge cfg-badge--green">🌱 Seed</span>
                  {seed.title}
                </div>
                <div className="pc-summary">{seed.pitch || '— 한 줄 피치 없음 —'}</div>
                <div className="pc-footer">
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>{seed.date}</span>
                  {seed.origin_session_project && (
                    <span style={{ color: 'var(--muted)', fontSize: 11 }}>
                      ← {seed.origin_session_project}에서 발상
                    </span>
                  )}
                  {seed.tags?.map(tag => (
                    <span key={tag} className="pc-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ListLayout>
  )
}
