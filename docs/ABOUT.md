# About Quaternuli

> A seed notebook for people who think in half-formed ideas.

---

## The Idea

Most note-taking apps are filing systems. You put something in, it stays exactly as you left it. Quaternuli works differently — it's a garden. You plant a raw thought, tend it over time, and harvest it when it's ready to become something real.

Good thinking rarely arrives fully formed. It starts as a fragment — a hunch, a question, a sentence that doesn't quite make sense yet. Most tools have no place for this. They expect you to already know what you think.

Quaternuli is built around the opposite assumption: that the messy, unfinished thought is valuable, and worth caring for.

---

## The Three Phases

### 🌱 Capture
The raw phase. Drop a thought before it disappears. No pressure to be clear, complete, or correct. Just get it in.

### 🌿 Tend
The shaping phase. Return to the seed, develop it, ask harder questions, connect it to other ideas. The Gardener helps here.

### 🌾 Harvest
The output phase. The seed is ready. Export it as Markdown, plain text, HTML, or JSON and use it in the world.

---

## The Gardener

The Gardener is an AI thinking partner powered by **Claude** (Anthropic). It reads your seed and responds with observations, Socratic questions, connections to other seeds, and suggestions for development.

It is not a chatbot. It doesn't have a conversation with you about the weather. It has one job: to help your ideas grow.

> **Note:** The Gardener requires an Anthropic API key stored in your `.env.local` file. Each response uses a small number of tokens — a typical session costs well under $0.01.

---

## The Code Editor

Quaternuli has a second mode for developers: a full code editor powered by **CodeMirror 6**, with syntax highlighting for:

- JavaScript / TypeScript
- Python
- HTML / CSS
- JSON
- Markdown
- Shell

The Gardener works here too — as a code reviewer that spots bugs, suggests improvements, and answers questions about your code. Each language has its own colour palette.

---

## Design

Quaternuli is designed in the **Swiss International Style** — tight grid, Helvetica typography, a single red accent colour. The aesthetic is intentional: clarity enforces thinking. A cluttered interface is a cluttered mind.

---

## Privacy

Your seeds and code files are stored locally in your browser's **IndexedDB**. They never leave your machine except when you explicitly send a seed or file to the Gardener for analysis.

The Gardener calls the Anthropic API — Anthropic's privacy policy applies to those interactions. No other data is transmitted anywhere.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Editor | CodeMirror 6 |
| State | Zustand |
| Storage | IndexedDB via `idb` |
| AI | Anthropic SDK (`claude-sonnet-4-6`) |

---

## License

MIT — see [LICENSE](./LICENSE) for details.
