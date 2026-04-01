'use client'

import SeedSidebar from './SeedSidebar'
import SeedEditor from './SeedEditor'
import GardenerPanel from './GardenerPanel'

export default function NotebookView() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <SeedSidebar />
      <SeedEditor />
      <GardenerPanel />
    </div>
  )
}
