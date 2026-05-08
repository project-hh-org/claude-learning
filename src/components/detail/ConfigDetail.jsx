'use client'

import DetailLayout from '../layout/DetailLayout'
import { CategoryBadge } from '../ui/Badge'
import Tag from '../ui/Tag'

export default function ConfigDetail({ config }) {
  return (
    <DetailLayout backTo="/configs" backLabel="Configs">
      <div className="post-meta">
        <CategoryBadge category={config.category} />
        <span className="meta-dot">·</span>
        <span>{config.installPath || `~/.claude/${config.category}/${config.slug}.md`}</span>
      </div>

      <h1 className="post-title">{config.title}</h1>

      {config.description && (
        <div className="post-summary">💡 {config.description}</div>
      )}

      <div className="post-tags">
        {config.tags?.map(tag => (
          <Tag variant="accent" key={tag}>{tag}</Tag>
        ))}
      </div>

      <hr className="post-divider" />

      <div
        className="post-body"
        dangerouslySetInnerHTML={{ __html: config.contentHtml }}
      />
    </DetailLayout>
  )
}
