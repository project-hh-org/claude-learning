'use client'

import { useRouter } from 'next/navigation'

const KIND_META = {
  spark:     { label: 'Spark',     emoji: '💭', color: 'blue' },
  buildable: { label: 'Buildable', emoji: '🔨', color: 'orange' },
}

const STAGE_BADGE = {
  evergreen: { icon: '🌲', label: 'Evergreen', color: 'var(--green)' },
  budding:   { icon: '🌿', label: 'Budding',   color: 'var(--blue)'  },
  seedling:  { icon: '🌱', label: 'Seedling',  color: 'var(--yellow)'},
}

export default function IdeaDetail({ idea }) {
  const router = useRouter()
  const kind = KIND_META[idea.kind] || KIND_META.spark
  const stage = idea.stage ? STAGE_BADGE[idea.stage] : null

  return (
    <>
      <header className="header">
        <div className="header-logo" onClick={() => router.push('/')} role="link" tabIndex={0}>
          📚 Learning Log <span>· 다희의 개발 기록</span>
        </div>
      </header>

      <article className="post-page">
        <button className="back-btn" onClick={() => router.push('/ideas')}>
          ← Ideas
        </button>

        <div className="post-meta">
          <span className={`cfg-badge cfg-badge--${kind.color}`}>
            {kind.emoji} {kind.label}
          </span>
          {stage && (
            <span className="stage-badge" style={{ color: stage.color, borderColor: stage.color }}>
              {stage.icon} {stage.label}
            </span>
          )}
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>{idea.date}</span>
          {idea.source_session_project && (
            <span style={{ color: 'var(--muted)', fontSize: 11 }}>
              from {idea.source_session_project}
            </span>
          )}
        </div>

        <h1 className="post-title">{idea.title}</h1>

        <div className="post-tags">
          {idea.tags?.map(tag => (
            <span key={tag} className="post-tag">{tag}</span>
          ))}
        </div>

        <hr className="post-divider" />

        <div
          className="post-body"
          dangerouslySetInnerHTML={{ __html: idea.contentHtml }}
        />
      </article>
    </>
  )
}
