'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STAGE_BADGE = {
  evergreen: { icon: '🌲', label: 'Evergreen', color: 'var(--green)' },
  budding:   { icon: '🌿', label: 'Budding',   color: 'var(--blue)'  },
  seedling:  { icon: '🌱', label: 'Seedling',  color: 'var(--yellow)'},
}

export default function SeedDetail({ seed }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const stage = seed.stage ? STAGE_BADGE[seed.stage] : null

  async function copyStarterPrompt() {
    if (!seed.starterPrompt) return
    try {
      await navigator.clipboard.writeText(seed.starterPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // 권한 거부 시 fallback: textarea 선택
      const ta = document.createElement('textarea')
      ta.value = seed.starterPrompt
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <>
      <header className="header">
        <div className="header-logo" onClick={() => router.push('/')} role="link" tabIndex={0}>
          📚 Learning Log <span>· 다희의 개발 기록</span>
        </div>
      </header>

      <article className="post-page">
        <button className="back-btn" onClick={() => router.push('/seeds')}>
          ← Seeds
        </button>

        <div className="post-meta">
          <span className="cfg-badge cfg-badge--green">🌱 Seed</span>
          {stage && (
            <span className="stage-badge" style={{ color: stage.color, borderColor: stage.color }}>
              {stage.icon} {stage.label}
            </span>
          )}
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>{seed.date}</span>
          {seed.origin_session_project && (
            <span style={{ color: 'var(--muted)', fontSize: 11 }}>
              from {seed.origin_session_project}
            </span>
          )}
        </div>

        <h1 className="post-title">{seed.title}</h1>

        {seed.pitch && (
          <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.6, marginTop: 12 }}>
            {seed.pitch}
          </p>
        )}

        <div className="post-tags">
          {seed.tags?.map(tag => (
            <span key={tag} className="post-tag">{tag}</span>
          ))}
        </div>

        {seed.starterPrompt && (
          <div
            style={{
              marginTop: 24,
              padding: 16,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>🚀 새 프로젝트로 시작하기</div>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                Starter prompt를 복사해 새 Claude 세션에 붙여넣으세요.
              </div>
            </div>
            <button
              onClick={copyStarterPrompt}
              style={{
                padding: '8px 16px',
                background: copied ? 'var(--green)' : 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
                whiteSpace: 'nowrap',
              }}
            >
              {copied ? '✓ 복사됨' : '📋 프롬프트 복사'}
            </button>
          </div>
        )}

        <hr className="post-divider" />

        <div
          className="post-body"
          dangerouslySetInnerHTML={{ __html: seed.contentHtml }}
        />
      </article>
    </>
  )
}
