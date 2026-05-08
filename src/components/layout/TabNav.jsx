'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/',        label: '📚 Learning Log',   match: (p) => p === '/' || p.startsWith('/concept') },
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
