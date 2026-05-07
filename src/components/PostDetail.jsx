'use client'

import { useRouter } from 'next/navigation'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

const STAGE_BADGE = {
  evergreen: { icon: '🌲', label: 'Evergreen', color: 'var(--green)' },
  budding:   { icon: '🌿', label: 'Budding',   color: 'var(--blue)'  },
  seedling:  { icon: '🌱', label: 'Seedling',  color: 'var(--yellow)'},
}

export default function PostDetail({ post }) {
  const router = useRouter()
  const stage = post.stage ? STAGE_BADGE[post.stage] : null

  return (
    <>
      <header className="header">
        <div className="header-logo" onClick={() => router.push('/')}>
          📚 Learning Log <span>· 다희의 개발 기록</span>
        </div>
      </header>

      <article className="post-page">
        <button className="back-btn" onClick={() => router.push('/')}>
          ← 전체 목록
        </button>

        <div className="post-meta">
          <span>{formatDate(post.date)}</span>
          {stage && (
            <span className="stage-badge" style={{ color: stage.color, borderColor: stage.color }}>
              {stage.icon} {stage.label}
            </span>
          )}
        </div>

        <h1 className="post-title">{post.title}</h1>
        <div className="post-summary">💡 {post.summary}</div>

        <div className="post-tags">
          {post.tags?.map(tag => (
            <span key={tag} className="post-tag">{tag}</span>
          ))}
        </div>

        {/* 연결된 개념 노트 */}
        {post.concepts?.length > 0 && (
          <div className="zettel-concepts">
            <span className="zettel-label">개념</span>
            {post.concepts.map(c => (
              <button
                key={c.slug}
                className="concept-chip"
                onClick={() => router.push(`/concept/${c.slug}`)}
              >
                ◈ {c.label}
              </button>
            ))}
          </div>
        )}

        {/* 외부 링크 */}
        {post.links?.length > 0 && (
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

        {/* 참고 자료 */}
        {post.references?.length > 0 && (
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

        {/* 관련 글 */}
        {post.related?.length > 0 && (
          <div className="zettel-section">
            <h3 className="zettel-section-title">🔗 관련 글</h3>
            <div className="zettel-cards">
              {post.related.map(r => (
                <button
                  key={r.slug}
                  className="zettel-card zettel-card--related"
                  onClick={() => router.push(`/entry/${r.slug}`)}
                >
                  <span className="zettel-card-label">{r.label}</span>
                  <span className="zettel-card-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 백링크: 이 글을 참조하는 노트들 */}
        {post.backlinks?.length > 0 && (
          <div className="zettel-section">
            <h3 className="zettel-section-title">← 이 글을 참조하는 노트</h3>
            <div className="zettel-cards">
              {post.backlinks.map(b => (
                <button
                  key={b.slug}
                  className="zettel-card zettel-card--backlink"
                  onClick={() => router.push(`/entry/${b.slug}`)}
                >
                  <span className="zettel-card-label">{b.title}</span>
                  {b.summary && <span className="zettel-card-summary">{b.summary}</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  )
}
