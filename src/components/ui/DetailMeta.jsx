/**
 * DetailMeta — 상세 페이지 제목 위 메타 행 (.post-meta).
 * 배지 / 날짜 / 출처 등이 가로로 나열되는 영역.
 *
 *   <DetailMeta>
 *     <CategoryBadge category="rules" />
 *     <span className="meta-dot">·</span>
 *     <span>{path}</span>
 *   </DetailMeta>
 */
export default function DetailMeta({ children }) {
  return <div className="post-meta">{children}</div>
}
