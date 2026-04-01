# How To Use Quaternuli

---

## Table of Contents

- [How to Install](#how-to-install)
- [Getting Started](#getting-started)
- [Working with Seeds](#working-with-seeds)
- [Exporting a Harvested Seed](#exporting-a-harvested-seed)
- [Using the Gardener — Notebook](#using-the-gardener--notebook)
- [Using the Code Editor](#using-the-code-editor)
- [Using the Gardener — Code](#using-the-gardener--code)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Tips & Best Practices](#tips--best-practices)

---

## How to Install

### Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** v18 or later — download from [nodejs.org](https://nodejs.org) (LTS version recommended)
- **npm** — comes bundled with Node.js
- An **Anthropic API key** — get one at [console.anthropic.com](https://console.anthropic.com)

To verify your Node.js and npm installation, run:

```bash
node -v
npm -v
```

Both commands should return a version number.

---

### Step 1 — Get the files

**Option A: Clone from GitHub**

```bash
git clone https://github.com/your-username/quaternuli.git
cd quaternuli
```

**Option B: Download the archive**

Download the `.tar.gz` or `.zip` file, extract it, and open a terminal in the extracted folder:

```bash
# macOS / Linux
cd /path/to/quaternuli

# Windows (PowerShell)
cd C:\quaternuli
```

---

### Step 2 — Add your Anthropic API key

The Gardener requires an API key to connect to Claude. Create a `.env.local` file in the project root:

**macOS / Linux:**

```bash
cp .env.example .env.local
```

Then open `.env.local` in any text editor and replace the placeholder:

```
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

**Windows (Notepad):**

1. Open Notepad
2. Type: `ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here`
3. Go to **File → Save As**
4. Navigate to your `quaternuli` folder
5. Set **Save as type** to **All Files (\*.\*)**
6. Type `.env.local` as the filename
7. Click **Save**

> ⚠️ Never commit `.env.local` to version control. It is already listed in `.gitignore`.

---

### Step 3 — Install dependencies

```bash
npm install
```

This downloads all required packages into a `node_modules` folder. It may take a minute or two on the first run.

---

### Step 4 — Start the development server

```bash
npm run dev
```

Open your browser and go to:

```
http://localhost:3000
```

Quaternuli should be running. Three example seeds are pre-loaded on the first launch.

---

### Production build (optional)

To run a production-optimised build:

```bash
npm run build
npm start
```

---

### Deploying to Vercel (optional)

Quaternuli is a standard Next.js app and deploys to Vercel in one step:

```bash
npm install -g vercel
vercel
```

Add your `ANTHROPIC_API_KEY` as an environment variable in the Vercel dashboard under **Project → Settings → Environment Variables**.

---

## Getting Started

When you first open Quaternuli you will see the **Notebook** mode with three example seeds already planted. These show you what the app looks like in use — feel free to edit or delete them.

The app has two modes, toggled from the top bar:

- **Notebook** — for capturing and developing ideas
- **Code** — for writing and reviewing code

---

## Working with Seeds

### Creating a seed

1. Click **+ New Seed** at the bottom of the left sidebar.
2. A blank seed opens in the editor. Give it a title and start writing.
3. Everything saves automatically as you type — there is no save button.

### Writing in a seed

Click anywhere in the large text area and write freely. There is no required format. The seed can be a sentence, a list, a half-paragraph, or a full essay. The Gardener works with whatever you give it.

### Adding tags

1. Click in the tag field below the title bar.
2. Type a tag and press `Enter` or `,` to add it.
3. Press `Backspace` in an empty tag field to remove the last tag.

### Changing the phase

Use the dropdown in the top right of the editor:

- **Capture** — the raw input phase (default)
- **Tend** — the active development phase
- **Harvest** — ready to export

Changes save instantly.

### Searching and filtering seeds

- Type in the **search box** at the top of the sidebar — it searches titles, content, and tags simultaneously.
- Use the **phase buttons** (`All` / `Cap` / `Tend` / `Harv`) to filter by phase.

### Deleting a seed

Click the **Delete** button in the editor header. Confirm when prompted. Deletion is permanent.

---

## Exporting a Harvested Seed

Once a seed is in the **Harvest** phase, a black bar appears at the bottom of the editor.

1. Click **Export** to download as Markdown immediately.
2. Click the **▾** arrow next to Export to choose a different format.

Available formats:

| Format | Extension | Notes |
|---|---|---|
| Markdown | `.md` | Clean, portable — works in Obsidian, Notion, GitHub |
| Plain Text | `.txt` | No markup — paste anywhere |
| Styled HTML | `.html` | Self-contained document — open in any browser |
| JSON | `.json` | Full structured data — re-importable, good for backups |

> **Tip:** Export important seeds as JSON periodically. Browser storage can be cleared accidentally and there is no cloud sync.

---

## Using the Gardener — Notebook

The Gardener panel is on the right side of the notebook view.

### Automatic analysis

When you open a seed that has content, the Gardener automatically reads it and gives you an initial observation after a short delay. You don't need to ask.

### Asking a question

1. Type in the input field at the bottom of the Gardener panel.
2. Press `Enter` or click **→** to send.
3. The response streams in word by word as Claude generates it.

### Understanding response types

| Label | Meaning |
|---|---|
| **Insight** | An observation about your idea |
| **Question** | A Socratic prompt to develop your thinking |
| **Suggestion** | A concrete next action to take with the seed |
| **Connection** | A link to another seed or idea |

### Tips for good Gardener interactions

- The more content in your seed, the more specific the Gardener can be.
- Ask direct questions: `"What's weak about this argument?"` works better than `"What do you think?"`
- If you want a phase suggestion, ask: `"Is this ready to harvest?"`
- The Gardener sees all your other seed titles — ask `"Does this connect to anything else I've written?"` to surface connections.

---

## Using the Code Editor

### Switching to Code mode

Click **Code** in the top bar. Your seeds are preserved — switching mode just changes the view.

### Creating a file

1. Click the **+** button at the top of the file sidebar.
2. Enter a filename with an extension, e.g. `main.js`, `script.py`, `styles.css`.
3. The language is detected automatically from the extension.

### Supported file extensions

| Extension | Language |
|---|---|
| `.js` | JavaScript |
| `.ts`, `.tsx` | TypeScript |
| `.py` | Python |
| `.html` | HTML |
| `.css` | CSS |
| `.json` | JSON |
| `.md` | Markdown |
| `.sh` | Shell |

### Editor features

- Syntax highlighting per language (each language has its own colour theme)
- Line numbers
- Tab indentation (2 spaces)
- Bracket matching and auto-closing
- Undo / redo
- Find in file (`Ctrl+F`)

### Switching language

Use the language dropdown in the editor toolbar to change the language of the current file. Syntax highlighting updates immediately.

### Downloading a file

Click **↓ Download** in the editor toolbar. The file downloads with its correct filename and extension.

### Deleting a file

Hover over the file in the sidebar — an **×** button appears on the right. Click it to delete. There is no confirmation prompt, so be careful.

---

## Using the Gardener — Code

The Code Gardener panel is on the right side of the code view. It works the same way as the Notebook Gardener but is focused on code review.

### Automatic review

When you open a file with content, the Gardener automatically gives you an initial review after a short delay.

### Asking about your code

Type a question in the input field and press `Enter`. Examples:

- `"Is there a bug in the loop on line 14?"`
- `"How would you refactor the fetchUser function?"`
- `"Is this approach thread-safe?"`
- `"What would make this more readable?"`

### Understanding response types

| Label | Meaning |
|---|---|
| **Tip** | A general improvement suggestion |
| **Review** | An overall assessment of structure or quality |
| **Issue** | A potential bug or problem to investigate |
| **Question** | A clarifying question about your intent |

---

## Keyboard Shortcuts

### Notebook

| Key | Action |
|---|---|
| `Enter` or `,` in tag field | Add tag |
| `Backspace` in empty tag field | Remove last tag |
| `Enter` in Gardener input | Send message |

### Code Editor

| Key | Action |
|---|---|
| `Tab` | Indent 2 spaces |
| `Shift+Tab` | Outdent |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |
| `Ctrl+F` | Find in file |
| `Ctrl+/` | Toggle comment |
| `Enter` in Gardener input | Send message |

---

## Tips & Best Practices

- **Don't wait** until an idea is fully formed to capture it. The Capture phase exists precisely for fragments and hunches.
- **Use tags consistently.** A tag like `philosophy` across multiple seeds lets you filter and see patterns in your thinking.
- **Move seeds to Tend** when you're ready to work on them deliberately, not just when they feel "done enough."
- **Export important seeds to JSON** periodically as a backup. Browser storage can be cleared accidentally.
- **The Gardener works best** when your seed has at least a few sentences. A single word gives it very little to work with.
- **In code mode**, paste in code you're reviewing or debugging — not just code you wrote. The Gardener is a good second pair of eyes.
- **Ask the Gardener for a phase recommendation** — it will tell you honestly if a seed isn't ready to harvest yet.
