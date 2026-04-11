'use client'

import { useState } from 'react'
import FileSidebar from './FileSidebar'
import CodeEditor from './CodeEditor'
import CodeGardener from './CodeGardener'

export type CodePanel = 'files' | 'editor' | 'gardener'

interface CodeViewProps {
  mobilePanel: CodePanel
  onMobilePanelChange: (panel: CodePanel) => void
}

export default function CodeView({ mobilePanel, onMobilePanelChange }: CodeViewProps) {
  const [tabletGardenerOpen, setTabletGardenerOpen] = useState(false)

  return (
    <div className="flex flex-1 overflow-hidden relative">

      {/* ── MOBILE: single-panel view (< md) ─────────────────── */}
      <div className={`flex-1 flex flex-col overflow-hidden md:hidden ${mobilePanel === 'files' ? 'flex' : 'hidden'}`}>
        <FileSidebar onFileSelect={() => onMobilePanelChange('editor')} />
      </div>
      <div className={`flex-1 flex flex-col overflow-hidden md:hidden ${mobilePanel === 'editor' ? 'flex' : 'hidden'}`}>
        <CodeEditor />
      </div>
      <div className={`flex-1 flex flex-col overflow-hidden md:hidden ${mobilePanel === 'gardener' ? 'flex' : 'hidden'}`}>
        <CodeGardener fullWidth />
      </div>

      {/* ── TABLET: files + editor, Gardener toggleable (md–lg) ── */}
      <div className="hidden md:flex lg:hidden flex-1 overflow-hidden">
        <div className="w-48 flex-shrink-0 border-r-2 border-swiss-black flex flex-col overflow-hidden">
          <FileSidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <CodeEditor gardenerToggle={
            <button
              onClick={() => setTabletGardenerOpen(v => !v)}
              className={`font-mono text-2xs tracking-wider uppercase border px-2.5 py-1 transition-colors
                ${tabletGardenerOpen
                  ? 'bg-swiss-red text-white border-swiss-red'
                  : 'border-[#2a2a2a] text-[#555] hover:border-[#555] hover:text-[#888]'}`}
            >
              Gardener
            </button>
          } />
        </div>
        {tabletGardenerOpen && (
          <div className="w-72 flex-shrink-0 flex flex-col overflow-hidden">
            <CodeGardener />
          </div>
        )}
      </div>

      {/* ── DESKTOP: classic three-panel layout (lg+) ─────────── */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <FileSidebar />
        <CodeEditor />
        <CodeGardener />
      </div>

    </div>
  )
}
