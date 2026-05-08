'use client'

import DetailLayout from '../layout/DetailLayout'
import CopyButton from '../ui/CopyButton'
import { SeedBadge, StageBadge } from '../ui/Badge'
import DetailMeta from '../ui/DetailMeta'
import DetailTitle from '../ui/DetailTitle'
import DetailTags from '../ui/DetailTags'
import DetailBody from '../ui/DetailBody'

export default function SeedDetail({ seed }) {
  return (
    <DetailLayout backTo="/seeds" backLabel="Seeds">
      <DetailMeta>
        <SeedBadge />
        <StageBadge stage={seed.stage} />
        <span className="meta-date">{seed.date}</span>
        {seed.origin_session_project && (
          <span className="meta-origin">from {seed.origin_session_project}</span>
        )}
      </DetailMeta>

      <DetailTitle>{seed.title}</DetailTitle>

      {seed.pitch && <p className="post-pitch">{seed.pitch}</p>}

      <DetailTags tags={seed.tags} />

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

      <DetailBody html={seed.contentHtml} />
    </DetailLayout>
  )
}
