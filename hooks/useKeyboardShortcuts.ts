// hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react'
import { SHORTCUTS, matchesShortcut, ShortcutScope } from '@/lib/keyboard-shortcuts'

interface UseKeyboardShortcutsOptions {
  scope: ShortcutScope
  onAction: (action: string) => void
  enabled?: boolean
}

export function useKeyboardShortcuts({ scope, onAction, enabled = true }: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      // Skip native inputs — but allow CodeMirror's contenteditable through
      const isNativeInput =
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
        !target.closest('.cm-editor')
      if (isNativeInput) return

      for (const shortcut of SHORTCUTS) {
        const scopeMatch = shortcut.scope === 'global' || shortcut.scope === scope
        if (scopeMatch && matchesShortcut(e, shortcut)) {
          e.preventDefault()
          onAction(shortcut.action)
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [scope, onAction, enabled])
}
