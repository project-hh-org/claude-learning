'use client'

import { useRouter } from 'next/navigation'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default function PostDetail({ post }) {
  const router = useRouter()

  return (
    <>
      {/* ── Header ── */}
      <header className="header">
        <div className="header-logo" onClick={() => router.push('/')}>
          📚 Learning Log <span>· 다희의 개발 학습 기록</span>
        </div>
      </header>

      {/* ── Article ── */}
      <article className="post-page">
        <button className="back-btn" onClick={() => router.push('/')}>
          ← 전체 목록
        </button>

        <div className="post-meta">
          <span>{formatDate(post.date)}</span>
          <span className="post-readtime">읽는 시간 {post.readTime}분</span>
        </div>

        <h1 className="post-title">{post.title}</h1>

        <div className="post-summary">💡 {post.summary}</div>

        <div className="post-tags">
          {post.tags?.map(tag => (
            <span key={tag} className="post-tag">{tag}</span>
          ))}
        </div>

        <hr className="post-divider" />

        {/* 빌드 시 서버에서 변환된 HTML 렌더링 */}
        <div
          className="post-body"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </>
  )
}
