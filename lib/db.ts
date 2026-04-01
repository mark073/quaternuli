import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Seed, CodeFile } from './types'

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
}

let _db: IDBPDatabase<QuaternuliDB> | null = null

async function getDB() {
  if (_db) return _db
  _db = await openDB<QuaternuliDB>('quaternuli', 1, {
    upgrade(db) {
      const seedStore = db.createObjectStore('seeds', { keyPath: 'id' })
      seedStore.createIndex('by-updated', 'updatedAt')
      seedStore.createIndex('by-phase', 'phase')

      const fileStore = db.createObjectStore('files', { keyPath: 'id' })
      fileStore.createIndex('by-updated', 'updatedAt')

      db.createObjectStore('prefs')
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
