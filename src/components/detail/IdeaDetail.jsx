'use client'

import DetailLayout from '../layout/DetailLayout'
import { KindBadge, StageBadge } from '../ui/Badge'
import DetailMeta from '../ui/DetailMeta'
import DetailTitle from '../ui/DetailTitle'
import DetailTags from '../ui/DetailTags'
import DetailBody from '../ui/DetailBody'

export default function IdeaDetail({ idea }) {
  return (
    <DetailLayout backTo="/ideas" backLabel="Ideas">
      <DetailMeta>
        <KindBadge kind={idea.kind} />
        <StageBadge stage={idea.stage} />
        <span className="meta-date">{idea.date}</span>
        {idea.source_session_project && (
          <span className="meta-origin">from {idea.source_session_project}</span>
        )}
      </DetailMeta>

      <DetailTitle>{idea.title}</DetailTitle>
      <DetailTags tags={idea.tags} />

      <hr className="post-divider" />

      <DetailBody html={idea.contentHtml} />
    </DetailLayout>
  )
}
