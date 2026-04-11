'use client'

import { useState } from 'react'
import SeedSidebar from './SeedSidebar'
import SeedEditor from './SeedEditor'
import GardenerPanel from './GardenerPanel'
import type { MobilePanel } from '@/app/page'

interface NotebookViewProps {
  mobilePanel: MobilePanel
  onMobilePanelChange: (panel: MobilePanel) => void
}

export default function NotebookView({ mobilePanel, onMobilePanelChange }: NotebookViewProps) {
  // Tablet: Gardener is toggleable
  const [tabletGardenerOpen, setTabletGardenerOpen] = useState(false)

  return (
    <div className="flex flex-1 overflow-hidden relative">

      {/* ── MOBILE: single-panel view (< md) ─────────────────── */}
      <div className={`flex-1 flex flex-col overflow-hidden md:hidden ${mobilePanel === 'sidebar' ? 'flex' : 'hidden'}`}>
        <SeedSidebar onSeedSelect={() => onMobilePanelChange('editor')} />
      </div>
      <div className={`flex-1 flex flex-col overflow-hidden md:hidden ${mobilePanel === 'editor' ? 'flex' : 'hidden'}`}>
        <SeedEditor />
      </div>
      <div className={`flex-1 flex flex-col overflow-hidden md:hidden ${mobilePanel === 'gardener' ? 'flex' : 'hidden'}`}>
        <GardenerPanel fullWidth />
      </div>

      {/* ── TABLET: sidebar + editor side by side, Gardener as overlay (md–lg) ── */}
      <div className="hidden md:flex lg:hidden flex-1 overflow-hidden">
        {/* Sidebar — narrower on tablet */}
        <div className="w-52 flex-shrink-0 border-r-2 border-swiss-black flex flex-col overflow-hidden">
          <SeedSidebar />
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <SeedEditor gardenerToggle={
            <button
              onClick={() => setTabletGardenerOpen(v => !v)}
              className={`ml-2 px-2.5 py-1.5 font-bold text-2xs tracking-wider uppercase border transition-colors
                ${tabletGardenerOpen
                  ? 'bg-swiss-black text-white border-swiss-black'
                  : 'border-swiss-gray200 text-swiss-gray400 hover:border-swiss-black hover:text-swiss-black'}`}
            >
              Gardener
            </button>
          } />
        </div>

        {/* Gardener slide-in panel */}
        {tabletGardenerOpen && (
          <div className="w-72 flex-shrink-0 border-l-2 border-swiss-black flex flex-col overflow-hidden">
            <GardenerPanel />
          </div>
        )}
      </div>

      {/* ── DESKTOP: classic three-panel layout (lg+) ─────────── */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <SeedSidebar />
        <SeedEditor />
        <GardenerPanel />
      </div>

    </div>
  )
}
