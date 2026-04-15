import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Seed, CodeFile, GardenerMessage } from './types'

interface QuaternuliDB extends DBSchema {
  seeds: {
    key: string
    value: Seed
    indexes: { 'by-updated': string; 'by-phase': string }
  }
  files: {
    key: string
    value: CodeFile
    indexes: { 'by-updated': string }
  }
  prefs: {
    key: string
    value: string | null
  }
  gardener_messages: {
    key: string          // seedId
    value: { seedId: string; messages: GardenerMessage[] }
  }
}

let _db: IDBPDatabase<QuaternuliDB> | null = null

async function getDB() {
  if (_db) return _db
  _db = await openDB<QuaternuliDB>('quaternuli', 2, {
    upgrade(db, oldVersion) {
      // Version 1 — original stores (only created fresh if starting from scratch)
      if (oldVersion < 1) {
        const seedStore = db.createObjectStore('seeds', { keyPath: 'id' })
        seedStore.createIndex('by-updated', 'updatedAt')
        seedStore.createIndex('by-phase', 'phase')

        const fileStore = db.createObjectStore('files', { keyPath: 'id' })
        fileStore.createIndex('by-updated', 'updatedAt')

        db.createObjectStore('prefs')
      }

      // Version 2 — Gardener message persistence
      if (oldVersion < 2) {
        db.createObjectStore('gardener_messages', { keyPath: 'seedId' })
      }
    },
  })
  return _db
}

// ─── Seeds ────────────────────────────────────────────────────────────────────

export async function getSeeds(): Promise<Seed[]> {
  const db = await getDB()
  const all = await db.getAll('seeds')
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function putSeed(seed: Seed): Promise<void> {
  const db = await getDB()
  await db.put('seeds', seed)
}

export async function deleteSeed(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('seeds', id)
  // Clean up messages for deleted seed
  await db.delete('gardener_messages', id)
}

// ─── Code files ───────────────────────────────────────────────────────────────

export async function getFiles(): Promise<CodeFile[]> {
  const db = await getDB()
  const all = await db.getAll('files')
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function putFile(file: CodeFile): Promise<void> {
  const db = await getDB()
  await db.put('files', file)
}

export async function deleteFile(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('files', id)
}

// ─── Prefs ────────────────────────────────────────────────────────────────────

export async function getPref(key: string): Promise<string | null> {
  const db = await getDB()
  return (await db.get('prefs', key)) ?? null
}

export async function setPref(key: string, value: string): Promise<void> {
  const db = await getDB()
  await db.put('prefs', value, key)
}

// ─── Gardener messages ────────────────────────────────────────────────────────

export async function getGardenerMessages(): Promise<Record<string, GardenerMessage[]>> {
  const db = await getDB()
  const all = await db.getAll('gardener_messages')
  return Object.fromEntries(all.map(r => [r.seedId, r.messages]))
}

export async function putGardenerMessages(seedId: string, messages: GardenerMessage[]): Promise<void> {
  const db = await getDB()
  await db.put('gardener_messages', { seedId, messages })
}

export async function deleteGardenerMessages(seedId: string): Promise<void> {
  const db = await getDB()
  await db.delete('gardener_messages', seedId)
}
