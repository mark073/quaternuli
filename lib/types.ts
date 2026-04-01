// ─── Core domain types ────────────────────────────────────────────────────────

export type SeedPhase = 'capture' | 'tend' | 'harvest'

export interface Seed {
  id: string
  title: string
  content: string
  phase: SeedPhase
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CodeFile {
  id: string
  name: string
  lang: CodeLang
  content: string
  createdAt: string
  updatedAt: string
}

export type CodeLang =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'shell'

// ─── Gardener types ───────────────────────────────────────────────────────────

export type GardenerMode = 'notebook' | 'code'

export type GardenerMessageRole = 'gardener' | 'user'

export type GardenerMessageType =
  | 'insight'
  | 'suggestion'
  | 'question'
  | 'tip'
  | 'review'
  | 'error'
  | 'welcome'
  | 'user'

export interface GardenerMessage {
  id: string
  role: GardenerMessageRole
  type: GardenerMessageType
  content: string
  streaming?: boolean  // true while Claude is still writing
  createdAt: string
}

// ─── API types ────────────────────────────────────────────────────────────────

export interface GardenerRequest {
  mode: GardenerMode
  userMessage: string
  // Notebook context
  seed?: Pick<Seed, 'title' | 'content' | 'phase' | 'tags'>
  allSeedTitles?: string[]
  // Code context
  file?: Pick<CodeFile, 'name' | 'lang' | 'content'>
}

export type AppMode = 'notebook' | 'code'
