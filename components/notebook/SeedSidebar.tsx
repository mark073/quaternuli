'use client'

import { useMemo } from 'react'
import { useStore } from '@/lib/store'
import type { SeedPhase } from '@/lib/types'

const PHASES: { value: SeedPhase | 'all'; label: string }[] = [
  { value: 'all',     label: 'All'  },
  { value: 'capture', label: 'Cap'  },
  { value: 'tend',    label: 'Tend' },
  { value: 'harvest', label: 'Harv' },
]

interface SeedSidebarProps {
  // On mobile: called when user taps a seed, so parent can switch to editor panel
  onSeedSelect?: () => void
}

export default function SeedSidebar({ onSeedSelect }: SeedSidebarProps) {
  const {
    seeds, currentSeedId, seedFilter, seedSearch,
    setCurrentSeed, setSeedFilter, setSeedSearch,
    createSeed,
  } = useStore()

  const filtered = useMemo(() => {
    const q = seedSearch.toLowerCase()
    return seeds.filter(s => {
      const matchPhase = seedFilter === 'all' || s.phase === seedFilter
      const matchQ = !q || s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q) || s.tags.some(t => t.includes(q))
      return matchPhase && matchQ
    })
  }, [seeds, seedFilter, seedSearch])

  async function handleNewSeed() {
    const seed = await createSeed()
    setCurrentSeed(seed.id)
    onSeedSelect?.()
  }

  function handleSeedClick(id: string) {
    setCurrentSeed(id)
    onSeedSelect?.()
  }

  return (
    <aside className="w-full lg:w-64 border-r-0 lg:border-r-2 border-swiss-black flex flex-col flex-shrink-0 overflow-hidden h-full">
      {/* Search + filter */}
      <div className="p-2 border-b border-swiss-gray200 flex flex-col gap-2">
        <input
          type="text"
          value={seedSearch}
          onChange={e => setSeedSearch(e.target.value)}
          placeholder="Search seeds…"
          className="w-full font-sans text-sm px-2.5 py-1.5 border border-swiss-gray200 bg-swiss-gray100 text-swiss-black outline-none placeholder-swiss-gray400 focus:border-swiss-black focus:bg-white transition-colors"
        />
        <div className="flex gap-1">
          {PHASES.map(p => {
            const isActive = seedFilter === p.value
            const activeClass =
              p.value === 'harvest' && isActive ? 'bg-swiss-red border-swiss-red text-white'
              : p.value === 'tend' && isActive ? 'bg-swiss-gray600 border-swiss-gray600 text-white'
              : isActive ? 'bg-swiss-black border-swiss-black text-white'
              : 'border-swiss-gray200 text-swiss-gray400 hover:border-swiss-black hover:text-swiss-black'
            return (
              <button
                key={p.value}
                onClick={() => setSeedFilter(p.value)}
                className={`flex-1 py-1 font-bold text-2xs tracking-wider uppercase border transition-all ${activeClass}`}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2">
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-2xs text-swiss-gray400 uppercase tracking-wider text-center">
            No seeds found
          </p>
        ) : (
          filtered.map(seed => {
            const date = new Date(seed.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
            const isActive = seed.id === currentSeedId
            return (
              <div
                key={seed.id}
                onClick={() => handleSeedClick(seed.id)}
                className={`px-4 py-3 cursor-pointer border-l-[3px] border-b border-b-swiss-gray100 transition-all
                  ${isActive ? 'border-l-swiss-red bg-swiss-gray100' : 'border-l-transparent hover:bg-swiss-gray100'}`}
              >
                <div className={`text-2xs font-bold tracking-wider uppercase mb-1
                  ${seed.phase === 'harvest' ? 'text-swiss-red' : seed.phase === 'tend' ? 'text-swiss-gray600' : 'text-swiss-gray400'}`}>
                  {seed.phase}
                </div>
                <div className="text-sm font-medium text-swiss-black truncate leading-tight">
                  {seed.title || '(untitled)'}
                </div>
                <div className="font-mono text-2xs text-swiss-gray400 mt-1">{date}</div>
              </div>
            )
          })
        )}
      </div>

      {/* New seed button */}
      <button
        onClick={handleNewSeed}
        className="mx-4 my-3 py-2.5 bg-swiss-black text-white font-bold text-2xs tracking-widest uppercase hover:bg-swiss-red transition-colors"
      >
        + New Seed
      </button>
    </aside>
  )
}
