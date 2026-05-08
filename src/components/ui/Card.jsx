/**
 * Card — 클릭 가능한 카드 outer wrapper.
 * EntryCard / MetaCard 등 모든 카드 컴포넌트가 이 atom을 조립한다.
 *
 *   <Card onClick={...} variant="cfg">
 *     {children}
 *   </Card>
 *
 * variant:
 *   "default" → .post-card (호버 시 .pc-title 색이 primary로)
 *   "cfg"     → .post-card.cfg-card (호버 시 .pc-title 색은 text 유지)
 */
export default function Card({ variant = 'default', onClick, children }) {
  const cls = variant === 'cfg' ? 'post-card cfg-card' : 'post-card'
  return (
    <div
      className={cls}
      onClick={onClick}
      role="link"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
    >
      {children}
    </div>
  )
}
