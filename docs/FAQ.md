# Frequently Asked Questions

---

## General

**What is Quaternuli?**
A seed notebook and code editor with an AI thinking partner called the Gardener. You capture raw ideas, tend them over time, and harvest them when they're ready to become something real.

**Who is it for?**
Anyone who thinks in fragments — writers, developers, researchers, strategists, students. If you've ever lost a half-formed idea because you had nowhere good to put it, Quaternuli is for you.

**Is it free?**
Quaternuli itself is free and open source. The Gardener uses the Anthropic API, which requires your own API key and is billed by Anthropic based on usage. For typical use the cost is very small — fractions of a cent per message.

**Do I need an account?**
No. There are no accounts, no login, no cloud sync. Everything lives locally in your browser.

---

## The Gardener

**What is the Gardener?**
An AI assistant powered by Claude (Anthropic's `claude-sonnet-4-6` model). It reads your current seed or code file and gives focused, concise feedback — observations, questions, suggestions, or code review.

**Why does the Gardener need an API key?**
The Gardener calls Anthropic's API to generate responses. You provide your own key so you're in direct control of usage and billing. Your key is stored only in your local `.env.local` file and is never shared or transmitted.

**Where do I get an Anthropic API key?**
Sign up at [console.anthropic.com](https://console.anthropic.com), go to **API Keys**, and create a new key.

**Does the Gardener remember previous conversations?**
Within a session it sees the full conversation history for the current seed or file. It does not retain memory between sessions or across different seeds.

**Can I use the Gardener without an API key?**
No. Without a valid `ANTHROPIC_API_KEY` in your `.env.local` file the Gardener will return an authentication error.

**How much does the Gardener cost to use?**
Each Gardener message uses a small number of tokens. At current Anthropic pricing a typical session costs well under $0.01. You can monitor usage at [console.anthropic.com](https://console.anthropic.com).

---

## Seeds

**What is a seed?**
A seed is a note — but specifically a half-formed, evolving one. It has a title, body text, tags, and a phase (Capture, Tend, or Harvest).

**What are the three phases?**

| Phase | Purpose |
|---|---|
| **Capture** | Raw input — no polish required |
| **Tend** | Active development — the Gardener helps here |
| **Harvest** | Ready to export and use in the world |

**How do I move a seed between phases?**
Use the phase selector dropdown in the top right of the seed editor. Changes save automatically.

**Can I delete a seed?**
Yes. Click the **Delete** button in the seed editor header. You will be asked to confirm before the seed is permanently removed.

**What export formats are available for harvested seeds?**

| Format | Extension | Best for |
|---|---|---|
| Markdown | `.md` | Obsidian, Notion, GitHub |
| Plain Text | `.txt` | Pasting anywhere |
| Styled HTML | `.html` | Sharing as a document |
| JSON | `.json` | Re-importing, backups |

---

## Data & Storage

**Where is my data stored?**
In your browser's IndexedDB — a local database built into every modern browser. Your data never leaves your machine automatically.

**Will my seeds survive if I close the browser?**
Yes. IndexedDB persists between sessions just like a local file.

**What if I clear my browser data?**
Clearing site data or browser storage will delete your seeds and files. Export important seeds as JSON before clearing browser data.

**Can I use Quaternuli on multiple devices?**
Not currently. There is no sync. Each browser or device has its own local database. Export JSON from one device and import on another (import feature coming in a future version).

**Is my data sent to any server?**
Only the content of the seed or file you are currently working on is sent to Anthropic's API when you use the Gardener. Nothing else is transmitted.

---

## Code Editor

**What languages does the code editor support?**
JavaScript, TypeScript, Python, HTML, CSS, JSON, Markdown, and Shell.

**Does the code editor run code?**
No. It is an editor only — there is no execution environment.

**Can I save files to my computer from the code editor?**
Yes. Click the **↓ Download** button in the editor toolbar to download the current file with its correct name and extension.

**Does the Code Gardener know what language I'm using?**
Yes. The language is passed as context with every request, so the Gardener tailors its review accordingly.

---

## Technical

**What is Quaternuli built with?**
Next.js 15, React 19, TypeScript, Tailwind CSS, CodeMirror 6, Zustand, IndexedDB via `idb`, and the Anthropic TypeScript SDK.

**Does it work offline?**
The UI works fully offline. The Gardener requires an internet connection to reach the Anthropic API.

**What browsers are supported?**
Any modern browser — Chrome, Firefox, Edge, Safari. IndexedDB and the Web Streams API (used for streaming) are supported in all of them.

**Can I self-host Quaternuli?**
Yes. It's a standard Next.js app. Run `npm run build && npm start` for a production build, or deploy to Vercel, Netlify, or any Node.js host. See the [How To](./HOW-TO.md) guide for full instructions.
