'use client'

import { useRouter } from 'next/navigation'
import TabNav from './TabNav'

/**
 * 4개의 인덱스 페이지(Log/Configs/Ideas/Seeds)가 공유하는 외곽 셸.
 *
 *   <header>
 *   <TabNav />
 *   <div.page-wrap>
 *     <main>{children}</main>
 *     <aside.sidebar>{sidebar}</aside>
 *   </div>
 *
 * 각 페이지는 main 본문(검색/카드)과 sidebar 콘텐츠만 신경쓰면 됨.
 *
 * @param title       헤더 좌측 로고 (기본값: 📚 Learning Log)
 * @param subtitle    로고 옆 부제목 (모바일에서는 자동 숨김)
 * @param stats       헤더 우측 통계 배열: [{ label, value }]
 * @param sidebar     데스크탑 사이드바 ReactNode (모바일은 자동 숨김)
 * @param children    main 본문
 */
export default function ListLayout({
  title = '📚 Learning Log',
  subtitle = '· 다희의 개발 기록',
  stats = [],
  sidebar = null,
  children,
}) {
  const router = useRouter()
  return (
    <>
      <header className="header">
        <div
          className="header-logo"
          onClick={() => router.push('/')}
          role="link"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && router.push('/')}
        >
          {title} {subtitle && <span>{subtitle}</span>}
        </div>
        {stats.length > 0 && (
          <div className="header-stats">
            {stats.map((s, i) => (
              <div key={i} className="h-stat">
                {s.label} <strong>{s.value}</strong>{s.suffix || ''}
              </div>
            ))}
          </div>
        )}
      </header>

      <TabNav />

      <div className="page-wrap">
        <main>{children}</main>
        {sidebar && <aside className="sidebar">{sidebar}</aside>}
      </div>
    </>
  )
}
