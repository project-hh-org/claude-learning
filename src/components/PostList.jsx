'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return { day, month: months[d.getMonth()], year: d.getFullYear() }
}

const STAGE_LABEL = {
  evergreen: { icon: '🌿', text: 'Evergreen' },
  seedling:  { icon: '🌱', text: 'Seedling'  },
  budding:   { icon: '🌸', text: 'Budding'   },
}

const CATEGORY_COLOR = {
  AI:       'var(--accent)',
  DevTools: 'var(--blue)',
  Infra:    'var(--green)',
  Design:   'var(--orange)',
}

export default function PostList({ posts }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('all')

  // note / lab 분리
  const notePosts = useMemo(() => posts.filter(p => p.type !== 'lab'), [posts])
  const labPosts  = useMemo(() => posts.filter(p => p.type === 'lab'),  [posts])

  // 전체 태그
  const allTags = useMemo(() => {
    const set = new Set()
    posts.forEach(p => p.tags?.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [posts])

  // note 필터링
  const filteredPosts = useMemo(() => {
    const q = query.toLowerCase()
    return notePosts.filter(p => {
      const matchTag = activeTag === 'all' || p.tags?.includes(activeTag)
      const matchQ   = !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      return matchTag && matchQ
    })
  }, [notePosts, query, activeTag])

  // lab 필터링
  const filteredLab = useMemo(() => {
    const q = query.toLowerCase()
    return labPosts.filter(p => {
      const matchTag = activeTag === 'all' || p.tags?.includes(activeTag)
      const matchQ   = !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      return matchTag && matchQ
    })
  }, [labPosts, query, activeTag])

  // 연도별 그룹 (learning)
  const byYear = useMemo(() => {
    const map = {}
    filteredPosts.forEach(p => {
      const year = p.date?.slice(0, 4) || '2026'
      if (!map[year]) map[year] = []
      map[year].push(p)
    })
    return Object.entries(map).sort(([a], [b]) => b - a)
  }, [filteredPosts])

  const totalMonthPosts = useMemo(() => {
    const now = new Date()
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return notePosts.filter(p => p.date?.startsWith(ym)).length
  }, [notePosts])

  const noResults = filteredPosts.length === 0 && filteredLab.length === 0

  return (
    <>
      {/* ── Header ── */}
      <header className="header">
        <div className="header-logo">
          📚 Learning Log <span>· 다희의 개발 기록</span>
        </div>
        <div className="header-stats">
          <div className="h-stat">노트 <strong>{notePosts.length}</strong></div>
          <div className="h-stat">Lab <strong>{labPosts.length}</strong></div>
          <div className="h-stat">태그 <strong>{allTags.length}</strong></div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="page-wrap">
        <main>
          {/* Search & Filter */}
          <div className="controls">
            <input
              className="search-input"
              type="text"
              placeholder="🔍  제목, 내용, 태그 검색..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <div className="tags-row">
              <span className="tags-label">태그</span>
              <button
                className={`tag-btn ${activeTag === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTag('all')}
              >
                전체
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`tag-btn ${activeTag === tag ? 'active' : ''}`}
                  onClick={() => setActiveTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {noResults ? (
            <div className="no-results">검색 결과가 없습니다.</div>
          ) : (
            <>
              {/* ── Learning Notes ── */}
              {filteredPosts.length > 0 && (
                <section>
                  <div className="section-header">
                    <span className="section-icon">📝</span>
                    <span className="section-title">Learning Notes</span>
                    <span className="section-count">{filteredPosts.length}</span>
                  </div>

                  {byYear.map(([year, yearPosts]) => (
                    <div key={year} className="year-group">
                      <div className="year-label">{year}</div>
                      {yearPosts.map(post => {
                        const { day, month } = formatDate(post.date)
                        return (
                          <div
                            key={post.slug}
                            className="post-card"
                            onClick={() => router.push(`/${post.slug}`)}
                            role="link"
                            tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && router.push(`/${post.slug}`)}
                          >
                            <div className="pc-date">
                              <div className="pc-day">{day}</div>
                              <div className="pc-month">{month}</div>
                            </div>
                            <div className="pc-body">
                              <div className="pc-title">{post.title}</div>
                              <div className="pc-summary">{post.summary}</div>
                              <div className="pc-footer">
                                {post.tags?.map(tag => (
                                  <span key={tag} className="pc-tag">{tag}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </section>
              )}

              {/* ── Lab Notes ── */}
              {filteredLab.length > 0 && (
                <section className="lab-section">
                  <div className="section-header">
                    <span className="section-icon">🔬</span>
                    <span className="section-title">Lab Notes</span>
                    <span className="section-count">{filteredLab.length}</span>
                    <span className="section-desc">실험하고 만든 것들</span>
                  </div>

                  <div className="lab-grid">
                    {filteredLab.map(post => {
                      const stage = STAGE_LABEL[post.stage] || STAGE_LABEL.seedling
                      const catColor = CATEGORY_COLOR[post.category] || 'var(--muted)'
                      return (
                        <div key={post.id} className="lab-card">
                          <div className="lab-card-header">
                            <span className="lab-category" style={{ color: catColor }}>
                              {post.category}
                            </span>
                            <span className="lab-stage">
                              {stage.icon} {stage.text}
                            </span>
                            <span className="lab-date">{post.date}</span>
                          </div>

                          <div className="lab-title">{post.title}</div>
                          <div className="lab-summary">{post.summary}</div>

                          <div className="lab-tags">
                            {post.tags?.map(tag => (
                              <span key={tag} className="pc-tag">{tag}</span>
                            ))}
                          </div>

                          {post.links?.length > 0 && (
                            <div className="lab-links">
                              {post.links.map(link => (
                                <a
                                  key={link.url}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="lab-link"
                                  onClick={e => e.stopPropagation()}
                                >
                                  {link.label} ↗
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="s-card">
            <h3>📊 통계</h3>
            <div className="s-stat"><span className="l">Learning Notes</span><span className="v">{notePosts.length}</span></div>
            <div className="s-stat"><span className="l">Lab Notes</span><span className="v">{labPosts.length}</span></div>
            <div className="s-stat"><span className="l">이번 달</span><span className="v">{totalMonthPosts}</span></div>
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
              <em>"오늘 [주제] 배웠어, 러닝 로그에 추가해줘"</em><br /><br />
              <code style={{ fontSize: 11, background: 'var(--surface2)', padding: '1px 5px', borderRadius: 4, color: 'var(--accent)' }}>entries/</code>에 .md 저장 → 자동 push → S3 배포
            </div>
          </div>

          <div className="s-card">
            <h3>☁️ 배포</h3>
            <div className="s-note">
              git push → GitHub Actions → AWS S3 + CloudFront
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
