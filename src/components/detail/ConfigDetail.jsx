'use client'

import DetailLayout from '../layout/DetailLayout'
import { CategoryBadge } from '../ui/Badge'
import DetailMeta from '../ui/DetailMeta'
import DetailTitle from '../ui/DetailTitle'
import DetailSummary from '../ui/DetailSummary'
import DetailTags from '../ui/DetailTags'
import DetailBody from '../ui/DetailBody'

export default function ConfigDetail({ config }) {
  const installPath = config.installPath || `~/.claude/${config.category}/${config.slug}.md`
  return (
    <DetailLayout backTo="/configs" backLabel="Configs">
      <DetailMeta>
        <CategoryBadge category={config.category} />
        <span className="meta-dot">·</span>
        <span>{installPath}</span>
      </DetailMeta>

      <DetailTitle>{config.title}</DetailTitle>
      <DetailSummary>{config.description}</DetailSummary>
      <DetailTags tags={config.tags} />

      <hr className="post-divider" />

      <DetailBody html={config.contentHtml} />
    </DetailLayout>
  )
}
