'use client'

type MobilePanel = 'sidebar' | 'editor' | 'gardener'

interface MobileNavProps {
  active: MobilePanel
  onChange: (panel: MobilePanel) => void
  seedCount: number
}

export default function MobileNav({ active, onChange, seedCount }: MobileNavProps) {
  const tabs: { id: MobilePanel; label: string; }[] = [
    { id: 'sidebar',  label: 'Seeds' },
    { id: 'editor',   label: 'Editor' },
    { id: 'gardener', label: 'Gardener' },
  ]

  return (
    <nav className="flex border-t-2 border-swiss-black bg-white flex-shrink-0 lg:hidden">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 font-bold text-2xs tracking-widest uppercase transition-colors
            ${active === tab.id
              ? 'bg-swiss-black text-white'
              : 'text-swiss-gray400 hover:text-swiss-black hover:bg-swiss-gray100'
            }`}
        >
          <span className="text-base leading-none">{tab.icon}</span>
          <span>{tab.id === 'sidebar' ? `Seeds${seedCount > 0 ? ` (${seedCount})` : ''}` : tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
