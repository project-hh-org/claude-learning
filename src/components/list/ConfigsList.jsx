'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import ListLayout from '../layout/ListLayout'
import MetaCard from '../ui/MetaCard'
import SearchInput from '../ui/SearchInput'
import { CategoryBadge } from '../ui/Badge'

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
          <code className="s-inline-code">configs/</code> 하위에 저장 → 자동 배포
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
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="🔍 rule, hook, command, skill 검색..."
        />
      </div>

      {byCategory.length === 0 ? (
        <div className="no-results">검색 결과가 없습니다.</div>
      ) : (
        byCategory.map(([category, items]) => (
          <div key={category} className="year-group">
            <div className="year-label year-label--cap">
              {items[0]?.emoji} {category}
            </div>
            {items.map(cfg => (
              <MetaCard
                key={`${cfg.category}/${cfg.slug}`}
                badge={<CategoryBadge category={cfg.category} />}
                title={cfg.title}
                summary={cfg.description}
                tags={cfg.tags}
                footerExtras={
                  <span className="cfg-path">
                    {cfg.installPath || `~/.claude/${cfg.category}/${cfg.slug}.md`}
                  </span>
                }
                onClick={() => router.push(`/configs/${cfg.category}/${cfg.slug}`)}
              />
            ))}
          </div>
        ))
      )}
    </ListLayout>
  )
}
