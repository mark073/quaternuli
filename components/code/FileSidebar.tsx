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

interface FileSidebarProps {
  onFileSelect?: () => void
}

export default function FileSidebar({ onFileSelect }: FileSidebarProps) {
  const { files, currentFileId, setCurrentFile, createFile, deleteFile } = useStore()

  async function handleNewFile() {
    const name = prompt('File name:', 'untitled.js')
    if (!name) return
    const ext = name.split('.').pop() ?? 'js'
    const lang: CodeLang = EXT_MAP[ext] ?? 'javascript'
    const file = await createFile(name, lang)
    setCurrentFile(file.id)
    onFileSelect?.()
  }

  function handleFileClick(id: string) {
    setCurrentFile(id)
    onFileSelect?.()
  }

  return (
    <div className="w-full md:w-48 flex flex-col flex-shrink-0 overflow-hidden bg-[#0E0E0E] border-r-0 md:border-r-2 border-swiss-black h-full">
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#2a2a2a] flex-shrink-0">
        <span className="font-mono font-bold text-2xs tracking-widest uppercase text-[#444]">Files</span>
        <button
          onClick={handleNewFile}
          className="text-[#444] hover:text-swiss-red text-lg leading-none transition-colors font-mono"
        >
          +
        </button>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto py-2">
        {files.length === 0 ? (
          <p className="px-4 py-6 font-mono text-2xs text-[#333] uppercase tracking-wider text-center">
            No files yet
          </p>
        ) : (
          files.map(file => (
            <div
              key={file.id}
              onClick={() => handleFileClick(file.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 cursor-pointer border-l-2 transition-all group
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
          ))
        )}
      </div>

      {/* Dark fill — absorbs remaining space on mobile so no white void */}
      <div className="flex-shrink-0 pb-2 bg-[#0E0E0E]" />
    </div>
  )
}
