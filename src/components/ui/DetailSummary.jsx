/**
 * DetailSummary — 💡 prefix가 붙는 요약 박스 (.post-summary).
 * children이 비어있으면 렌더하지 않음.
 */
export default function DetailSummary({ children }) {
  if (!children) return null
  return <div className="post-summary">💡 {children}</div>
}
