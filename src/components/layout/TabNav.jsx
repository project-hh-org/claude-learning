'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const OTHER_TABS = ['/configs', '/ideas', '/seeds']

const TABS = [
  // Learning Log는 / · /concept/... · entry 상세(/<slug>) — 다른 탭 경로가 아니면 전부
  { href: '/',        label: '📚 Learning Log',   match: (p) => !OTHER_TABS.some(t => p.startsWith(t)) },
  { href: '/configs', label: '🔧 Claude Configs', match: (p) => p.startsWith('/configs') },
  { href: '/ideas',   label: '💡 Ideas',          match: (p) => p.startsWith('/ideas') },
  { href: '/seeds',   label: '🌱 Seeds',          match: (p) => p.startsWith('/seeds') },
]

export default function TabNav() {
  const pathname = usePathname() || '/'
  return (
    <nav className="tab-bar" aria-label="primary">
      {TABS.map(tab => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`tab-btn ${tab.match(pathname) ? 'active' : ''}`}
          prefetch
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
