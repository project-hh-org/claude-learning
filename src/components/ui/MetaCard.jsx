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
 * Card / CardBody / CardTitle / CardSummary / CardFooter atom을 조립.
 * footerExtras: tags 앞에 추가로 렌더할 노드 (날짜, 경로, 출처 등)
 * tags: 배열로 받으면 Tag atom으로 자동 렌더
 */
import Card from './Card'
import CardBody from './CardBody'
import CardTitle from './CardTitle'
import CardSummary from './CardSummary'
import CardFooter from './CardFooter'
import Tag from './Tag'

export default function MetaCard({
  badge,
  title,
  summary,
  tags = [],
  footerExtras = null,
  onClick,
}) {
  const showFooter = footerExtras || tags.length > 0
  return (
    <Card variant="cfg" onClick={onClick}>
      <CardBody>
        <CardTitle badge={badge}>{title}</CardTitle>
        <CardSummary>{summary}</CardSummary>
        {showFooter && (
          <CardFooter>
            {footerExtras}
            {tags.map(tag => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </CardFooter>
        )}
      </CardBody>
    </Card>
  )
}
