'use client'

import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'quaternuli_api_key'

export function getStoredApiKey(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

export default function ApiKeySettings() {
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [hasKey, setHasKey] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const stored = getStoredApiKey()
    setHasKey(!!stored)
    if (stored) setKey(stored)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  function save() {
    const trimmed = key.trim()
    if (!trimmed) return
    localStorage.setItem(STORAGE_KEY, trimmed)
    setHasKey(true)
    setSaved(true)
    setTimeout(() => { setSaved(false); setOpen(false) }, 1200)
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY)
    setKey('')
    setHasKey(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="relative flex items-center">
      {/* Settings button */}
      <button
        onClick={() => setOpen(v => !v)}
        title="API Key Settings"
        className={`flex items-center gap-1.5 font-bold text-2xs tracking-wider uppercase border px-2.5 py-1 transition-all
          ${hasKey
            ? 'border-swiss-gray200 text-swiss-gray400 hover:border-swiss-black hover:text-swiss-black'
            : 'border-swiss-red text-swiss-red hover:bg-swiss-red hover:text-white'}`}
      >
        <span>⚙</span>
        {/* Full label on sm+, hidden on mobile */}
        <span className="hidden sm:inline">
          {hasKey ? 'API Key ✓' : 'Add API Key'}
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* Panel — full width on mobile, fixed width on sm+ */}
          <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-white border-2 border-swiss-black z-50 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-swiss-gray200">
              <span className="font-bold text-2xs tracking-widest uppercase">Anthropic API Key</span>
              <button
                onClick={() => setOpen(false)}
                className="text-swiss-gray400 hover:text-swiss-black font-mono text-lg leading-none"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-3">
              <p className="text-xs text-swiss-gray600 leading-relaxed">
                Your key is stored <strong>only in this browser</strong> and sent directly to Anthropic.
                It never touches any other server.
                Get a key at <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-swiss-red underline">console.anthropic.com</a>.
              </p>

              <input
                ref={inputRef}
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="sk-ant-api03-..."
                className="w-full font-mono text-xs px-3 py-2 border border-swiss-gray200 bg-swiss-gray100 text-swiss-black outline-none focus:border-swiss-black transition-colors"
              />

              <div className="flex gap-2">
                <button
                  onClick={save}
                  disabled={!key.trim()}
                  className="flex-1 py-2 bg-swiss-black text-white font-bold text-2xs tracking-wider uppercase hover:bg-swiss-red transition-colors disabled:opacity-30"
                >
                  {saved ? '✓ Saved' : 'Save Key'}
                </button>
                {hasKey && (
                  <button
                    onClick={clear}
                    className="px-4 py-2 border border-swiss-gray200 text-swiss-gray400 font-bold text-2xs tracking-wider uppercase hover:border-swiss-red hover:text-swiss-red transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              <p className="text-2xs text-swiss-gray400 leading-relaxed">
                If no key is set, the app uses the server's key (if configured). On the public demo, you need your own key for the Gardener to work.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
