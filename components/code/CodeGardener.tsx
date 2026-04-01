'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { useCodeGardener } from '@/lib/useGardener'
import type { GardenerMessage, GardenerMessageType } from '@/lib/types'

const TYPE_LABELS: Record<GardenerMessageType, string> = {
  insight: 'Insight', suggestion: 'Suggestion', question: 'Question',
  tip: 'Tip', review: 'Review', error: 'Issue', welcome: 'Ready', user: 'You',
}

const TYPE_BORDER: Record<GardenerMessageType, string> = {
  insight: 'border-l-swiss-red', suggestion: 'border-l-[#555]',
  question: 'border-l-[#444]',  tip: 'border-l-[#555]',
  review: 'border-l-[#888]',    error: 'border-l-swiss-red',
  welcome: 'border-l-[#444]',   user: 'border-l-[#2a2a2a]',
}

const TYPE_LABEL_COLOR: Record<GardenerMessageType, string> = {
  insight: 'text-swiss-red',    suggestion: 'text-[#555]',
  question: 'text-[#444]',      tip: 'text-[#555]',
  review: 'text-[#888]',        error: 'text-swiss-red',
  welcome: 'text-[#444]',       user: 'text-[#555]',
}

const TYPE_TEXT_COLOR: Record<GardenerMessageType, string> = {
  insight: 'text-[#aaa]',    suggestion: 'text-[#888]',
  question: 'text-[#777]',   tip: 'text-[#aaa]',
  review: 'text-[#888]',     error: 'text-[#ff6b6b]',
  welcome: 'text-[#555]',    user: 'text-[#aaa]',
}

function CodeGardenerMsg({ msg }: { msg: GardenerMessage }) {
  return (
    <div className={`border-l-2 px-3 py-2.5 fade-up ${TYPE_BORDER[msg.type]} ${msg.role === 'user' ? 'bg-[#1a1a1a]' : ''}`}>
      <div className={`font-mono font-bold text-[8px] tracking-[0.2em] uppercase mb-1.5 ${TYPE_LABEL_COLOR[msg.type]}`}>
        {TYPE_LABELS[msg.type]}
      </div>
      <p className={`font-mono text-xs leading-relaxed ${TYPE_TEXT_COLOR[msg.type]} ${msg.streaming ? 'streaming-cursor' : ''}`}>
        {msg.content || (msg.streaming ? '' : '…')}
      </p>
    </div>
  )
}

export default function CodeGardener() {
  const { currentFileId, files, codeGardenerMessages, codeGardenerStreaming } = useStore()
  const { send } = useCodeGardener()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const autoTriggered = useRef<string | null>(null)
  const autoTimer = useRef<NodeJS.Timeout | undefined>(undefined)

  const file = files.find(f => f.id === currentFileId) ?? null
  const messages = currentFileId ? (codeGardenerMessages[currentFileId] ?? []) : []

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, messages[messages.length - 1]?.content])

  // Auto-trigger on file open
  useEffect(() => {
    if (!file || autoTriggered.current === file.id) return
    if (messages.length > 0) { autoTriggered.current = file.id; return }
    if (file.content.length < 30) return

    clearTimeout(autoTimer.current)
    autoTimer.current = setTimeout(() => {
      autoTriggered.current = file.id
      send('Give me a brief initial review of this code.', true)
    }, 1000)

    return () => clearTimeout(autoTimer.current)
  }, [file?.id, file?.content, messages.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback(() => {
    const q = input.trim()
    if (!q || codeGardenerStreaming) return
    setInput('')
    send(q)
  }, [input, codeGardenerStreaming, send])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="w-72 flex flex-col flex-shrink-0 overflow-hidden bg-[#0E0E0E] border-l-2 border-swiss-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#222]">
        <span className="font-mono font-bold text-[9px] tracking-[0.2em] uppercase text-[#444]">Gardener</span>
        <span className={`font-mono text-[9px] ${codeGardenerStreaming ? 'text-swiss-red animate-pulse' : 'text-[#333]'}`}>
          {codeGardenerStreaming ? 'reviewing…' : file ? 'ready' : '—'}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
        {messages.length === 0 && (
          <div className="border-l-2 border-l-[#444] px-3 py-2.5">
            <div className="font-mono font-bold text-[8px] tracking-[0.2em] uppercase mb-1.5 text-[#444]">Ready</div>
            <p className="font-mono text-xs text-[#555] leading-relaxed">
              {file ? "Reading your code…" : "Open a file and I'll review it, spot issues, and suggest improvements."}
            </p>
          </div>
        )}
        {messages.map(msg => <CodeGardenerMsg key={msg.id} msg={msg} />)}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-1.5 p-3 border-t border-[#222]">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={file ? "Ask about the code…" : "Open a file first"}
          disabled={!file || codeGardenerStreaming}
          className="flex-1 font-mono text-xs px-2.5 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] text-[#ccc] outline-none placeholder-[#333] focus:border-[#444] transition-colors disabled:opacity-40"
        />
        <button
          onClick={handleSend}
          disabled={!file || codeGardenerStreaming || !input.trim()}
          className="px-2.5 py-1.5 bg-[#222] text-[#888] font-mono text-xs hover:bg-swiss-red hover:text-white transition-colors disabled:opacity-30"
        >
          →
        </button>
      </div>
    </div>
  )
}
