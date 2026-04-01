'use client'

import { useCallback } from 'react'
import { nanoid } from './nanoid'
import { parseGardenerType } from './gardener-prompt'
import { useStore } from './store'
import type { GardenerRequest, GardenerMessageType } from './types'

// ─── Friendly error messages ──────────────────────────────────────────────────

function friendlyError(raw: unknown): string {
  try {
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw as Record<string, unknown>
    const type = (obj?.error as Record<string, unknown>)?.type as string
    const msg  = (obj?.error as Record<string, unknown>)?.message as string

    if (type === 'overloaded_error' || msg?.toLowerCase().includes('overload')) {
      return "The Gardener is resting — Anthropic's servers are busy right now. Try again in a moment. 🌱"
    }
    if (type === 'authentication_error' || msg?.toLowerCase().includes('api key')) {
      return "Authentication failed — check that your ANTHROPIC_API_KEY in .env.local is correct."
    }
    if (type === 'rate_limit_error' || msg?.toLowerCase().includes('rate limit')) {
      return "Rate limit reached — too many requests. Wait a minute and try again."
    }
    if (type === 'invalid_request_error') {
      return "Invalid request — the seed content may be too long. Try a shorter message."
    }
    if (msg) return msg
  } catch { /* not JSON, use raw */ }
  return typeof raw === 'string' ? raw : "Something went wrong. Please try again."
}

// ─── Shared streaming logic ───────────────────────────────────────────────────

async function streamGardener(
  req: GardenerRequest,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
) {
  const res = await fetch('/api/gardener', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })

  if (!res.ok || !res.body) {
    onError(friendlyError(`API error: ${res.status}`))
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })

    const lines = buf.split('\n')
    buf = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') { onDone(); return }
      try {
        const parsed = JSON.parse(data)
        if (parsed.error) { onError(friendlyError(parsed.error)); return }
        if (parsed.text) onChunk(parsed.text)
      } catch { /* skip malformed lines */ }
    }
  }
  onDone()
}

// ─── Hook: notebook Gardener ──────────────────────────────────────────────────

export function useNotebookGardener() {
  const {
    currentSeedId, seeds,
    addGardenerMessage, updateLastGardenerMessage,
    gardenerStreaming, setGardenerStreaming,
  } = useStore()

  const send = useCallback(async (userMessage: string, auto = false) => {
    if (!currentSeedId || gardenerStreaming) return
    const seed = seeds.find((s) => s.id === currentSeedId)
    if (!seed) return

    const msgId = nanoid()
    setGardenerStreaming(true)

    // Add user message (skip for auto-triggers)
    if (!auto) {
      addGardenerMessage(currentSeedId, {
        id: nanoid(),
        role: 'user',
        type: 'user',
        content: userMessage,
        createdAt: new Date().toISOString(),
      })
    }

    // Add placeholder streaming message
    addGardenerMessage(currentSeedId, {
      id: msgId,
      role: 'gardener',
      type: 'suggestion',
      content: '',
      streaming: true,
      createdAt: new Date().toISOString(),
    })

    let accumulated = ''

    await streamGardener(
      {
        mode: 'notebook',
        userMessage,
        seed: { title: seed.title, content: seed.content, phase: seed.phase, tags: seed.tags },
        allSeedTitles: seeds.map((s) => s.title).filter(Boolean),
      },
      (chunk) => {
        accumulated += chunk
        updateLastGardenerMessage(currentSeedId, { content: accumulated })
      },
      () => {
        // Parse type from completed response
        const type = parseGardenerType(accumulated) as GardenerMessageType
        // Remove the type label line from display content
        const lines = accumulated.split('\n')
        const firstUpper = lines[0].trim().toUpperCase()
        const displayContent = ['INSIGHT','QUESTION','SUGGESTION','CONNECTION'].includes(firstUpper)
          ? lines.slice(1).join('\n').trimStart()
          : accumulated
        updateLastGardenerMessage(currentSeedId, {
          type,
          content: displayContent,
          streaming: false,
        })
        setGardenerStreaming(false)
      },
      (err) => {
        updateLastGardenerMessage(currentSeedId, {
          type: 'suggestion',
          content: err,
          streaming: false,
        })
        setGardenerStreaming(false)
      },
    )
  }, [currentSeedId, seeds, gardenerStreaming, addGardenerMessage, updateLastGardenerMessage, setGardenerStreaming])

  return { send, streaming: gardenerStreaming }
}

// ─── Hook: code Gardener ──────────────────────────────────────────────────────

export function useCodeGardener() {
  const {
    currentFileId, files,
    addCodeGardenerMessage, updateLastCodeGardenerMessage,
    codeGardenerStreaming, setCodeGardenerStreaming,
  } = useStore()

  const send = useCallback(async (userMessage: string, auto = false) => {
    if (!currentFileId || codeGardenerStreaming) return
    const file = files.find((f) => f.id === currentFileId)
    if (!file) return

    setCodeGardenerStreaming(true)

    if (!auto) {
      addCodeGardenerMessage(currentFileId, {
        id: nanoid(),
        role: 'user',
        type: 'user',
        content: userMessage,
        createdAt: new Date().toISOString(),
      })
    }

    addCodeGardenerMessage(currentFileId, {
      id: nanoid(),
      role: 'gardener',
      type: 'tip',
      content: '',
      streaming: true,
      createdAt: new Date().toISOString(),
    })

    let accumulated = ''

    await streamGardener(
      {
        mode: 'code',
        userMessage,
        file: { name: file.name, lang: file.lang, content: file.content },
      },
      (chunk) => {
        accumulated += chunk
        updateLastCodeGardenerMessage(currentFileId, { content: accumulated })
      },
      () => {
        const type = parseGardenerType(accumulated) as GardenerMessageType
        const lines = accumulated.split('\n')
        const firstUpper = lines[0].trim().toUpperCase()
        const displayContent = ['TIP','REVIEW','ISSUE','QUESTION'].includes(firstUpper)
          ? lines.slice(1).join('\n').trimStart()
          : accumulated
        updateLastCodeGardenerMessage(currentFileId, {
          type,
          content: displayContent,
          streaming: false,
        })
        setCodeGardenerStreaming(false)
      },
      (err) => {
        updateLastCodeGardenerMessage(currentFileId, {
          type: 'tip',
          content: err,
          streaming: false,
        })
        setCodeGardenerStreaming(false)
      },
    )
  }, [currentFileId, files, codeGardenerStreaming, addCodeGardenerMessage, updateLastCodeGardenerMessage, setCodeGardenerStreaming])

  return { send, streaming: codeGardenerStreaming }
}
