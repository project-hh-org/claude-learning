'use client'

import { useRouter } from 'next/navigation'
import DetailLayout from '../layout/DetailLayout'
import { StageBadge } from '../ui/Badge'
import Tag from '../ui/Tag'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default function PostDetail({ post }) {
  const router = useRouter()

  return (
    <DetailLayout backTo="/" backLabel="전체 목록">
      <div className="post-meta">
        <span>{formatDate(post.date)}</span>
        <StageBadge stage={post.stage} />
      </div>

      <h1 className="post-title">{post.title}</h1>
      {post.summary && <div className="post-summary">💡 {post.summary}</div>}

      <div className="post-tags">
        {post.tags?.map(tag => (
          <Tag variant="accent" key={tag}>{tag}</Tag>
        ))}
      </div>

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

      {post.related?.length > 0 && (
        <div className="zettel-section">
          <h3 className="zettel-section-title">🔗 관련 글</h3>
          <div className="zettel-cards">
            {post.related.map(r => (
              <button
                key={r.slug}
                className="zettel-card zettel-card--related"
                onClick={() => router.push(`/${r.slug}`)}
              >
                <span className="zettel-card-label">{r.label}</span>
                <span className="zettel-card-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {post.backlinks?.length > 0 && (
        <div className="zettel-section">
          <h3 className="zettel-section-title">← 이 글을 참조하는 노트</h3>
          <div className="zettel-cards">
            {post.backlinks.map(b => (
              <button
                key={b.slug}
                className="zettel-card zettel-card--backlink"
                onClick={() => router.push(`/${b.slug}`)}
              >
                <span className="zettel-card-label">{b.title}</span>
                {b.summary && <span className="zettel-card-summary">{b.summary}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </DetailLayout>
  )
}
