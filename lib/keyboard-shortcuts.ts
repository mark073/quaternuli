// lib/keyboard-shortcuts.ts
// Central keyboard shortcut registry for Quaternuli.
// Mod = Cmd on Mac, Ctrl on Windows/Linux.

export type ShortcutScope = 'global' | 'notebook' | 'code'

export interface ShortcutDef {
  key: string
  mod: boolean
  shift?: boolean
  scope: ShortcutScope
  description: string
  action: string
}

export const SHORTCUTS: ShortcutDef[] = [
  // Phase switching — notebook only
  { key: '1', mod: true, scope: 'notebook', description: 'Switch to Capture', action: 'phase:capture' },
  { key: '2', mod: true, scope: 'notebook', description: 'Switch to Tend',    action: 'phase:tend'    },
  { key: '3', mod: true, scope: 'notebook', description: 'Switch to Harvest', action: 'phase:harvest' },

  // Seed actions — notebook only
  { key: 'n', mod: true,               scope: 'notebook', description: 'New seed',          action: 'seed:new'    },
  { key: 's', mod: true,               scope: 'notebook', description: 'Save current seed',  action: 'seed:save'   },
  { key: 'e', mod: true, shift: true,  scope: 'notebook', description: 'Open export modal',  action: 'seed:export' },

  // Gardener — global
  { key: 'g', mod: true, scope: 'global', description: 'Focus Gardener input', action: 'gardener:trigger' },
]

export function matchesShortcut(e: KeyboardEvent, s: ShortcutDef): boolean {
  const mod = e.metaKey || e.ctrlKey
  return (
    mod === s.mod &&
    (s.shift ? e.shiftKey : !e.shiftKey) &&
    e.key.toLowerCase() === s.key.toLowerCase()
  )
}
