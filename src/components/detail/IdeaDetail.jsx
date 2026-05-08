'use client'

import DetailLayout from '../layout/DetailLayout'
import { KindBadge, StageBadge } from '../ui/Badge'
import Tag from '../ui/Tag'

export default function IdeaDetail({ idea }) {
  return (
    <DetailLayout backTo="/ideas" backLabel="Ideas">
      <div className="post-meta">
        <KindBadge kind={idea.kind} />
        <StageBadge stage={idea.stage} />
        <span className="meta-date">{idea.date}</span>
        {idea.source_session_project && (
          <span className="meta-origin">from {idea.source_session_project}</span>
        )}
      </div>

      <h1 className="post-title">{idea.title}</h1>

      <div className="post-tags">
        {idea.tags?.map(tag => (
          <Tag variant="accent" key={tag}>{tag}</Tag>
        ))}
      </div>

      <hr className="post-divider" />

      <div
        className="post-body"
        dangerouslySetInnerHTML={{ __html: idea.contentHtml }}
      />
    </DetailLayout>
  )
}
