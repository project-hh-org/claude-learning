'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return { day, month: months[d.getMonth()], year: d.getFullYear() }
}

const CATEGORY_ORDER = ['rules', 'hooks', 'commands']

export default function PostList({ posts, configs = [] }) {
  const router = useRouter()
  const [tab, setTab] = useState('log')
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('all')

  // ── Learning Log ──────────────────────────────────────
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

  // ── Claude Configs ────────────────────────────────────
  const filteredConfigs = useMemo(() => {
    const q = query.toLowerCase()
    if (!q) return configs
    return configs.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags?.some(t => t.toLowerCase().includes(q))
    )
  }, [configs, query])

  const configsByCategory = useMemo(() => {
    const map = {}
    filteredConfigs.forEach(c => {
      if (!map[c.category]) map[c.category] = []
      map[c.category].push(c)
    })
    return CATEGORY_ORDER.filter(cat => map[cat]).map(cat => [cat, map[cat]])
  }, [filteredConfigs])

  return (
    <>
      <header className="header">
        <div className="header-logo">
          📚 Learning Log <span>· 다희의 개발 기록</span>
        </div>
        <div className="header-stats">
          {tab === 'log' ? (
            <>
              <div className="h-stat">총 <strong>{posts.length}</strong>개</div>
              <div className="h-stat">태그 <strong>{allTags.length}</strong>개</div>
            </>
          ) : (
            <>
              <div className="h-stat">Configs <strong>{configs.length}</strong>개</div>
            </>
          )}
        </div>
      </header>

      {/* ── 탭 ── */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${tab === 'log' ? 'active' : ''}`}
          onClick={() => { setTab('log'); setQuery(''); setActiveTag('all') }}
        >
          📚 Learning Log
        </button>
        <button
          className={`tab-btn ${tab === 'configs' ? 'active' : ''}`}
          onClick={() => { setTab('configs'); setQuery(''); setActiveTag('all') }}
        >
          🔧 Claude Configs
          {configs.length > 0 && <span className="tab-count">{configs.length}</span>}
        </button>
        <button className="tab-btn" onClick={() => router.push('/ideas')}>
          💡 Ideas
        </button>
        <button className="tab-btn" onClick={() => router.push('/seeds')}>
          🌱 Seeds
        </button>
      </div>

      <div className="page-wrap">
        <main>
          {/* ── 검색 ── */}
          <div className="controls">
            <input
              className="search-input"
              type="text"
              placeholder={tab === 'log' ? '🔍  제목, 내용, 태그 검색...' : '🔍  rule, hook, command 검색...'}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {tab === 'log' && (
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
            )}
          </div>

          {/* ── Learning Log 본문 ── */}
          {tab === 'log' && (
            byYear.length === 0 ? (
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
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )
          )}

          {/* ── Claude Configs 본문 ── */}
          {tab === 'configs' && (
            configsByCategory.length === 0 ? (
              <div className="no-results">검색 결과가 없습니다.</div>
            ) : (
              configsByCategory.map(([category, items]) => (
                <div key={category} className="year-group">
                  <div className="year-label" style={{ textTransform: 'capitalize' }}>
                    {items[0]?.emoji} {category}
                  </div>
                  {items.map(cfg => (
                    <div
                      key={cfg.slug}
                      className="post-card cfg-card"
                      onClick={() => router.push(`/configs/${cfg.category}/${cfg.slug}`)}
                      role="link"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && router.push(`/configs/${cfg.category}/${cfg.slug}`)}
                    >
                      <div className="pc-body">
                        <div className="pc-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className={`cfg-badge cfg-badge--${cfg.color}`}>{cfg.label}</span>
                          {cfg.title}
                        </div>
                        <div className="pc-summary">{cfg.description}</div>
                        <div className="pc-footer">
                          <span className="cfg-path">~/.claude/{cfg.category}/{cfg.slug}.md</span>
                          {cfg.tags?.map(tag => (
                            <span key={tag} className="pc-tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )
          )}
        </main>

        {/* ── 사이드바 ── */}
        <aside className="sidebar">
          {tab === 'log' ? (
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
                  <em>"오늘 [주제] 배웠어, 러닝 로그에 추가해줘"</em><br /><br />
                  <code style={{ fontSize: 11, background: 'var(--surface2)', padding: '1px 5px', borderRadius: 4, color: 'var(--accent)' }}>entries/</code>에 .md 저장 → 자동 push → S3 배포
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="s-card">
                <h3>📊 Configs</h3>
                {CATEGORY_ORDER.map(cat => {
                  const items = configs.filter(c => c.category === cat)
                  if (!items.length) return null
                  const meta = items[0]
                  return (
                    <div key={cat} className="s-stat">
                      <span className="l">{meta.emoji} {cat}</span>
                      <span className="v">{items.length}</span>
                    </div>
                  )
                })}
              </div>
              <div className="s-card">
                <h3>📌 Config 추가</h3>
                <div className="s-note">
                  새 rule/hook/command를 만들었다면:<br />
                  <em>"이 내용 configs에 추가해줘"</em><br /><br />
                  <code style={{ fontSize: 11, background: 'var(--surface2)', padding: '1px 5px', borderRadius: 4, color: 'var(--accent)' }}>configs/</code> 하위에 저장 → 자동 배포
                </div>
              </div>
            </>
          )}
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
