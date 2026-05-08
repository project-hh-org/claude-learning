/**
 * MetaCard — 배지 + 제목 + 요약 + footer 카드.
 * Configs/Ideas/Seeds 인덱스 페이지 공통.
 *
 *   <MetaCard
 *     badge={<CategoryBadge category="rules" />}
 *     title={cfg.title}
 *     summary={cfg.description}
 *     tags={cfg.tags}
 *     footerExtras={<span className="cfg-path">{cfg.installPath}</span>}
 *     onClick={() => ...}
 *   />
 *
 * footerExtras: tags 앞에 추가로 렌더할 노드 (날짜, 경로, 출처 등)
 * tags: 배열로 받으면 .pc-tag 자동 렌더
 */
export default function MetaCard({
  badge,
  title,
  summary,
  tags = [],
  footerExtras = null,
  onClick,
}) {
  return (
    <div
      className="post-card cfg-card"
      onClick={onClick}
      role="link"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
    >
      <div className="pc-body">
        <div className="pc-title pc-title--with-badge">
          {badge}
          {title}
        </div>
        {summary && <div className="pc-summary">{summary}</div>}
        {(footerExtras || tags.length > 0) && (
          <div className="pc-footer">
            {footerExtras}
            {tags.map(tag => (
              <span key={tag} className="pc-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
