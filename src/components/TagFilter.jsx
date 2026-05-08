/**
 * TagFilter — 가로 스크롤 가능한 필터 칩 행.
 * 태그 필터(PostList) 또는 종류 필터(IdeaList)에 모두 사용.
 *
 *   <TagFilter
 *     label="태그"
 *     options={[
 *       { value: 'all',  label: '전체' },
 *       { value: 'aws',  label: 'aws' },
 *     ]}
 *     active="all"
 *     onSelect={setActive}
 *   />
 *
 * options[i].label은 ReactNode 가능 — 카운트나 이모지 포함 가능
 *   { value: 'spark', label: '💭 Spark (3)' }
 *
 * 모바일에서는 globals.css의 .tags-row { overflow-x: auto } 발동.
 */
export default function TagFilter({ label, options, active, onSelect }) {
  return (
    <div className="tags-row">
      {label && <span className="tags-label">{label}</span>}
      {options.map(opt => (
        <button
          key={opt.value}
          className={`tag-btn ${active === opt.value ? 'active' : ''}`}
          onClick={() => onSelect(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
