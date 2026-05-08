'use client'

const CATEGORY_ORDER = ['rules', 'hooks', 'commands', 'skills']

/**
 * ConfigsSidebar — Configs 인덱스(/configs) 페이지의 사이드바.
 */
export default function ConfigsSidebar({ configs }) {
  return (
    <>
      <div className="s-card">
        <h3>📊 Configs</h3>
        {CATEGORY_ORDER.map(cat => {
          const items = configs.filter(c => c.category === cat)
          if (!items.length) return null
          const meta = items[0]
          return (
            <div key={cat} className="s-stat">
              <span className="l">{meta.emoji} {cat}</span>
              <span className="v">{items.length}</span>
            </div>
          )
        })}
      </div>
      <div className="s-card">
        <h3>📌 Config 추가</h3>
        <div className="s-note">
          새 rule/hook/command/skill을 만들었다면:<br />
          <em>&quot;이 내용 configs에 추가해줘&quot;</em><br /><br />
          <code className="s-inline-code">configs/</code> 하위에 저장 → 자동 배포
        </div>
      </div>
      <div className="s-card">
        <h3>☁️ 배포</h3>
        <div className="s-note">git push → GitHub Actions → AWS S3 + CloudFront</div>
      </div>
    </>
  )
}
