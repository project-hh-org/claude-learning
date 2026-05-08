'use client'

/**
 * LogSidebar — Learning Log 인덱스(/) 페이지의 사이드바.
 * 통계 / 태그 클라우드 / 새 글 추가 안내 / 배포 정보를 표시.
 *
 *   <LogSidebar
 *     posts={posts}
 *     tags={allTags}
 *     thisMonth={n}
 *     onTagClick={tag => setActiveTag(tag)}
 *   />
 */
export default function LogSidebar({ posts, tags = [], thisMonth, onTagClick }) {
  return (
    <>
      <div className="s-card">
        <h3>📊 통계</h3>
        <div className="s-stat"><span className="l">전체 글</span><span className="v">{posts.length}</span></div>
        <div className="s-stat"><span className="l">이번 달</span><span className="v">{thisMonth}</span></div>
        <div className="s-stat"><span className="l">태그 수</span><span className="v">{tags.length}</span></div>
      </div>
      <div className="s-card">
        <h3>🏷️ 태그</h3>
        <div className="tag-cloud">
          {tags.map(tag => (
            <button key={tag} className="cloud-tag" onClick={() => onTagClick?.(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="s-card">
        <h3>📌 새 글 추가</h3>
        <div className="s-note">
          새로운 것을 배웠다면 Claude에게:<br />
          <em>&quot;오늘 [주제] 배웠어, 러닝 로그에 추가해줘&quot;</em><br /><br />
          <code className="s-inline-code">entries/</code>에 .md 저장 → 자동 push → S3 배포
        </div>
      </div>
      <div className="s-card">
        <h3>☁️ 배포</h3>
        <div className="s-note">git push → GitHub Actions → AWS S3 + CloudFront</div>
      </div>
    </>
  )
}
