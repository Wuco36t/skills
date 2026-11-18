import type { ReactNode } from 'react'

export type Tab = 'plan' | 'recipes' | 'shopping'

interface TabBarProps {
  active: Tab
  onChange: (tab: Tab) => void
}

const svgProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
  {
    id: 'plan',
    label: 'Plan',
    icon: (
      <svg {...svgProps}>
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
      </svg>
    ),
  },
  {
    id: 'recipes',
    label: 'Recipes',
    icon: (
      <svg {...svgProps}>
        <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
        <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />
      </svg>
    ),
  },
  {
    id: 'shopping',
    label: 'Shopping',
    icon: (
      <svg {...svgProps}>
        <path d="M3 4h2.5l2.2 10.5h10.1L20 7H6.2" />
        <circle cx="9" cy="19" r="1.3" />
        <circle cx="17" cy="19" r="1.3" />
      </svg>
    ),
  },
]

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 flex h-[76px] border-t border-line bg-bg"
    >
      {tabs.map((t) => {
        const isActive = t.id === active
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 text-xs font-medium ${
              isActive ? 'text-accent' : 'text-muted'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
