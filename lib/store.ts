import { create } from 'zustand'
import { nanoid } from './nanoid'
import type {
  Seed, CodeFile, GardenerMessage, AppMode, SeedPhase, CodeLang,
} from './types'
import {
  getSeeds, putSeed, deleteSeed as dbDeleteSeed,
  getFiles, putFile, deleteFile as dbDeleteFile,
  getPref, setPref,
} from './db'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function now() { return new Date().toISOString() }

// ─── Store shape ──────────────────────────────────────────────────────────────

interface QuaternuliState {
  // App mode
  mode: AppMode
  setMode: (mode: AppMode) => void

  // Seeds
  seeds: Seed[]
  currentSeedId: string | null
  seedFilter: SeedPhase | 'all'
  seedSearch: string
  loadSeeds: () => Promise<void>
  setCurrentSeed: (id: string | null) => void
  setSeedFilter: (f: SeedPhase | 'all') => void
  setSeedSearch: (q: string) => void
  createSeed: () => Promise<Seed>
  updateSeed: (id: string, patch: Partial<Omit<Seed, 'id' | 'createdAt'>>) => Promise<void>
  deleteSeed: (id: string) => Promise<void>

  // Code files
  files: CodeFile[]
  currentFileId: string | null
  loadFiles: () => Promise<void>
  setCurrentFile: (id: string | null) => void
  createFile: (name: string, lang: CodeLang) => Promise<CodeFile>
  updateFile: (id: string, patch: Partial<Omit<CodeFile, 'id' | 'createdAt'>>) => Promise<void>
  deleteFile: (id: string) => Promise<void>

  // Notebook Gardener messages (per seed — keyed by seed id)
  gardenerMessages: Record<string, GardenerMessage[]>
  addGardenerMessage: (seedId: string, msg: GardenerMessage) => void
  updateLastGardenerMessage: (seedId: string, patch: Partial<GardenerMessage>) => void

  // Code Gardener messages (per file — keyed by file id)
  codeGardenerMessages: Record<string, GardenerMessage[]>
  addCodeGardenerMessage: (fileId: string, msg: GardenerMessage) => void
  updateLastCodeGardenerMessage: (fileId: string, patch: Partial<GardenerMessage>) => void

  // Gardener streaming state
  gardenerStreaming: boolean
  setGardenerStreaming: (v: boolean) => void
  codeGardenerStreaming: boolean
  setCodeGardenerStreaming: (v: boolean) => void

  // Hydration
  hydrated: boolean
  hydrate: () => Promise<void>
}

export const useStore = create<QuaternuliState>((set, get) => ({
  // ─── Mode ──────────────────────────────────────────────────────────────────
  mode: 'notebook',
  setMode: (mode) => {
    set({ mode })
    setPref('mode', mode)
  },

  // ─── Seeds ─────────────────────────────────────────────────────────────────
  seeds: [],
  currentSeedId: null,
  seedFilter: 'all',
  seedSearch: '',

  loadSeeds: async () => {
    const seeds = await getSeeds()
    set({ seeds })
  },

  setCurrentSeed: (id) => {
    set({ currentSeedId: id })
    if (id) setPref('currentSeedId', id)
  },

  setSeedFilter: (f) => set({ seedFilter: f }),
  setSeedSearch: (q) => set({ seedSearch: q }),

  createSeed: async () => {
    const seed: Seed = {
      id: nanoid(),
      title: '',
      content: '',
      phase: 'capture',
      tags: [],
      createdAt: now(),
      updatedAt: now(),
    }
    await putSeed(seed)
    set((s) => ({ seeds: [seed, ...s.seeds] }))
    return seed
  },

  updateSeed: async (id, patch) => {
    const { seeds } = get()
    const existing = seeds.find((s) => s.id === id)
    if (!existing) return
    const updated = { ...existing, ...patch, updatedAt: now() }
    await putSeed(updated)
    set({ seeds: seeds.map((s) => (s.id === id ? updated : s)) })
  },

  deleteSeed: async (id) => {
    await dbDeleteSeed(id)
    set((s) => ({
      seeds: s.seeds.filter((seed) => seed.id !== id),
      currentSeedId: s.currentSeedId === id ? null : s.currentSeedId,
    }))
  },

  // ─── Code files ────────────────────────────────────────────────────────────
  files: [],
  currentFileId: null,

  loadFiles: async () => {
    const files = await getFiles()
    set({ files })
  },

  setCurrentFile: (id) => {
    set({ currentFileId: id })
    if (id) setPref('currentFileId', id)
  },

  createFile: async (name, lang) => {
    const file: CodeFile = {
      id: nanoid(),
      name,
      lang,
      content: '',
      createdAt: now(),
      updatedAt: now(),
    }
    await putFile(file)
    set((s) => ({ files: [...s.files, file] }))
    return file
  },

  updateFile: async (id, patch) => {
    const { files } = get()
    const existing = files.find((f) => f.id === id)
    if (!existing) return
    const updated = { ...existing, ...patch, updatedAt: now() }
    await putFile(updated)
    set({ files: files.map((f) => (f.id === id ? updated : f)) })
  },

  deleteFile: async (id) => {
    await dbDeleteFile(id)
    set((s) => ({
      files: s.files.filter((f) => f.id !== id),
      currentFileId: s.currentFileId === id ? null : s.currentFileId,
    }))
  },

  // ─── Gardener messages ─────────────────────────────────────────────────────
  gardenerMessages: {},
  addGardenerMessage: (seedId, msg) =>
    set((s) => ({
      gardenerMessages: {
        ...s.gardenerMessages,
        [seedId]: [...(s.gardenerMessages[seedId] ?? []), msg],
      },
    })),
  updateLastGardenerMessage: (seedId, patch) =>
    set((s) => {
      const msgs = s.gardenerMessages[seedId] ?? []
      if (msgs.length === 0) return s
      const updated = [...msgs]
      updated[updated.length - 1] = { ...updated[updated.length - 1], ...patch }
      return { gardenerMessages: { ...s.gardenerMessages, [seedId]: updated } }
    }),

  codeGardenerMessages: {},
  addCodeGardenerMessage: (fileId, msg) =>
    set((s) => ({
      codeGardenerMessages: {
        ...s.codeGardenerMessages,
        [fileId]: [...(s.codeGardenerMessages[fileId] ?? []), msg],
      },
    })),
  updateLastCodeGardenerMessage: (fileId, patch) =>
    set((s) => {
      const msgs = s.codeGardenerMessages[fileId] ?? []
      if (msgs.length === 0) return s
      const updated = [...msgs]
      updated[updated.length - 1] = { ...updated[updated.length - 1], ...patch }
      return { codeGardenerMessages: { ...s.codeGardenerMessages, [fileId]: updated } }
    }),

  gardenerStreaming: false,
  setGardenerStreaming: (v) => set({ gardenerStreaming: v }),
  codeGardenerStreaming: false,
  setCodeGardenerStreaming: (v) => set({ codeGardenerStreaming: v }),

  // ─── Hydration ─────────────────────────────────────────────────────────────
  hydrated: false,
  hydrate: async () => {
    const [seeds, files, mode, currentSeedId, currentFileId] = await Promise.all([
      getSeeds(),
      getFiles(),
      getPref('mode'),
      getPref('currentSeedId'),
      getPref('currentFileId'),
    ])
    set({
      seeds,
      files,
      mode: (mode as AppMode) ?? 'notebook',
      currentSeedId: currentSeedId ?? null,
      currentFileId: currentFileId ?? null,
      hydrated: true,
    })
  },
}))
