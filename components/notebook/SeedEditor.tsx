'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { exportSeed } from '@/lib/export'
import type { SeedPhase } from '@/lib/types'

export default function SeedEditor() {
  const { seeds, currentSeedId, updateSeed, deleteSeed, setCurrentSeed } = useStore()
  const seed = seeds.find(s => s.id === currentSeedId) ?? null

  const [localTitle, setLocalTitle] = useState('')
  const [localContent, setLocalContent] = useState('')
  const [localTags, setLocalTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const saveTimer = useRef<NodeJS.Timeout | undefined>(undefined)
  const flashTimer = useRef<NodeJS.Timeout | undefined>(undefined)

  // Sync local state when seed changes
  useEffect(() => {
    if (!seed) return
    setLocalTitle(seed.title)
    setLocalContent(seed.content)
    setLocalTags(seed.tags)
    setTagInput('')
  }, [seed?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const persistUpdate = useCallback((patch: Parameters<typeof updateSeed>[1]) => {
    if (!currentSeedId) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      await updateSeed(currentSeedId, patch)
      setSavedFlash(true)
      clearTimeout(flashTimer.current)
      flashTimer.current = setTimeout(() => setSavedFlash(false), 1200)
    }, 500)
  }, [currentSeedId, updateSeed])

  function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLocalTitle(e.target.value)
    persistUpdate({ title: e.target.value, tags: localTags, content: localContent })
  }

  function onContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setLocalContent(e.target.value)
    persistUpdate({ content: e.target.value, title: localTitle, tags: localTags })
  }

  function onPhaseChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const phase = e.target.value as SeedPhase
    updateSeed(currentSeedId!, { phase })
  }

  function onTagKeydown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = tagInput.trim().replace(',', '')
      if (!val || localTags.includes(val)) return
      const newTags = [...localTags, val]
      setLocalTags(newTags)
      setTagInput('')
      persistUpdate({ tags: newTags, title: localTitle, content: localContent })
    }
    if (e.key === 'Backspace' && !tagInput && localTags.length > 0) {
      const newTags = localTags.slice(0, -1)
      setLocalTags(newTags)
      persistUpdate({ tags: newTags, title: localTitle, content: localContent })
    }
  }

  function removeTag(tag: string) {
    const newTags = localTags.filter(t => t !== tag)
    setLocalTags(newTags)
    persistUpdate({ tags: newTags, title: localTitle, content: localContent })
  }

  async function handleDelete() {
    if (!currentSeedId) return
    if (!confirm('Delete this seed?')) return
    await deleteSeed(currentSeedId)
    setCurrentSeed(null)
  }

  if (!seed) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center border-r-2 border-swiss-black">
        <div className="text-[120px] font-bold leading-none text-swiss-gray200 select-none tracking-tighter">Q</div>
        <p className="text-2xs text-swiss-gray400 uppercase tracking-widest mt-4">Select a seed or create a new one</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col border-r-2 border-swiss-black overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-swiss-gray200 flex-shrink-0">
        <input
          type="text"
          value={localTitle}
          onChange={onTitleChange}
          placeholder="Seed title…"
          className="flex-1 font-sans font-bold text-lg tracking-tightest border-none outline-none bg-transparent text-swiss-black placeholder-swiss-gray200"
        />
        <select
          value={seed.phase}
          onChange={onPhaseChange}
          className="font-sans font-bold text-2xs tracking-wider uppercase border border-swiss-black px-2 py-1.5 bg-transparent text-swiss-black outline-none cursor-pointer"
        >
          <option value="capture">Capture</option>
          <option value="tend">Tend</option>
          <option value="harvest">Harvest</option>
        </select>
        <button
          onClick={handleDelete}
          className="font-bold text-2xs tracking-wider uppercase border border-swiss-gray200 px-2.5 py-1.5 text-swiss-gray400 hover:border-swiss-red hover:text-swiss-red transition-colors"
        >
          Delete
        </button>
      </div>

      {/* Tags */}
      <div className="flex items-center flex-wrap gap-2 px-6 py-2.5 border-b border-swiss-gray200 flex-shrink-0 min-h-[40px]">
        {localTags.map(tag => (
          <span key={tag} className="flex items-center gap-1 border border-swiss-gray200 font-bold text-2xs tracking-wider uppercase px-2 py-0.5 text-swiss-gray600">
            {tag}
            <button onClick={() => removeTag(tag)} className="text-swiss-gray400 hover:text-swiss-red leading-none text-sm">×</button>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={onTagKeydown}
          placeholder="+ tag…"
          className="font-sans text-sm border-none outline-none bg-transparent text-swiss-black placeholder-swiss-gray400 w-24"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <textarea
          value={localContent}
          onChange={onContentChange}
          placeholder="Plant your thought here. Raw, unfinished, half-formed — that's fine. The Gardener will help it grow."
          className="w-full h-full min-h-[200px] font-sans text-md leading-relaxed border-none outline-none resize-none bg-transparent text-swiss-black placeholder-swiss-gray200"
        />
      </div>

      {/* Harvest bar */}
      {seed.phase === 'harvest' && (
        <div className="flex items-center gap-4 px-6 py-2.5 bg-swiss-black border-t-2 border-swiss-black flex-shrink-0">
          <span className="text-lg">🌾</span>
          <span className="font-bold text-2xs tracking-wider uppercase text-white">Ready for harvest</span>
          <div className="ml-auto flex items-center gap-0">
            <button
              onClick={() => exportSeed(seed, 'md')}
              className="px-4 py-1.5 bg-swiss-red text-white font-bold text-2xs tracking-wider uppercase hover:bg-red-700 transition-colors"
            >
              Export
            </button>
            <div className="relative">
              <button
                onClick={() => setExportOpen(v => !v)}
                className="px-2.5 py-1.5 bg-[#333] text-white font-bold text-sm hover:bg-[#444] transition-colors border-l border-[#555]"
              >
                ▾
              </button>
              {exportOpen && (
                <div className="absolute bottom-full right-0 mb-1.5 bg-white border-2 border-swiss-black min-w-[180px] flex flex-col z-50">
                  {(['md','txt','html','json'] as const).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => { exportSeed(seed, fmt); setExportOpen(false) }}
                      className="flex items-center justify-between px-3.5 py-2.5 font-bold text-2xs tracking-wider uppercase text-swiss-black hover:bg-swiss-gray100 border-b border-swiss-gray200 last:border-0 transition-colors"
                    >
                      <span>{{ md:'Markdown', txt:'Plain Text', html:'Styled HTML', json:'JSON' }[fmt]}</span>
                      <span className="font-mono text-2xs text-swiss-gray400">.{fmt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save flash */}
      {savedFlash && (
        <div className="absolute bottom-4 right-4 font-mono text-2xs tracking-wider text-swiss-gray400 uppercase save-flash pointer-events-none">
          Saved
        </div>
      )}
    </div>
  )
}
