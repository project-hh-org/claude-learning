'use client'

import { useRouter } from 'next/navigation'

export default function ConfigDetail({ config }) {
  const router = useRouter()

  return (
    <>
      <header className="header">
        <div className="header-logo" onClick={() => router.push('/')}>
          📚 Learning Log <span>· 다희의 개발 기록</span>
        </div>
      </header>

      <article className="post-page">
        <button className="back-btn" onClick={() => router.back()}>
          ← 목록으로
        </button>

        <div className="post-meta">
          <span className={`cfg-badge cfg-badge--${config.color}`}>
            {config.emoji} {config.label}
          </span>
          <span className="meta-dot">·</span>
          <span>{config.installPath || `~/.claude/${config.category}/${config.slug}.md`}</span>
        </div>

        <h1 className="post-title">{config.title}</h1>

        {config.description && (
          <div className="post-summary">💡 {config.description}</div>
        )}

        <div className="post-tags">
          {config.tags?.map(tag => (
            <span key={tag} className="post-tag">{tag}</span>
          ))}
        </div>

        <hr className="post-divider" />

        <div
          className="post-body"
          dangerouslySetInnerHTML={{ __html: config.contentHtml }}
        />
      </article>
    </>
  )
}
