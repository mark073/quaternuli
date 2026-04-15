'use client'

import { useState, useCallback, useRef } from 'react'
import { useStore } from '@/lib/store'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import SeedSidebar from './SeedSidebar'
import SeedEditor from './SeedEditor'
import GardenerPanel from './GardenerPanel'
import type { MobilePanel } from '@/app/page'

interface NotebookViewProps {
  mobilePanel: MobilePanel
  onMobilePanelChange: (panel: MobilePanel) => void
}

export default function NotebookView({ mobilePanel, onMobilePanelChange }: NotebookViewProps) {
  const { currentSeedId, seeds, createSeed, setSeedFilter, setCurrentSeed } = useStore()
  const seed = seeds.find(s => s.id === currentSeedId) ?? null

  // Tablet: Gardener is toggleable
  const [tabletGardenerOpen, setTabletGardenerOpen] = useState(false)

  // Export modal state — lifted here so Mod+Shift+E can open it from anywhere
  const [exportOpen, setExportOpen] = useState(false)

  // Gardener focus trigger — incrementing this tells GardenerPanel to focus its input
  const [gardenerFocusTrigger, setGardenerFocusTrigger] = useState(0)

  // Save trigger — incrementing this tells SeedEditor to flush its pending save
  const [saveTrigger, setSaveTrigger] = useState(0)

  const handleShortcutAction = useCallback(async (action: string) => {
    switch (action) {
      case 'phase:capture':
        setSeedFilter('capture')
        break
      case 'phase:tend':
        setSeedFilter('tend')
        break
      case 'phase:harvest':
        setSeedFilter('harvest')
        break
      case 'seed:new': {
        const newSeed = await createSeed()
        setCurrentSeed(newSeed.id)
        break
      }
      case 'seed:save':
        setSaveTrigger(n => n + 1)
        break
      case 'seed:export':
        if (seed) setExportOpen(true)
        break
      case 'gardener:trigger':
        setGardenerFocusTrigger(n => n + 1)
        break
    }
  }, [seed, createSeed, setSeedFilter, setCurrentSeed])

  useKeyboardShortcuts({
    scope: 'notebook',
    onAction: handleShortcutAction,
    // Disable global shortcuts while export modal is open
    enabled: !exportOpen,
  })

  return (
    <div className="flex flex-1 overflow-hidden relative">

      {/* ── MOBILE: single-panel view (< md) ─────────────────── */}
      <div className={`flex-1 flex flex-col overflow-hidden md:hidden ${mobilePanel === 'sidebar' ? 'flex' : 'hidden'}`}>
        <SeedSidebar onSeedSelect={() => onMobilePanelChange('editor')} />
      </div>
      <div className={`flex-1 flex flex-col overflow-hidden md:hidden ${mobilePanel === 'editor' ? 'flex' : 'hidden'}`}>
        <SeedEditor
          exportOpen={exportOpen}
          onExportOpenChange={setExportOpen}
          saveTrigger={saveTrigger}
        />
      </div>
      <div className={`flex-1 flex flex-col overflow-hidden md:hidden ${mobilePanel === 'gardener' ? 'flex' : 'hidden'}`}>
        <GardenerPanel fullWidth focusTrigger={gardenerFocusTrigger} />
      </div>

      {/* ── TABLET: sidebar + editor side by side, Gardener as overlay (md–lg) ── */}
      <div className="hidden md:flex lg:hidden flex-1 overflow-hidden">
        <div className="w-52 flex-shrink-0 border-r-2 border-swiss-black flex flex-col overflow-hidden">
          <SeedSidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <SeedEditor
            exportOpen={exportOpen}
            onExportOpenChange={setExportOpen}
            saveTrigger={saveTrigger}
            gardenerToggle={
              <button
                onClick={() => setTabletGardenerOpen(v => !v)}
                className={`ml-2 px-2.5 py-1.5 font-bold text-2xs tracking-wider uppercase border transition-colors
                  ${tabletGardenerOpen
                    ? 'bg-swiss-black text-white border-swiss-black'
                    : 'border-swiss-gray200 text-swiss-gray400 hover:border-swiss-black hover:text-swiss-black'}`}
              >
                Gardener
              </button>
            }
          />
        </div>
        {tabletGardenerOpen && (
          <div className="w-72 flex-shrink-0 border-l-2 border-swiss-black flex flex-col overflow-hidden">
            <GardenerPanel focusTrigger={gardenerFocusTrigger} />
          </div>
        )}
      </div>

      {/* ── DESKTOP: classic three-panel layout (lg+) ─────────── */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <SeedSidebar />
        <SeedEditor
          exportOpen={exportOpen}
          onExportOpenChange={setExportOpen}
          saveTrigger={saveTrigger}
        />
        <GardenerPanel focusTrigger={gardenerFocusTrigger} />
      </div>

    </div>
  )
}
