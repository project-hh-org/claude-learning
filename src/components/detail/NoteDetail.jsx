'use client'

import { useRouter } from 'next/navigation'
import DetailLayout from '../layout/DetailLayout'
import DetailMeta from '../ui/DetailMeta'
import DetailTitle from '../ui/DetailTitle'
import DetailSummary from '../ui/DetailSummary'
import DetailTags from '../ui/DetailTags'
import DetailBody from '../ui/DetailBody'

/**
 * NoteDetail — 모든 탭(Learning / Configs / Ideas / Seeds)의 공통 상세 형태.
 * 탭마다 다른 것은 데이터뿐이고, 순서와 섹션은 여기서 한 번만 정한다.
 *
 *   메타(badges · meta) → 제목 → 요약 → 태그 → actions → 본문 → appendix
 *   → 🔗 관련 글 → ← 이 글을 참조하는 노트
 *
 * @param backTo/backLabel  뒤로가기
 * @param badges     메타 줄 앞쪽 배지 ReactNode
 * @param meta       메타 줄 텍스트들 (날짜, 설치 경로, 출처 등) — 빈 값은 건너뜀
 * @param actions    태그 아래 전용 블록 (개념 칩, 외부 링크, 프롬프트 복사 등)
 * @param appendix   본문 아래 전용 블록 (참고 자료 등)
 * @param related    [{ href, label }]           — lib/links.js resolveRelated
 * @param backlinks  [{ href, title, summary }]  — lib/links.js getBacklinks
 */
export default function NoteDetail({
  backTo = '/',
  backLabel = '뒤로',
  badges = null,
  meta = [],
  title,
  summary,
  tags = [],
  actions = null,
  html,
  appendix = null,
  related = [],
  backlinks = [],
}) {
  const router = useRouter()
  const metaItems = meta.filter(Boolean)

  return (
    <DetailLayout backTo={backTo} backLabel={backLabel}>
      <DetailMeta>
        {badges}
        {metaItems.map((m, i) => (
          <span key={i} className="meta-date">{m}</span>
        ))}
      </DetailMeta>

      <DetailTitle>{title}</DetailTitle>
      <DetailSummary>{summary}</DetailSummary>
      <DetailTags tags={tags} />
      {actions}

      <hr className="post-divider" />

      <DetailBody html={html} />
      {appendix}

      {related.length > 0 && (
        <div className="zettel-section">
          <h3 className="zettel-section-title">🔗 관련 글</h3>
          <div className="zettel-cards">
            {related.map(r => (
              <button
                key={r.href}
                className="zettel-card zettel-card--related"
                onClick={() => router.push(r.href)}
              >
                <span className="zettel-card-label">{r.label}</span>
                <span className="zettel-card-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {backlinks.length > 0 && (
        <div className="zettel-section">
          <h3 className="zettel-section-title">← 이 글을 참조하는 노트</h3>
          <div className="zettel-cards">
            {backlinks.map(b => (
              <button
                key={b.href}
                className="zettel-card zettel-card--backlink"
                onClick={() => router.push(b.href)}
              >
                <span className="zettel-card-label">{b.title}</span>
                {b.summary && <span className="zettel-card-summary">{b.summary}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </DetailLayout>
  )
}
