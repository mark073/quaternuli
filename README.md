# QUATERNULI

An AI-powered seed notebook + code editor. Capture half-formed thoughts, tend them with real Claude AI, harvest them when ready.

## Stack

- **Next.js 15** App Router + TypeScript
- **`@anthropic-ai/sdk`** — streaming Claude responses via SSE
- **Zustand** — client state
- **IndexedDB (idb)** — persistent storage
- **CodeMirror 6** — real code editor with per-language syntax highlighting
- **Tailwind CSS** — Swiss International grid system

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Add your Anthropic API key
cp .env.example .env.local
# Edit .env.local and set ANTHROPIC_API_KEY=sk-ant-...

# 3. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
app/
  api/gardener/route.ts   ← Streaming Anthropic endpoint (SSE)
  page.tsx                ← Root page, hydrates store
  layout.tsx

components/
  TopBar.tsx              ← Mode switcher (Notebook / Code)
  notebook/
    NotebookView.tsx      ← Layout wrapper
    SeedSidebar.tsx       ← Seed list, search, phase filter
    SeedEditor.tsx        ← Title, content, tags, phase, export
    GardenerPanel.tsx     ← Real Claude streaming (notebook mode)
  code/
    CodeView.tsx          ← Layout wrapper
    FileSidebar.tsx       ← File list, new file, delete
    CodeEditor.tsx        ← CodeMirror 6, per-language themes
    CodeGardener.tsx      ← Real Claude streaming (code mode)

lib/
  types.ts                ← All shared types
  db.ts                   ← IndexedDB via idb
  store.ts                ← Zustand store
  useGardener.ts          ← Streaming hooks (notebook + code)
  gardener-prompt.ts      ← System prompts + message builder
  export.ts               ← MD / TXT / HTML / JSON export
  fixtures.ts             ← Example seeds and files
  nanoid.ts               ← Tiny ID generator
```

## The Gardener API

`POST /api/gardener` — accepts JSON, returns `text/event-stream`.

Request body:
```json
{
  "mode": "notebook" | "code",
  "userMessage": "string",
  "seed": { "title", "content", "phase", "tags" },      // notebook mode
  "allSeedTitles": ["string"],                           // notebook mode
  "file": { "name", "lang", "content" }                 // code mode
}
```

SSE events:
```
data: {"text": "...chunk..."}
data: [DONE]
data: {"error": "...message..."}
```

## Export formats (harvested seeds)

- `.md` — Markdown with frontmatter-style meta
- `.txt` — Plain text with ASCII formatting
- `.html` — Self-contained styled HTML document
- `.json` — Full structured object (re-importable)

## Next steps

- [ ] Authentication (Clerk / NextAuth)
- [ ] Seed linking / graph view
- [ ] Import from JSON
- [ ] Shared seeds (multi-user)
- [ ] Gardener memory across seeds (multi-turn context)
- [ ] Mobile responsive layout
