'use client'

import Image from 'next/image'
import { useStore } from '@/lib/store'

export default function TopBar() {
  const { mode, setMode, seeds } = useStore()
  const harvested = seeds.filter(s => s.phase === 'harvest').length

  return (
    <header className="flex items-stretch border-b-2 border-swiss-black h-12 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 pl-3 pr-4 border-r-2 border-swiss-black font-sans font-bold text-base tracking-[0] uppercase select-none whitespace-nowrap">
        <Image src="/logo.png" alt="Quaternuli logo" width={30} height={30} className="flex-shrink-0" />
        <span>Q<span className="text-swiss-red">U</span>ATERNULI</span>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center px-4 gap-0.5 border-r-2 border-swiss-black">
        <button
          onClick={() => setMode('notebook')}
          className={`px-3.5 py-1.5 font-bold text-2xs tracking-wider uppercase transition-all duration-100 border border-transparent
            ${mode === 'notebook'
              ? 'bg-swiss-black text-swiss-white border-swiss-black'
              : 'text-swiss-gray400 hover:border-swiss-black hover:text-swiss-black'}`}
        >
          Notebook
        </button>
        <button
          onClick={() => setMode('code')}
          className={`px-3.5 py-1.5 font-bold text-2xs tracking-wider uppercase transition-all duration-100 border border-transparent
            ${mode === 'code'
              ? 'bg-swiss-black text-swiss-white border-swiss-black'
              : 'text-swiss-gray400 hover:border-swiss-black hover:text-swiss-black'}`}
        >
          Code
        </button>
      </div>

      {/* Meta */}
      <div className="flex items-center px-5 gap-6 ml-auto font-sans text-2xs tracking-wider text-swiss-gray400 uppercase">
        <span>
          Seeds: <span className="font-bold text-swiss-red">{seeds.length}</span>
        </span>
        {harvested > 0 && (
          <span className="text-swiss-red font-bold">{harvested} harvested</span>
        )}
      </div>
    </header>
  )
}
