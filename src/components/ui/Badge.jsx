/**
 * Badge — kind/stage/category/cfg 등 모든 배지의 단일 atom.
 *
 * 두 가지 사용 형태:
 *   1) <Badge variant="orange" emoji="📋" label="Rule" />
 *   2) variant 매핑 helpers — KindBadge / StageBadge / CategoryBadge
 *      도메인 의미를 props로 받아 자동으로 색/이모지 결정
 *
 * 시각적 분기는 globals.css의 .cfg-badge--<color> 클래스를 활용한다.
 */

const COLOR_CLASS = {
  orange: 'cfg-badge cfg-badge--orange',
  green:  'cfg-badge cfg-badge--green',
  blue:   'cfg-badge cfg-badge--blue',
  yellow: 'cfg-badge cfg-badge--muted',
  muted:  'cfg-badge cfg-badge--muted',
}

export default function Badge({ variant = 'muted', emoji, label, style }) {
  return (
    <span className={COLOR_CLASS[variant] || COLOR_CLASS.muted} style={style}>
      {emoji && <span style={{ marginRight: 4 }}>{emoji}</span>}
      {label}
    </span>
  )
}

// ─── 도메인 의미 → variant 매핑 helpers ─────────────────────

const KIND_META = {
  spark:     { variant: 'blue',   emoji: '💭', label: 'Spark' },
  buildable: { variant: 'orange', emoji: '🔨', label: 'Buildable' },
}

export function KindBadge({ kind }) {
  const m = KIND_META[kind] || KIND_META.spark
  return <Badge variant={m.variant} emoji={m.emoji} label={m.label} />
}

const STAGE_META = {
  evergreen: { variant: 'green',  emoji: '🌲', label: 'Evergreen' },
  budding:   { variant: 'blue',   emoji: '🌿', label: 'Budding'   },
  seedling:  { variant: 'yellow', emoji: '🌱', label: 'Seedling'  },
}

export function StageBadge({ stage }) {
  const m = STAGE_META[stage]
  if (!m) return null
  return <Badge variant={m.variant} emoji={m.emoji} label={m.label} />
}

const CATEGORY_META = {
  rules:    { variant: 'orange', emoji: '📋', label: 'Rule' },
  hooks:    { variant: 'green',  emoji: '🪝', label: 'Hook' },
  commands: { variant: 'blue',   emoji: '⚡', label: 'Command' },
  skills:   { variant: 'blue',   emoji: '🧩', label: 'Skill' },
}

export function CategoryBadge({ category }) {
  const m = CATEGORY_META[category]
  if (!m) return <Badge label={category} />
  return <Badge variant={m.variant} emoji={m.emoji} label={m.label} />
}

// 'seed' 라벨용 (SeedList에서 사용)
export function SeedBadge() {
  return <Badge variant="green" emoji="🌱" label="Seed" />
}
