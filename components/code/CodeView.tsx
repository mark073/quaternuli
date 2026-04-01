'use client'

import FileSidebar from './FileSidebar'
import CodeEditor from './CodeEditor'
import CodeGardener from './CodeGardener'

export default function CodeView() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <FileSidebar />
      <CodeEditor />
      <CodeGardener />
    </div>
  )
}
