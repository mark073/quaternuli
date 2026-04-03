'use client'

import Image from 'next/image'
import { useStore } from '@/lib/store'
import ApiKeySettings from './ApiKeySettings'

export default function TopBar() {
  const { mode, setMode, seeds } = useStore()
  const harvested = seeds.filter(s => s.phase === 'harvest').length

  return (
    <header className="flex items-stretch border-b-2 border-swiss-black h-12 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 pl-3 pr-3 md:pr-4 border-r-2 border-swiss-black font-sans font-bold text-base tracking-[0] uppercase select-none whitespace-nowrap">
        <Image src="/logo.png" alt="Quaternuli logo" width={30} height={30} className="flex-shrink-0" />
        {/* Full wordmark on md+, just Q on mobile */}
        <span className="hidden sm:inline">Q<span className="text-swiss-red">U</span>ATERNULI</span>
        <span className="sm:hidden">Q<span className="text-swiss-red">U</span></span>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center px-2 md:px-4 gap-0.5 border-r-2 border-swiss-black">
        <button
          onClick={() => setMode('notebook')}
          className={`px-2.5 md:px-3.5 py-1.5 font-bold text-2xs tracking-wider uppercase transition-all duration-100 border border-transparent
            ${mode === 'notebook'
              ? 'bg-swiss-black text-swiss-white border-swiss-black'
              : 'text-swiss-gray400 hover:border-swiss-black hover:text-swiss-black'}`}
        >
          <span className="hidden sm:inline">Notebook</span>
          <span className="sm:hidden">NB</span>
        </button>
        <button
          onClick={() => setMode('code')}
          className={`px-2.5 md:px-3.5 py-1.5 font-bold text-2xs tracking-wider uppercase transition-all duration-100 border border-transparent
            ${mode === 'code'
              ? 'bg-swiss-black text-swiss-white border-swiss-black'
              : 'text-swiss-gray400 hover:border-swiss-black hover:text-swiss-black'}`}
        >
          Code
        </button>
      </div>

      {/* Meta */}
      <div className="flex items-center px-3 md:px-5 gap-3 md:gap-6 ml-auto font-sans text-2xs tracking-wider text-swiss-gray400 uppercase">
        <span>
          <span className="hidden sm:inline">Seeds: </span>
          <span className="font-bold text-swiss-red">{seeds.length}</span>
        </span>
        {harvested > 0 && (
          <span className="text-swiss-red font-bold hidden sm:inline">{harvested} harvested</span>
        )}
        <ApiKeySettings />
      </div>
    </header>
  )
}
