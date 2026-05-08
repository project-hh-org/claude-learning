'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import ListLayout from './ListLayout'

const CATEGORY_ORDER = ['rules', 'hooks', 'commands', 'skills']

export default function ConfigsList({ configs }) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    if (!q) return configs
    return configs.filter(c =>
      c.title.toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q) ||
      c.tags?.some(t => t.toLowerCase().includes(q))
    )
  }, [configs, query])

  const byCategory = useMemo(() => {
    const map = {}
    filtered.forEach(c => {
      if (!map[c.category]) map[c.category] = []
      map[c.category].push(c)
    })
    return CATEGORY_ORDER.filter(cat => map[cat]).map(cat => [cat, map[cat]])
  }, [filtered])

  const sidebar = (
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
          <code style={{ fontSize: 11, background: 'var(--surface2)', padding: '1px 5px', borderRadius: 4, color: 'var(--accent)' }}>configs/</code> 하위에 저장 → 자동 배포
        </div>
      </div>
      <div className="s-card">
        <h3>☁️ 배포</h3>
        <div className="s-note">git push → GitHub Actions → AWS S3 + CloudFront</div>
      </div>
    </>
  )

  return (
    <ListLayout
      stats={[{ label: 'Configs', value: configs.length, suffix: '개' }]}
      sidebar={sidebar}
    >
      <div className="controls">
        <input
          className="search-input"
          type="text"
          placeholder="🔍 rule, hook, command, skill 검색..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {byCategory.length === 0 ? (
        <div className="no-results">검색 결과가 없습니다.</div>
      ) : (
        byCategory.map(([category, items]) => (
          <div key={category} className="year-group">
            <div className="year-label" style={{ textTransform: 'capitalize' }}>
              {items[0]?.emoji} {category}
            </div>
            {items.map(cfg => (
              <div
                key={`${cfg.category}/${cfg.slug}`}
                className="post-card cfg-card"
                onClick={() => router.push(`/configs/${cfg.category}/${cfg.slug}`)}
                role="link"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && router.push(`/configs/${cfg.category}/${cfg.slug}`)}
              >
                <div className="pc-body">
                  <div className="pc-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`cfg-badge cfg-badge--${cfg.color}`}>{cfg.label}</span>
                    {cfg.title}
                  </div>
                  <div className="pc-summary">{cfg.description}</div>
                  <div className="pc-footer">
                    <span className="cfg-path">{cfg.installPath || `~/.claude/${cfg.category}/${cfg.slug}.md`}</span>
                    {cfg.tags?.map(tag => (
                      <span key={tag} className="pc-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </ListLayout>
  )
}
