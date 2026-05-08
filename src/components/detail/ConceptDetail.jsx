'use client'

import { useRouter } from 'next/navigation'
import DetailLayout from '../layout/DetailLayout'
import { StageBadge } from '../ui/Badge'
import Tag from '../ui/Tag'

export default function ConceptDetail({ concept }) {
  const router = useRouter()

  return (
    <DetailLayout backTo="/" backLabel="전체 목록">
      <div className="post-meta">
        <span className="concept-type-badge">◈ 개념 노트</span>
        <StageBadge stage={concept.stage} />
        {concept.updated && (
          <span className="meta-date">최종 수정 {concept.updated}</span>
        )}
      </div>

      <h1 className="post-title">{concept.title}</h1>

      <div className="post-tags">
        {concept.tags?.map(tag => (
          <Tag variant="accent" key={tag}>{tag}</Tag>
        ))}
      </div>

      <hr className="post-divider" />

      <div
        className="post-body"
        dangerouslySetInnerHTML={{ __html: concept.contentHtml }}
      />

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
    </DetailLayout>
  )
}
