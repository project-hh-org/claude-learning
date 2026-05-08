/**
 * DetailTags — 상세 페이지의 태그 칩 행 (.post-tags + Tag accent).
 *
 *   <DetailTags tags={['aws', 'security']} />
 *
 * 빈 배열이면 렌더하지 않음.
 */
import Tag from './Tag'

export default function DetailTags({ tags = [] }) {
  if (!tags.length) return null
  return (
    <div className="post-tags">
      {tags.map(tag => (
        <Tag key={tag} variant="accent">{tag}</Tag>
      ))}
    </div>
  )
}
