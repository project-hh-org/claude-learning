'use client'

import { useRouter } from 'next/navigation'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

const STAGE_LABEL = {
  evergreen: '🌿 Evergreen',
  seedling:  '🌱 Seedling',
  budding:   '🌸 Budding',
}

const CATEGORY_COLOR = {
  AI:       'var(--accent)',
  DevTools: 'var(--blue)',
  Infra:    'var(--green)',
  Design:   'var(--orange)',
}

export default function PostDetail({ post }) {
  const router = useRouter()
  const isLab = post.type === 'lab'

  return (
    <>
      {/* ── Header ── */}
      <header className="header">
        <div className="header-logo" onClick={() => router.push('/')}>
          📚 Learning Log <span>· 다희의 개발 기록</span>
        </div>
      </header>

      {/* ── Article ── */}
      <article className="post-page">
        <button className="back-btn" onClick={() => router.push('/')}>
          ← 전체 목록
        </button>

        <div className="post-meta">
          <span>{formatDate(post.date)}</span>
          {isLab && post.category && (
            <>
              <span className="meta-dot">·</span>
              <span style={{ color: CATEGORY_COLOR[post.category] || 'var(--muted)', fontWeight: 600 }}>
                {post.category}
              </span>
            </>
          )}
          {isLab && post.stage && (
            <>
              <span className="meta-dot">·</span>
              <span>{STAGE_LABEL[post.stage] || post.stage}</span>
            </>
          )}
        </div>

        <h1 className="post-title">{post.title}</h1>

        <div className="post-summary">💡 {post.summary}</div>

        <div className="post-tags">
          {post.tags?.map(tag => (
            <span key={tag} className="post-tag">{tag}</span>
          ))}
        </div>

        {/* Lab 링크 */}
        {isLab && post.links?.length > 0 && (
          <div className="lab-links-bar">
            {post.links.map(link => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="lab-link"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        )}

        <hr className="post-divider" />

        <div
          className="post-body"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* References */}
        {isLab && post.references?.length > 0 && (
          <div className="post-references">
            <h3>참고 자료</h3>
            <ul>
              {post.references.map(ref => (
                <li key={ref.url}>
                  <a href={ref.url} target="_blank" rel="noopener noreferrer">
                    {ref.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </>
  )
}
