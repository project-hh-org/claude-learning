'use client'

import NoteDetail from './NoteDetail'
import { StageBadge } from '../ui/Badge'

/** Learning Log concept — 배지: 개념 노트 + stage / 메타: 작성·수정일 */
export default function ConceptDetail({ concept }) {
  return (
    <NoteDetail
      backTo="/"
      backLabel="전체 목록"
      badges={<>
        <span className="concept-type-badge">◈ 개념 노트</span>
        <StageBadge stage={concept.stage} />
      </>}
      meta={[
        concept.created && `작성 ${concept.created}`,
        concept.updated && concept.updated !== concept.created && `수정 ${concept.updated}`,
      ]}
      title={concept.title}
      summary={concept.summary}
      tags={concept.tags}
      html={concept.contentHtml}
      related={concept.related}
      backlinks={concept.backlinks}
    />
  )
}
