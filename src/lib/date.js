/**
 * frontmatter 날짜 → 'YYYY-MM-DD' 문자열
 *
 * 따옴표 없는 날짜(`created: 2026-11-03`)는 gray-matter가 Date로 파싱한다.
 * Obsidian 속성 편집기가 날짜를 이 형식으로 다시 저장하므로, 문자열을
 * 가정하는 정렬(localeCompare)·렌더링 전에 형식을 맞춘다.
 */
export function toDateString(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return value
}
