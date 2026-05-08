'use client'

import DetailLayout from './DetailLayout'
import { KindBadge, StageBadge } from './Badge'

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
          <span key={tag} className="post-tag">{tag}</span>
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
