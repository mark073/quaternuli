'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { downloadFile } from '@/lib/export'
import type { CodeLang } from '@/lib/types'

// CodeMirror imports
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { syntaxHighlighting, HighlightStyle, indentOnInput, bracketMatching } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { autocompletion, closeBrackets } from '@codemirror/autocomplete'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'

// ── Per-language badge accent colours ────────────────────────────────────────
const LANG_ACCENT: Record<CodeLang, string> = {
  javascript: '#FFCB6B',
  typescript: '#4FC3F7',
  python:     '#A9DC76',
  html:       '#F07178',
  css:        '#89DDFF',
  json:       '#82AAFF',
  markdown:   '#FF5874',
  shell:      '#78DCE8',
}

const LANG_LABELS: Record<CodeLang, string> = {
  javascript: 'JS',
  typescript: 'TS',
  python:     'PY',
  html:       'HTML',
  css:        'CSS',
  json:       'JSON',
  markdown:   'MD',
  shell:      'SH',
}

const LANGS: CodeLang[] = ['javascript','typescript','python','html','css','json','markdown','shell']

function getLangExtension(lang: CodeLang) {
  switch (lang) {
    case 'javascript': return javascript({ jsx: true })
    case 'typescript': return javascript({ typescript: true, jsx: true })
    case 'python':     return python()
    case 'html':       return html()
    case 'css':        return css()
    case 'json':       return json()
    case 'markdown':   return markdown()
    default:           return []
  }
}

// ── Bright syntax highlight style — high contrast on dark background ──────────
const brightSyntax = HighlightStyle.define([
  // Comments — medium grey, italic, clearly readable
  { tag: tags.comment,              color: '#8a9ab0', fontStyle: 'italic' },
  // Keywords — bright purple/pink
  { tag: tags.keyword,              color: '#e070f0', fontWeight: 'bold' },
  { tag: tags.controlKeyword,       color: '#e070f0', fontWeight: 'bold' },
  { tag: tags.definitionKeyword,    color: '#e070f0', fontWeight: 'bold' },
  { tag: tags.moduleKeyword,        color: '#e070f0', fontWeight: 'bold' },
  // Strings — bright green
  { tag: tags.string,               color: '#98e06a' },
  { tag: tags.special(tags.string), color: '#98e06a' },
  // Numbers — bright orange
  { tag: tags.number,               color: '#ffaa44' },
  { tag: tags.bool,                 color: '#ff6e8a', fontWeight: 'bold' },
  { tag: tags.null,                 color: '#ff6e8a' },
  // Function names — bright blue
  { tag: tags.function(tags.variableName), color: '#79c0ff' },
  { tag: tags.function(tags.propertyName), color: '#79c0ff' },
  // Type names / class names — bright cyan/teal
  { tag: tags.typeName,             color: '#56d4dd' },
  { tag: tags.className,            color: '#56d4dd' },
  // Variable names — light grey-white
  { tag: tags.variableName,         color: '#e2e8f0' },
  { tag: tags.propertyName,         color: '#c8d4e8' },
  // Operators — bright cyan
  { tag: tags.operator,             color: '#60d8f0' },
  { tag: tags.punctuation,          color: '#c8d4e8' },
  // Decorators — bright orange
  { tag: tags.annotation,           color: '#ffb347' },
  { tag: tags.meta,                 color: '#ffb347' },
  // HTML/XML tags — bright coral
  { tag: tags.tagName,              color: '#ff8c94' },
  { tag: tags.attributeName,        color: '#ffda6a' },
  { tag: tags.attributeValue,       color: '#98e06a' },
  // CSS
  { tag: tags.atom,                 color: '#ffaa44' },
  // Headings (markdown)
  { tag: tags.heading,              color: '#ff6e8a', fontWeight: 'bold' },
  { tag: tags.heading1,             color: '#ff5874', fontWeight: 'bold' },
  { tag: tags.heading2,             color: '#ff7a8a', fontWeight: 'bold' },
  // Links
  { tag: tags.url,                  color: '#79c0ff' },
  // Strong / emphasis
  { tag: tags.strong,               color: '#ffffff', fontWeight: 'bold' },
  { tag: tags.emphasis,             color: '#98e06a', fontStyle: 'italic' },
])

