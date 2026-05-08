/**
 * EntryCard — 날짜 컬럼이 왼쪽에 있는 카드. Learning Log 인덱스 전용.
 *
 *   <EntryCard
 *     date="2026-05-07"
 *     title="..."
 *     summary="..."
 *     tags={['tag1', 'tag2']}
 *     onClick={() => router.push(`/${slug}`)}
 *   />
 *
 * 클래스는 globals.css의 .post-card / .pc-* 를 그대로 사용한다.
 */

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: MONTHS[d.getMonth()],
  }
}

export default function EntryCard({ date, title, summary, tags = [], onClick }) {
  const { day, month } = formatDate(date)
  return (
    <div
      className="post-card"
      onClick={onClick}
      role="link"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
    >
      <div className="pc-date">
        <div className="pc-day">{day}</div>
        <div className="pc-month">{month}</div>
      </div>
      <div className="pc-body">
        <div className="pc-title">{title}</div>
        {summary && <div className="pc-summary">{summary}</div>}
        {tags.length > 0 && (
          <div className="pc-footer">
            {tags.map(tag => (
              <span key={tag} className="pc-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
