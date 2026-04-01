# QUATERNULI

<p align="center">
  <img src="./docs/images/logo.png" alt="Quaternuli logo" width="120" />
</p>

**A seed notebook for half-formed thoughts — with an AI thinking partner.**

Quaternuli is a dual-mode web app: a **seed notebook** that helps you capture, tend, and harvest ideas through three deliberate phases, and a **code editor** with per-language syntax highlighting. Both modes are powered by a real AI assistant called the **Gardener**, built on Claude (Anthropic).

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org)
[![Powered by Claude](https://img.shields.io/badge/AI-Claude%20by%20Anthropic-E8001D.svg)](https://anthropic.com)

---

## ✨ Features

- **Seed notebook** — capture raw, unfinished thoughts without pressure
- **Three phases** — Capture → Tend → Harvest, with automatic saving
- **The Gardener** — a real Claude AI that reads your seeds and responds with insights, Socratic questions, and suggestions, streaming word by word
- **Code editor** — CodeMirror 6 with syntax highlighting for 8 languages, each with its own colour palette
- **Code Gardener** — AI code review that spots bugs, suggests improvements, and answers questions about your code
- **Export** — harvested seeds export as Markdown, plain text, styled HTML, or JSON
- **Local-first** — all data stored in your browser's IndexedDB, nothing sent to any server except the Gardener's Claude API calls
- **Swiss International Style** — tight grid, Helvetica typography, single red accent

---

## 📸 Demo

> A standalone UI preview (no API key required, Gardener is simulated):
> **[demo.html](https://mark073.github.io/quaternuli/demo.html)** — open in any browser

> Live app (Gardener fully functional):
> **[quaternuli.xyz](https://quaternuli.xyz)** *(coming soon)*

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) v18 or later
- An [Anthropic API key](https://console.anthropic.com) (for the Gardener)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/mark073/quaternuli.git
cd quaternuli

# 2. Install dependencies
npm install

# 3. Add your API key
cp .env.example .env.local
# Open .env.local and set: ANTHROPIC_API_KEY=your_key_here

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — three example seeds are pre-loaded on first launch.

> **Windows users:** see the [full installation guide](./docs/HOW-TO.md#how-to-install) for instructions on creating `.env.local` with Notepad.

---

## 📖 Documentation

| Document | Description |
|---|---|
| [About](./docs/ABOUT.md) | Philosophy, design, privacy |
| [FAQ](./docs/FAQ.md) | Common questions answered |
| [How To](./docs/HOW-TO.md) | Full usage guide including installation |

---

## 🏗️ Architecture

```
quaternuli/
├── app/
│   ├── api/gardener/route.ts   ← Streaming Anthropic API endpoint (SSE)
│   ├── page.tsx                ← Root page
│   └── layout.tsx
├── components/
│   ├── TopBar.tsx
│   ├── notebook/
│   │   ├── SeedSidebar.tsx
│   │   ├── SeedEditor.tsx
│   │   └── GardenerPanel.tsx   ← Real Claude streaming
│   └── code/
│       ├── FileSidebar.tsx
│       ├── CodeEditor.tsx      ← CodeMirror 6
│       └── CodeGardener.tsx    ← Real Claude streaming
├── lib/
│   ├── store.ts                ← Zustand state
│   ├── db.ts                   ← IndexedDB via idb
│   ├── useGardener.ts          ← Streaming hooks
│   ├── gardener-prompt.ts      ← System prompts
│   └── export.ts               ← Export utilities
├── docs/
│   ├── images/
│   │   └── logo.png            ← Quaternuli logo
│   ├── ABOUT.md
│   ├── FAQ.md
│   └── HOW-TO.md
└── .env.example                ← Copy to .env.local
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) + React 19 |
| Language | TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Code editor | [CodeMirror 6](https://codemirror.net) |
| State | [Zustand](https://zustand-demo.pmnd.rs) |
| Storage | [idb](https://github.com/jakearchibald/idb) (IndexedDB) |
| AI | [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript) — `claude-sonnet-4-6` |

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key — get one at [console.anthropic.com](https://console.anthropic.com) |

> ⚠️ Never commit `.env.local` to version control. It is listed in `.gitignore` by default.

---

## 🚢 Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Add `ANTHROPIC_API_KEY` under **Project → Settings → Environment Variables** in the Vercel dashboard.

### Other platforms

Any platform that supports Node.js and Next.js works — Netlify, Railway, Render, or a plain VPS. Run `npm run build && npm start` for a production build.

---

## 🗺️ Roadmap

- [ ] Import seeds from JSON
- [ ] Seed linking and graph view
- [ ] Gardener memory across seeds (multi-turn context)
- [ ] Mobile responsive layout
- [ ] Multi-user / shared seeds
- [ ] Authentication (Clerk / NextAuth)


---

## 🤝 Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgements

- [Anthropic](https://anthropic.com) for Claude
- [CodeMirror](https://codemirror.net) for the editor engine
- [Josef Müller-Brockmann](https://en.wikipedia.org/wiki/Josef_M%C3%BCller-Brockmann) for the grid

---

<p align="center">
  Made with 🌱 by <a href="https://github.com/mark073">mark073</a>
</p>
