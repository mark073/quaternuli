'use client'

import { useStore } from '@/lib/store'
import type { CodeLang } from '@/lib/types'

const LANG_ICONS: Record<CodeLang, string> = {
  javascript: '🟨',
  typescript: '🔷',
  python:     '🐍',
  html:       '🌐',
  css:        '🎨',
  json:       '📋',
  markdown:   '📝',
  shell:      '⬛',
}

const EXT_MAP: Record<string, CodeLang> = {
  js: 'javascript', ts: 'typescript', tsx: 'typescript', jsx: 'javascript',
  py: 'python', html: 'html', css: 'css', json: 'json', md: 'markdown', sh: 'shell',
}

export default function FileSidebar() {
  const { files, currentFileId, setCurrentFile, createFile, deleteFile } = useStore()

  async function handleNewFile() {
    const name = prompt('File name:', 'untitled.js')
    if (!name) return
    const ext = name.split('.').pop() ?? 'js'
    const lang: CodeLang = EXT_MAP[ext] ?? 'javascript'
    const file = await createFile(name, lang)
    setCurrentFile(file.id)
  }

  return (
    <div className="w-48 border-r-2 border-swiss-black flex flex-col flex-shrink-0 overflow-hidden bg-[#0E0E0E]">
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#2a2a2a]">
        <span className="font-mono font-bold text-2xs tracking-widest uppercase text-[#444]">Files</span>
        <button
          onClick={handleNewFile}
          className="text-[#444] hover:text-swiss-red text-lg leading-none transition-colors font-mono"
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {files.map(file => (
          <div
            key={file.id}
            onClick={() => setCurrentFile(file.id)}
            className={`flex items-center gap-2 px-3.5 py-2 cursor-pointer border-l-2 transition-all group
              ${file.id === currentFileId
                ? 'bg-[#1a1a1a] text-[#eee] border-l-swiss-red'
                : 'text-[#777] border-l-transparent hover:bg-[#1a1a1a] hover:text-[#bbb]'}`}
          >
            <span className="text-xs flex-shrink-0">{LANG_ICONS[file.lang]}</span>
            <span className="font-mono text-xs truncate flex-1">{file.name}</span>
            <button
              onClick={e => { e.stopPropagation(); deleteFile(file.id) }}
              className="opacity-0 group-hover:opacity-100 text-[#444] hover:text-swiss-red font-mono text-sm leading-none transition-all"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
