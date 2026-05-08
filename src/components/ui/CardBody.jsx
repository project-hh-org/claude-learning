/**
 * CardBody — 카드 안 내용 컨테이너 (.pc-body).
 * flex: 1 + min-width: 0 — 가로 overflow 방지.
 */
export default function CardBody({ children }) {
  return <div className="pc-body">{children}</div>
}
