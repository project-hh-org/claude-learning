/**
 * DetailBody — markdown으로부터 변환된 HTML을 렌더 (.post-body).
 *
 *   <DetailBody html={post.contentHtml} />
 *
 * dangerouslySetInnerHTML 사용처를 atom 한 곳으로 모아 일관성 보장.
 */
export default function DetailBody({ html }) {
  return (
    <div
      className="post-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
