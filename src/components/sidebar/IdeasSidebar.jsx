'use client'

import { useRouter } from 'next/navigation'

/**
 * IdeasSidebar — Ideas 인덱스(/ideas) 페이지의 사이드바.
 */
export default function IdeasSidebar({ counts, tagCount }) {
  const router = useRouter()
  return (
    <>
      <div className="s-card">
        <h3>💡 Ideas란?</h3>
        <div className="s-note">
          현재 작업 중인 프로젝트와 연관된 메모/생각을 모아두는 곳.
          Claude가 thinking 중 떠올린 발상이 자동 저장됩니다.
          <br /><br />
          <strong>Spark 💭</strong>: 스치는 생각<br />
          <strong>Buildable 🔨</strong>: 실제로 만들어볼만한 것
        </div>
      </div>
      <div className="s-card">
        <h3>📊 통계</h3>
        <div className="s-stat"><span className="l">전체</span><span className="v">{counts.all}</span></div>
        <div className="s-stat"><span className="l">💭 Spark</span><span className="v">{counts.spark}</span></div>
        <div className="s-stat"><span className="l">🔨 Buildable</span><span className="v">{counts.buildable}</span></div>
        <div className="s-stat"><span className="l">태그</span><span className="v">{tagCount}</span></div>
      </div>
      <div className="s-card">
        <h3>🌱 별개 프로젝트</h3>
        <div className="s-note">
          현재 프로젝트와 무관한 새 프로젝트 아이디어는 별도로 관리됩니다.<br />
          <button className="link-btn" onClick={() => router.push('/seeds')}>→ Seeds 보기</button>
        </div>
      </div>
    </>
  )
}
