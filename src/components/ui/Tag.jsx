/**
 * Tag — 작은 칩 atom. 카드/상세 페이지 어디서든 동일한 의미로 사용.
 *
 *   <Tag>aws</Tag>                 (variant="muted" — 카드 footer)
 *   <Tag variant="accent">aws</Tag>(상세 페이지 헤더 영역)
 *
 * Phase 1에서는 기존 globals 클래스(.pc-tag / .post-tag)를 래핑.
 * Phase 2에서 Tag.module.css로 격리 예정.
 */
const VARIANT_CLASS = {
  muted:  'pc-tag',
  accent: 'post-tag',
}

export default function Tag({ variant = 'muted', children }) {
  return <span className={VARIANT_CLASS[variant] || VARIANT_CLASS.muted}>{children}</span>
}
