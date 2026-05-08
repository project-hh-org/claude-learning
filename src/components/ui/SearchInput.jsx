/**
 * SearchInput — 검색 input atom.
 *
 *   <SearchInput
 *     value={query}
 *     onChange={setQuery}
 *     placeholder="🔍 제목, 태그..."
 *   />
 *
 * value/onChange 제어 컴포넌트. 페이지 본체는 상태와 필터링 로직만 담당.
 */
export default function SearchInput({ value, onChange, placeholder }) {
  return (
    <input
      className="search-input"
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  )
}
