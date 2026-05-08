'use client'

import { useRouter } from 'next/navigation'

/**
 * SeedsSidebar — Seeds 인덱스(/seeds) 페이지의 사이드바.
 */
export default function SeedsSidebar({ count, tagCount }) {
  const router = useRouter()
  return (
    <>
      <div className="s-card">
        <h3>🌱 Seeds란?</h3>
        <div className="s-note">
          현재 작업 중인 프로젝트와 <strong>완전히 무관한</strong> 새 프로젝트 아이디어 모음.
          <br /><br />
          각 항목에는 간단 기획과 새 Claude 세션에 그대로 붙여넣을 수 있는 <strong>starter prompt</strong>가 포함됩니다.
          <br /><br />
          나중에 새 레포를 시작할 때 starter prompt를 복사해 작업을 즉시 시작할 수 있습니다.
        </div>
      </div>
      <div className="s-card">
        <h3>📊 통계</h3>
        <div className="s-stat"><span className="l">전체 씨앗</span><span className="v">{count}</span></div>
        <div className="s-stat"><span className="l">태그</span><span className="v">{tagCount}</span></div>
      </div>
      <div className="s-card">
        <h3>💡 메모 보기</h3>
        <div className="s-note">
          현재 프로젝트 맥락의 메모는 별도로 관리됩니다.<br />
          <button className="link-btn" onClick={() => router.push('/ideas')}>→ Ideas 보기</button>
        </div>
      </div>
    </>
  )
}
