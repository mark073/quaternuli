'use client'

import { useRef, useState, useCallback } from 'react'
import { importSeedFiles } from '@/lib/import'
import { useStore } from '@/lib/store'

interface FeedbackState {
  count: number
  errors: string[]
}

interface ImportButtonProps {
  compact?: boolean
}

export default function ImportButton({ compact = false }: ImportButtonProps) {
  const { importSeed, setCurrentSeed } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [importing, setImporting] = useState(false)

  async function processFiles(files: FileList | File[]) {
    if (!files || Array.from(files).length === 0) return
    setImporting(true)
    setFeedback(null)

    const { results, errors } = await importSeedFiles(files)

    let lastId: string | null = null
    for (const { seed } of results) {
      await importSeed(seed)
      lastId = seed.id
    }

    if (lastId) setCurrentSeed(lastId)

    setFeedback({
      count: results.length,
      errors: errors.map(e => e.filename),
    })
    setImporting(false)
    setTimeout(() => setFeedback(null), 4000)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) processFiles(e.target.files)
    e.target.value = ''
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  if (compact) {
    return (
      <div className="px-3 py-1.5">
        <input
          ref={inputRef}
          type="file"
          accept=".json,.md,.txt"
          multiple
          className="hidden"
          onChange={onFileChange}
        />
        <button
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={() => setDragging(false)}
          disabled={importing}
          className={`w-full border border-dashed font-bold text-2xs tracking-wider uppercase px-2 py-1 transition-colors text-left whitespace-nowrap
            ${dragging
              ? 'border-swiss-black text-swiss-black bg-swiss-gray100'
              : 'border-swiss-gray200 text-swiss-gray400 hover:border-swiss-black hover:text-swiss-black'}
            ${importing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {importing ? 'Importing…' : '+ Import seeds'}
        </button>
        {feedback && (
          <div className="mt-1 font-bold text-2xs tracking-wider uppercase">
            {feedback.count > 0 && (
              <span className="text-swiss-black">✓ {feedback.count} imported</span>
            )}
            {feedback.errors.length > 0 && (
              <span className="text-swiss-red ml-2">✗ {feedback.errors.join(', ')}</span>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="px-3 pb-3">
      <input
        ref={inputRef}
        type="file"
        accept=".json,.md,.txt"
        multiple
        className="hidden"
        onChange={onFileChange}
      />
      <button
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setDragging(false)}
        disabled={importing}
        className={[
          'w-full border border-dashed font-bold text-2xs tracking-wider uppercase px-3 py-2 transition-colors text-left',
          dragging
            ? 'border-swiss-black text-swiss-black bg-swiss-gray100'
            : 'border-swiss-gray200 text-swiss-gray400 hover:border-swiss-black hover:text-swiss-black',
          importing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        {importing ? 'Importing…' : '+ Import seeds'}
      </button>
      <p className="mt-1 font-mono text-[9px] tracking-wider uppercase text-swiss-gray400 px-0.5">
        .json · .md · .txt
      </p>
      {feedback && (
        <div className="mt-2 font-bold text-2xs tracking-wider uppercase">
          {feedback.count > 0 && (
            <p className="text-swiss-black">
              ✓ {feedback.count} seed{feedback.count !== 1 ? 's' : ''} imported
            </p>
          )}
          {feedback.errors.length > 0 && (
            <p className="text-swiss-red mt-0.5">
              ✗ {feedback.errors.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
