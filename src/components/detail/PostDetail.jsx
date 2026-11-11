'use client'

import { useRouter } from 'next/navigation'
import NoteDetail from './NoteDetail'
import Badge, { StageBadge } from '../ui/Badge'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

/** Learning Log entry — 배지: stage + (lab이면) 카테고리 / 전용 블록: 개념 칩·외부 링크·참고 자료 */
export default function PostDetail({ post }) {
  const router = useRouter()

  const actions = (post.concepts?.length > 0 || post.links?.length > 0) && (
    <>
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
            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="lab-link">
              {link.label} ↗
            </a>
          ))}
        </div>
      )}
    </>
  )

  const appendix = post.references?.length > 0 && (
    <div className="post-references">
      <h3>참고 자료</h3>
      <ul>
        {post.references.map(ref => (
          <li key={ref.url}>
            <a href={ref.url} target="_blank" rel="noopener noreferrer">{ref.label}</a>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <NoteDetail
      backTo="/"
      backLabel="전체 목록"
      badges={<>
        <StageBadge stage={post.stage} />
        {post.category && <Badge label={post.category} />}
      </>}
      meta={[formatDate(post.date)]}
      title={post.title}
      summary={post.summary}
      tags={post.tags}
      actions={actions}
      html={post.contentHtml}
      appendix={appendix}
      related={post.related}
      backlinks={post.backlinks}
    />
  )
}
