/**
 * EntryCard — 날짜 컬럼이 왼쪽에 있는 카드. Learning Log 인덱스 전용.
 *
 * Card / CardBody / CardTitle / CardSummary / CardFooter atom을 조립.
 * 날짜 컬럼(.pc-date)은 EntryCard 전용이라 인라인 마크업으로 둠.
 */
import Card from './Card'
import CardBody from './CardBody'
import CardTitle from './CardTitle'
import CardSummary from './CardSummary'
import CardFooter from './CardFooter'
import Tag from './Tag'

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
    <Card onClick={onClick}>
      <div className="pc-date">
        <div className="pc-day">{day}</div>
        <div className="pc-month">{month}</div>
      </div>
      <CardBody>
        <CardTitle>{title}</CardTitle>
        <CardSummary>{summary}</CardSummary>
        {tags.length > 0 && (
          <CardFooter>
            {tags.map(tag => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </CardFooter>
        )}
      </CardBody>
    </Card>
  )
}
