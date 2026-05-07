'use client'

import { useRouter } from 'next/navigation'

const STAGE_BADGE = {
  evergreen: { icon: '🌲', label: 'Evergreen', color: 'var(--green)' },
  budding:   { icon: '🌿', label: 'Budding',   color: 'var(--blue)'  },
  seedling:  { icon: '🌱', label: 'Seedling',  color: 'var(--yellow)'},
}

export default function ConceptDetail({ concept }) {
  const router = useRouter()
  const stage = concept.stage ? STAGE_BADGE[concept.stage] : null

  return (
    <>
      <header className="header">
        <div className="header-logo" onClick={() => router.push('/')}>
          📚 Learning Log <span>· 다희의 개발 기록</span>
        </div>
      </header>

      <article className="post-page">
        <button className="back-btn" onClick={() => router.back()}>
          ← 뒤로
        </button>

        <div className="post-meta">
          <span className="concept-type-badge">◈ 개념 노트</span>
          {stage && (
            <span className="stage-badge" style={{ color: stage.color, borderColor: stage.color }}>
              {stage.icon} {stage.label}
            </span>
          )}
          {concept.updated && (
            <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
              최종 수정 {concept.updated}
            </span>
          )}
        </div>

        <h1 className="post-title">{concept.title}</h1>

        <div className="post-tags">
          {concept.tags?.map(tag => (
            <span key={tag} className="post-tag">{tag}</span>
          ))}
        </div>

        <hr className="post-divider" />

        <div
          className="post-body"
          dangerouslySetInnerHTML={{ __html: concept.contentHtml }}
        />

        {/* 이 개념과 연결된 entry */}
        {concept.related?.length > 0 && (
          <div className="zettel-section">
            <h3 className="zettel-section-title">🔗 관련 글</h3>
            <div className="zettel-cards">
              {concept.related.map(r => {
                const slug = typeof r === 'string' ? r : r.slug
                const label = typeof r === 'string' ? r : (r.label || r.slug)
                return (
                  <button
                    key={slug}
                    className="zettel-card zettel-card--related"
                    onClick={() => router.push(`/${slug}`)}
                  >
                    <span className="zettel-card-label">{label}</span>
                    <span className="zettel-card-arrow">→</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </article>
    </>
  )
}