// ── Base editor theme (layout, background, gutter) ───────────────────────────
const baseTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontFamily: '"JetBrains Mono", "Courier New", monospace',
    fontSize: '13px',
    background: '#111 !important',
  },
  '.cm-scroller':  { fontFamily: '"JetBrains Mono", "Courier New", monospace' },
  '.cm-content':   { caretColor: '#aeafad', padding: '16px 0', color: '#e2e8f0' },
  '.cm-line':      { padding: '0 24px' },
  '.cm-gutters':   {
    background: '#111 !important',
    borderRight: '1px solid #1d1d1d',
    color: '#4a5568',
    minWidth: '48px',
  },
  '.cm-activeLineGutter': { background: '#1a1a1a', color: '#718096' },
  '.cm-activeLine':       { background: '#1a1a1a' },
  '.cm-cursor':           { borderLeftColor: '#aeafad' },
  '.cm-selectionBackground, ::selection': { background: 'rgba(100,120,200,0.3) !important' },
  // Make sure oneDark background doesn't bleed in
  '.cm-editor':    { background: '#111 !important' },
})

export default function CodeEditor() {
  const { files, currentFileId, updateFile } = useStore()
  const file = files.find(f => f.id === currentFileId) ?? null

  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const updateTimer = useRef<NodeJS.Timeout | undefined>(undefined)
  const suppressUpdate = useRef(false)

  const buildExtensions = useCallback((lang: CodeLang) => [
    lineNumbers(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    history(),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
    baseTheme,
    syntaxHighlighting(brightSyntax),
    getLangExtension(lang),
    EditorView.updateListener.of(update => {
      if (!update.docChanged || suppressUpdate.current) return
      const content = update.state.doc.toString()
      clearTimeout(updateTimer.current)
      updateTimer.current = setTimeout(() => {
        if (currentFileId) updateFile(currentFileId, { content })
      }, 400)
    }),
    EditorView.lineWrapping,
  ], [currentFileId, updateFile])

  useEffect(() => {
    if (!editorRef.current) return
    if (viewRef.current) {
      viewRef.current.destroy()
      viewRef.current = null
    }
    if (!file) return

    const state = EditorState.create({
      doc: file.content,
      extensions: buildExtensions(file.lang),
    })

    viewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    })

    return () => {
      clearTimeout(updateTimer.current)
      viewRef.current?.destroy()
      viewRef.current = null
    }
  }, [file?.id, file?.lang]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!viewRef.current || !file) return
    const current = viewRef.current.state.doc.toString()
    if (current !== file.content) {
      suppressUpdate.current = true
      viewRef.current.dispatch({
        changes: { from: 0, to: current.length, insert: file.content },
      })
      suppressUpdate.current = false
    }
  }, [file?.content]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!file) {
    return (
      <div className="flex-1 bg-[#111] flex items-center justify-center">
        <p className="font-mono text-2xs tracking-widest text-[#333] uppercase">No file open</p>
      </div>
    )
  }

  const accent = LANG_ACCENT[file.lang]

  return (
    <div className="flex-1 flex flex-col bg-[#111] overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center gap-3 px-5 h-10 border-b border-[#1d1d1d] flex-shrink-0">
        <span className="font-mono text-sm text-[#ccc]">{file.name}</span>
        <span
          className="font-mono font-bold text-2xs px-2 py-0.5 tracking-widest"
          style={{ color: accent, border: `1px solid ${accent}33` }}
        >
          {LANG_LABELS[file.lang]}
        </span>
        <select
          value={file.lang}
          onChange={e => updateFile(file.id, { lang: e.target.value as CodeLang })}
          className="font-mono text-2xs bg-transparent border border-[#2a2a2a] text-[#888] px-2 py-1 outline-none cursor-pointer ml-1"
        >
          {LANGS.map(l => (
            <option key={l} value={l} className="bg-[#1a1a1a]">
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={() => downloadFile(file.name, file.content)}
          className="ml-auto font-mono text-2xs tracking-wider uppercase text-[#888] border border-[#2a2a2a] px-3 py-1 hover:bg-swiss-red hover:text-white hover:border-swiss-red transition-all"
        >
          ↓ Download
        </button>
      </div>

      {/* Editor */}
      <div ref={editorRef} className="flex-1 overflow-hidden" />

      {/* Status bar */}
      <div className="flex items-center gap-6 px-5 h-7 border-t border-[#1d1d1d] font-mono text-2xs text-[#444] flex-shrink-0">
        <span style={{ color: accent }}>{file.lang}</span>
        <span>{file.content.split('\n').length} lines</span>
        <span>{file.content.length} chars</span>
        <span className="ml-auto text-[#333]">{new Date(file.updatedAt).toLocaleTimeString()}</span>
      </div>
    </div>
  )
}
