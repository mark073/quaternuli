import type { Seed, SeedPhase } from './types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function newId(): string {
  return Math.random().toString(36).slice(2, 10) +
         Math.random().toString(36).slice(2, 10)
}

function validPhase(val: string): SeedPhase {
  return (['capture', 'tend', 'harvest'] as SeedPhase[]).includes(val as SeedPhase)
    ? (val as SeedPhase)
    : 'capture'
}

function now(): string {
  return new Date().toISOString()
}

// ─── Format parsers ───────────────────────────────────────────────────────────

function parseJson(text: string): Omit<Seed, 'id' | 'createdAt' | 'updatedAt'> {
  const raw = JSON.parse(text)

  // Must be a plain object, not an array or primitive
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error(
      'Not a Quaternuli seed — expected an object with title/content fields'
    )
  }

  // Must have at least a title or content to be recognisable as a seed
  const hasTitle = typeof raw.title === 'string' && raw.title.trim().length > 0
  const hasContent = typeof raw.content === 'string' && raw.content.trim().length > 0
  if (!hasTitle && !hasContent) {
    throw new Error(
      'Not a Quaternuli seed — missing title and content fields'
    )
  }

  const title = hasTitle ? (raw.title as string).trim() : 'Untitled'
  const content = typeof raw.content === 'string' ? raw.content : ''
  const phase = validPhase(typeof raw.phase === 'string' ? raw.phase : '')
  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((t: unknown) => typeof t === 'string')
    : []

  return { title, content, phase, tags }
}

function parseMd(text: string): Omit<Seed, 'id' | 'createdAt' | 'updatedAt'> {
  const lines = text.split('\n')
  let title = 'Untitled'
  let phase: SeedPhase = 'capture'
  let tags: string[] = []
  let contentStart = 0

  // Title: first # heading
  const titleLine = lines.findIndex(l => l.startsWith('# '))
  if (titleLine !== -1) {
    title = lines[titleLine].replace(/^#\s+/, '').trim()
  }

  // Meta lines: **Phase:** and **Tags:**
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    const phaseMatch = l.match(/^\*\*Phase:\*\*\s*(.+)/i)
    if (phaseMatch) phase = validPhase(phaseMatch[1].trim().toLowerCase())

    const tagsMatch = l.match(/^\*\*Tags:\*\*\s*(.+)/i)
    if (tagsMatch) {
      tags = tagsMatch[1].split(',').map(t => t.trim()).filter(Boolean)
    }
  }

  // Content: everything after the --- divider
  const divider = lines.findIndex(l => l.trim() === '---')
  contentStart = divider !== -1 ? divider + 1 : 0

  const content = lines.slice(contentStart).join('\n').trim()

  return { title, content, phase, tags }
}

function parseTxt(text: string): Omit<Seed, 'id' | 'createdAt' | 'updatedAt'> {
  const lines = text.split('\n')
  let title = 'Untitled'
  let phase: SeedPhase = 'capture'
  let tags: string[] = []
  let contentStart = 0

  // Title: first non-empty line
  const titleLine = lines.findIndex(l => l.trim())
  if (titleLine !== -1) {
    title = lines[titleLine].trim()
  }

  // Meta block: Phase:, Tags: lines in the header
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    const phaseMatch = l.match(/^Phase:\s*(.+)/i)
    if (phaseMatch) phase = validPhase(phaseMatch[1].trim().toLowerCase())

    const tagsMatch = l.match(/^Tags:\s*(.+)/i)
    if (tagsMatch) {
      const raw = tagsMatch[1].trim()
      if (raw !== '—') {
        tags = raw.split(',').map(t => t.trim()).filter(Boolean)
      }
    }
  }

  // Content: everything after the ─── divider line
  const divider = lines.findIndex(l => /^[─—\-]{10,}$/.test(l.trim()))
  contentStart = divider !== -1 ? divider + 1 : 0

  const content = lines.slice(contentStart).join('\n').trim()

  return { title, content, phase, tags }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type ImportFormat = 'json' | 'md' | 'txt'

export interface ImportResult {
  seed: Seed
  format: ImportFormat
}

export interface ImportError {
  filename: string
  reason: string
}

function detectFormat(filename: string): ImportFormat | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'json') return 'json'
  if (ext === 'md' || ext === 'markdown') return 'md'
  if (ext === 'txt') return 'txt'
  return null
}

export async function importSeedFile(file: File): Promise<ImportResult> {
  const format = detectFormat(file.name)
  if (!format) {
    throw new Error(`Unsupported file type: .${file.name.split('.').pop()}. Use .json, .md, or .txt`)
  }

  const text = await file.text()

  let partial: Omit<Seed, 'id' | 'createdAt' | 'updatedAt'>

  try {
    if (format === 'json') partial = parseJson(text)
    else if (format === 'md') partial = parseMd(text)
    else partial = parseTxt(text)
  } catch (err) {
    throw new Error(
      `Could not parse ${file.name}: ${err instanceof Error ? err.message : 'unknown error'}`
    )
  }

  const seed: Seed = {
    ...partial,
    id: newId(),
    createdAt: now(),
    updatedAt: now(),
  }

  return { seed, format }
}

/** Import multiple files, collecting successes and errors separately. */
export async function importSeedFiles(files: FileList | File[]): Promise<{
  results: ImportResult[]
  errors: ImportError[]
}> {
  const results: ImportResult[] = []
  const errors: ImportError[] = []

  for (const file of Array.from(files)) {
    try {
      const result = await importSeedFile(file)
      results.push(result)
    } catch (err) {
      errors.push({
        filename: file.name,
        reason: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  return { results, errors }
}
