/**
 * Obsidian wikilink를 HTML 링크로 변환
 *
 * [[slug]]              → <a href="/slug">slug</a>            (entry)
 * [[slug|레이블]]        → <a href="/slug">레이블</a>           (entry)
 * [[concepts/slug]]     → <a href="/concept/slug">slug</a>    (concept)
 * [[concepts/slug|레이블]] → <a href="/concept/slug">레이블</a> (concept)
 */
export function wikilinkToHtml(content) {
  return content.replace(/\[\[([^\]]+)\]\]/g, (_, inner) => {
    const [ref, label] = inner.split('|').map(s => s.trim())

    // concepts/ 접두사 처리
    if (ref.startsWith('concepts/')) {
      const slug = ref.replace('concepts/', '')
      const text = label || slug
      return `<a href="/concept/${slug}" class="wikilink wikilink--concept">${text}</a>`
    }

    // entry 링크 — 기존 라우트 /{slug} 사용
    const text = label || ref
    return `<a href="/${ref}" class="wikilink wikilink--entry">${text}</a>`
  })
}

/**
 * 마크다운 본문에서 wikilink로 참조된 슬러그 목록 추출
 * 백링크 계산에 사용
 */
export function extractWikilinks(content) {
  const links = []
  const regex = /\[\[([^\]]+)\]\]/g
  let match
  while ((match = regex.exec(content)) !== null) {
    const ref = match[1].split('|')[0].trim()
    links.push(ref)
  }
  return links
}
