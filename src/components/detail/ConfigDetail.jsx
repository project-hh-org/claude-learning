'use client'

import NoteDetail from './NoteDetail'
import { CategoryBadge } from '../ui/Badge'

/** Claude Configs — 배지: 카테고리 / 메타: 설치 경로 */
export default function ConfigDetail({ config }) {
  return (
    <NoteDetail
      backTo="/configs"
      backLabel="Configs"
      badges={<CategoryBadge category={config.category} />}
      meta={[config.installPath]}
      title={config.title}
      summary={config.description}
      tags={config.tags}
      html={config.contentHtml}
      related={config.related}
      backlinks={config.backlinks}
    />
  )
}
