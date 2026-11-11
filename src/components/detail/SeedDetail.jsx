'use client'

import NoteDetail from './NoteDetail'
import CopyButton from '../ui/CopyButton'
import { SeedBadge, StageBadge } from '../ui/Badge'

/** Seeds — 배지: seed + stage / 메타: 날짜·출처 프로젝트 / 요약: 한 줄 피치 / 전용 블록: 프롬프트 복사 */
export default function SeedDetail({ seed }) {
  const actions = seed.starterPrompt && (
    <div className="seed-starter-cta">
      <div>
        <div className="seed-starter-title">🚀 새 프로젝트로 시작하기</div>
        <div className="seed-starter-desc">
          Starter prompt를 복사해 새 Claude 세션에 붙여넣으세요.
        </div>
      </div>
      <CopyButton
        text={seed.starterPrompt}
        label="📋 프롬프트 복사"
        copiedLabel="✓ 복사됨"
        className="copy-btn--primary"
      />
    </div>
  )

  return (
    <NoteDetail
      backTo="/seeds"
      backLabel="Seeds"
      badges={<>
        <SeedBadge />
        <StageBadge stage={seed.stage} />
      </>}
      meta={[seed.date, seed.origin_session_project && `from ${seed.origin_session_project}`]}
      title={seed.title}
      summary={seed.pitch}
      tags={seed.tags}
      actions={actions}
      html={seed.contentHtml}
      related={seed.related}
      backlinks={seed.backlinks}
    />
  )
}
