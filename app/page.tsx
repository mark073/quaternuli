'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import TopBar from '@/components/TopBar'
import NotebookView from '@/components/notebook/NotebookView'
import CodeView from '@/components/code/CodeView'
import MobileNav from '@/components/MobileNav'
import { seedFixtures, fileFixtures } from '@/lib/fixtures'
import type { CodePanel } from '@/components/code/CodeView'

export type MobilePanel = 'sidebar' | 'editor' | 'gardener'

export default function Page() {
  const { hydrate, hydrated, mode, seeds, files, createSeed, updateSeed, createFile, updateFile } = useStore()
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('sidebar')
  const [codeMobilePanel, setCodeMobilePanel] = useState<CodePanel>('files')

  useEffect(() => {
    hydrate().then(async () => {
      const { seeds: s, files: f } = useStore.getState()
      if (s.length === 0) {
        for (const fixture of seedFixtures) {
          const seed = await createSeed()
          await updateSeed(seed.id, fixture)
        }
      }
      if (f.length === 0) {
        for (const fixture of fileFixtures) {
          const file = await createFile(fixture.name, fixture.lang)
          await updateFile(file.id, { content: fixture.content })
        }
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="font-mono text-2xs tracking-widest text-swiss-gray400 uppercase">
          Loading…
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {mode === 'notebook'
          ? <NotebookView mobilePanel={mobilePanel} onMobilePanelChange={setMobilePanel} />
          : <CodeView mobilePanel={codeMobilePanel} onMobilePanelChange={setCodeMobilePanel} />
        }
      </div>

      {/* Mobile bottom nav — notebook mode */}
      {mode === 'notebook' && (
        <MobileNav
          active={mobilePanel}
          onChange={setMobilePanel}
          seedCount={seeds.length}
        />
      )}

      {/* Mobile bottom nav — code mode */}
      {mode === 'code' && (
        <nav className="md:hidden flex border-t-2 border-swiss-black bg-white flex-shrink-0">
          {([
            { panel: 'files',   label: 'Files'   },
            { panel: 'editor',  label: 'Editor'  },
            { panel: 'gardener',label: 'Gardener'},
          ] as { panel: CodePanel; label: string }[]).map(({ panel, label }) => (
            <button
              key={panel}
              onClick={() => setCodeMobilePanel(panel)}
              className={`flex-1 py-3 font-bold text-2xs tracking-wider uppercase transition-colors
                ${codeMobilePanel === panel
                  ? 'bg-swiss-black text-white'
                  : 'text-swiss-gray400 hover:text-swiss-black'}`}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
