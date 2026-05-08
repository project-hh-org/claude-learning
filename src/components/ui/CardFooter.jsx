/**
 * CardFooter — 카드 하단 메타/태그 행 (.pc-footer).
 * children이 falsy면 렌더하지 않음.
 */
export default function CardFooter({ children }) {
  if (!children) return null
  return <div className="pc-footer">{children}</div>
}
