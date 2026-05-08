/**
 * CardSummary — 카드 본문 한 줄 요약 (.pc-summary).
 * children이 비어있으면 렌더하지 않음.
 */
export default function CardSummary({ children }) {
  if (!children) return null
  return <div className="pc-summary">{children}</div>
}
