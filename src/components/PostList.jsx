'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const year = d.getFullYear()
  return { day, month: months[d.getMonth()], year }
}

export default function PostList({ posts }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('all')

  // 전체 태그 수집
  const allTags = useMemo(() => {
    const set = new Set()
    posts.forEach(p => p.tags?.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [posts])

  // 필터링
  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return posts.filter(p => {
      const matchTag = activeTag === 'all' || p.tags?.includes(activeTag)
      const matchQ = !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      return matchTag && matchQ
    })
  }, [posts, query, activeTag])

  // 연도별 그룹
  const byYear = useMemo(() => {
    const map = {}
    filtered.forEach(p => {
      const year = p.date?.slice(0, 4) || '2026'
      if (!map[year]) map[year] = []
      map[year].push(p)
    })
    return Object.entries(map).sort(([a], [b]) => b - a)
  }, [filtered])

  const totalMonthPosts = useMemo(() => {
    const now = new Date()
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return posts.filter(p => p.date?.startsWith(ym)).length
  }, [posts])

  return (
    <>
      {/* ── Header ── */}
      <header className="header">
        <div className="header-logo">
          📚 Learning Log <span>· 다희의 개발 학습 기록</span>
        </div>
        <div className="header-stats">
          <div className="h-stat">총 <strong>{posts.length}</strong>개</div>
          <div className="h-stat">태그 <strong>{allTags.length}</strong>개</div>
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

          {/* Posts */}
          {byYear.length === 0 ? (
            <div className="no-results">검색 결과가 없습니다.</div>
          ) : (
            byYear.map(([year, yearPosts]) => (
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
                          <span className="pc-readtime">읽는 시간 {post.readTime}분</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </main>

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="s-card">
            <h3>📊 통계</h3>
            <div className="s-stat"><span className="l">전체 글</span><span className="v">{posts.length}</span></div>
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
              Claude가 <code style={{ fontSize: 11, background: 'var(--surface2)', padding: '1px 5px', borderRadius: 4, color: 'var(--accent)' }}>entries/</code>에 .md 파일 생성 → git push → S3 자동 배포
            </div>
          </div>

          <div className="s-card">
            <h3>☁️ 배포</h3>
            <div className="s-note">
              git push → GitHub Actions → AWS S3 + CloudFront 자동 배포
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
