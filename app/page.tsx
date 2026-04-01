'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import TopBar from '@/components/TopBar'
import NotebookView from '@/components/notebook/NotebookView'
import CodeView from '@/components/code/CodeView'
import { seedFixtures, fileFixtures } from '@/lib/fixtures'

export default function Page() {
  const { hydrate, hydrated, mode, seeds, files, createSeed, updateSeed, createFile, updateFile } = useStore()

  useEffect(() => {
    hydrate().then(async () => {
      // Seed example data on first load
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
        {mode === 'notebook' ? <NotebookView /> : <CodeView />}
      </div>
    </div>
  )
}
