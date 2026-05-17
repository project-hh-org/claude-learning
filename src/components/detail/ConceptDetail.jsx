'use client'

import { useRouter } from 'next/navigation'
import DetailLayout from '../layout/DetailLayout'
import { StageBadge } from '../ui/Badge'
import DetailMeta from '../ui/DetailMeta'
import DetailTitle from '../ui/DetailTitle'
import DetailTags from '../ui/DetailTags'
import DetailBody from '../ui/DetailBody'

export default function ConceptDetail({ concept, conceptSlugs = new Set() }) {
  const router = useRouter()

  return (
    <DetailLayout backTo="/" backLabel="전체 목록">
      <DetailMeta>
        <span className="concept-type-badge">◈ 개념 노트</span>
        <StageBadge stage={concept.stage} />
        {concept.updated && (
          <span className="meta-date">최종 수정 {concept.updated}</span>
        )}
      </DetailMeta>

      <DetailTitle>{concept.title}</DetailTitle>
      <DetailTags tags={concept.tags} />

      <hr className="post-divider" />

      <DetailBody html={concept.contentHtml} />

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
                  onClick={() => router.push(conceptSlugs.has(slug) ? `/concept/${slug}` : `/${slug}`)}
                >
                  <span className="zettel-card-label">{label}</span>
                  <span className="zettel-card-arrow">→</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </DetailLayout>
  )
}
