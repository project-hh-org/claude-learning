'use client'

import { useRouter } from 'next/navigation'
import TabNav from './TabNav'

/**
 * DetailLayout — 모든 상세 페이지(NoteDetail)가 공유하는 외곽 셸.
 *
 *   <header>📚 Learning Log</header>
 *   <TabNav />           ← 목록과 같은 탭 — 지금 어느 탭에 있는지 보인다
 *   <article.post-page>
 *     <button.back-btn>← {backLabel}</button>
 *     {children}
 *   </article>
 *
 * 본문(메타/제목/요약/태그/HTML/섹션 등)은 children으로 자유 조합.
 * 외곽 chrome만 단일 소스로 통일한다.
 *
 * @param backTo     뒤로가기 경로 (기본 '/')
 * @param backLabel  뒤로가기 텍스트 (기본 '뒤로')
 */
export default function DetailLayout({ backTo = '/', backLabel = '뒤로', children }) {
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
          📚 Learning Log <span>· 다희의 개발 기록</span>
        </div>
      </header>

      <TabNav />

      <article className="post-page">
        <button className="back-btn" onClick={() => router.push(backTo)}>
          ← {backLabel}
        </button>
        {children}
      </article>
    </>
  )
}
