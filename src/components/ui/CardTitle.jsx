/**
 * CardTitle — 카드 제목.
 * badge prop으로 앞에 배지 ReactNode를 렌더 (배지가 있을 때 자동으로
 * .pc-title--with-badge variant 적용 — flex 정렬).
 *
 *   <CardTitle>제목만</CardTitle>
 *   <CardTitle badge={<KindBadge kind="spark" />}>배지 + 제목</CardTitle>
 */
export default function CardTitle({ badge, children }) {
  const cls = badge ? 'pc-title pc-title--with-badge' : 'pc-title'
  return (
    <div className={cls}>
      {badge}
      {children}
    </div>
  )
}
