'use client'

import NoteDetail from './NoteDetail'
import { KindBadge, StageBadge } from '../ui/Badge'

/** Ideas — 배지: kind + stage / 메타: 날짜·출처 프로젝트 */
export default function IdeaDetail({ idea }) {
  return (
    <NoteDetail
      backTo="/ideas"
      backLabel="Ideas"
      badges={<>
        <KindBadge kind={idea.kind} />
        <StageBadge stage={idea.stage} />
      </>}
      meta={[idea.date, idea.source_session_project && `from ${idea.source_session_project}`]}
      title={idea.title}
      tags={idea.tags}
      html={idea.contentHtml}
      related={idea.related}
      backlinks={idea.backlinks}
    />
  )
}
