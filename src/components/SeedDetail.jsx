'use client'

import DetailLayout from './DetailLayout'
import CopyButton from './CopyButton'
import { SeedBadge, StageBadge } from './Badge'

export default function SeedDetail({ seed }) {
  return (
    <DetailLayout backTo="/seeds" backLabel="Seeds">
      <div className="post-meta">
        <SeedBadge />
        <StageBadge stage={seed.stage} />
        <span className="meta-date">{seed.date}</span>
        {seed.origin_session_project && (
          <span className="meta-origin">from {seed.origin_session_project}</span>
        )}
      </div>

      <h1 className="post-title">{seed.title}</h1>

      {seed.pitch && <p className="post-pitch">{seed.pitch}</p>}

      <div className="post-tags">
        {seed.tags?.map(tag => (
          <span key={tag} className="post-tag">{tag}</span>
        ))}
      </div>

      {seed.starterPrompt && (
        <div className="seed-starter-cta">
          <div>
            <div className="seed-starter-title">🚀 새 프로젝트로 시작하기</div>
            <div className="seed-starter-desc">
              Starter prompt를 복사해 새 Claude 세션에 붙여넣으세요.
            </div>
          </div>
          <CopyButton
            text={seed.starterPrompt}
            label="📋 프롬프트 복사"
            copiedLabel="✓ 복사됨"
            className="copy-btn--primary"
          />
        </div>
      )}

      <hr className="post-divider" />

      <div
        className="post-body"
        dangerouslySetInnerHTML={{ __html: seed.contentHtml }}
      />
    </DetailLayout>
  )
}
