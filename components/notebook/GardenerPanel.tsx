'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { useNotebookGardener } from '@/lib/useGardener'
import type { GardenerMessage, GardenerMessageType } from '@/lib/types'

const TYPE_LABELS: Record<GardenerMessageType, string> = {
  insight:    'Insight',
  suggestion: 'Suggestion',
  question:   'Question',
  tip:        'Tip',
  review:     'Review',
  error:      'Issue',
  welcome:    'Welcome',
  user:       'You',
}

const TYPE_BORDER: Record<GardenerMessageType, string> = {
  insight:    'border-l-swiss-red',
  suggestion: 'border-l-swiss-black',
  question:   'border-l-swiss-gray400',
  tip:        'border-l-swiss-gray400',
  review:     'border-l-swiss-black',
  error:      'border-l-swiss-red',
  welcome:    'border-l-swiss-red',
  user:       'border-l-swiss-gray200',
}

const TYPE_LABEL_COLOR: Record<GardenerMessageType, string> = {
  insight:    'text-swiss-red',
  suggestion: 'text-swiss-black',
  question:   'text-swiss-gray400',
  tip:        'text-swiss-gray400',
  review:     'text-swiss-black',
  error:      'text-swiss-red',
  welcome:    'text-swiss-red',
  user:       'text-swiss-gray400',
}

function GardenerMsg({ msg }: { msg: GardenerMessage }) {
  return (
    <div className={`border-l-2 px-3 py-3 fade-up ${TYPE_BORDER[msg.type]} ${msg.role === 'user' ? 'bg-swiss-gray100' : ''}`}>
      <div className={`font-bold text-2xs tracking-widest uppercase mb-1.5 ${TYPE_LABEL_COLOR[msg.type]}`}>
        {TYPE_LABELS[msg.type]}
      </div>
      <p className={`font-sans text-sm text-swiss-gray600 leading-relaxed ${msg.streaming ? 'streaming-cursor' : ''}`}>
        {msg.content || (msg.streaming ? '' : '…')}
      </p>
    </div>
  )
}

export default function GardenerPanel() {
  const { currentSeedId, seeds, gardenerMessages, gardenerStreaming } = useStore()
  const { send } = useNotebookGardener()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const autoTriggered = useRef<string | null>(null)
  const autoTimer = useRef<NodeJS.Timeout | undefined>(undefined)

  const seed = seeds.find(s => s.id === currentSeedId) ?? null
  const messages = currentSeedId ? (gardenerMessages[currentSeedId] ?? []) : []

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, messages[messages.length - 1]?.content])

  // Auto-trigger Gardener when a seed is first opened (once per seed)
  useEffect(() => {
    if (!seed || autoTriggered.current === seed.id) return
    if (messages.length > 0) { autoTriggered.current = seed.id; return }
    if (seed.content.length < 30) return

    clearTimeout(autoTimer.current)
    autoTimer.current = setTimeout(() => {
      autoTriggered.current = seed.id
      send(`Analyse this seed and give me one focused observation about it.`, true)
    }, 800)

    return () => clearTimeout(autoTimer.current)
  }, [seed?.id, seed?.content, messages.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback(() => {
    const q = input.trim()
    if (!q || gardenerStreaming) return
    setInput('')
    send(q)
  }, [input, gardenerStreaming, send])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="w-72 flex flex-col flex-shrink-0 overflow-hidden border-l-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-swiss-gray200 flex-shrink-0">
        <h3 className="font-bold text-2xs tracking-widest uppercase text-swiss-gray600">The Gardener</h3>
        <span className={`font-mono text-2xs ${gardenerStreaming ? 'text-swiss-red animate-pulse' : 'text-swiss-gray400'}`}>
          {gardenerStreaming ? 'thinking…' : 'idle'}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="border-l-2 border-l-swiss-red px-3 py-3">
            <div className="font-bold text-2xs tracking-widest uppercase mb-1.5 text-swiss-red">Welcome</div>
            <p className="font-sans text-sm text-swiss-gray600 leading-relaxed">
              {seed
                ? "I'm reading your seed…"
                : "Select a seed and I'll help you tend it. I notice patterns, ask questions, and suggest connections between your thoughts."}
            </p>
          </div>
        )}
        {messages.map(msg => <GardenerMsg key={msg.id} msg={msg} />)}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t border-swiss-gray200 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={seed ? "Ask the Gardener…" : "Select a seed first"}
          disabled={!seed || gardenerStreaming}
          className="flex-1 font-sans text-sm px-2.5 py-1.5 border border-swiss-gray200 bg-transparent text-swiss-black outline-none placeholder-swiss-gray400 focus:border-swiss-black transition-colors disabled:opacity-40"
        />
        <button
          onClick={handleSend}
          disabled={!seed || gardenerStreaming || !input.trim()}
          className="px-3 py-1.5 bg-swiss-black text-white font-bold text-sm hover:bg-swiss-red transition-colors disabled:opacity-30"
        >
          →
        </button>
      </div>
    </div>
  )
}
