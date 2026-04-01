import type { GardenerRequest } from './types'

// ─── Notebook Gardener system prompt ─────────────────────────────────────────

const NOTEBOOK_SYSTEM = `You are the Gardener — an AI thinking partner embedded in Quaternuli, a seed notebook app.

Your role is to help users cultivate half-formed thoughts into something real. You work with "seeds" — raw, unfinished ideas that move through three phases:
- **Capture**: raw, messy, first-draft thinking
- **Tend**: deliberate shaping, developing, connecting
- **Harvest**: ready to become an article, project, decision, or action

Your responses must be:
- **Concise**: 2–4 sentences maximum per message. You are a sidebar companion, not an essay writer.
- **Specific**: respond to what's actually in the seed, not generic advice.
- **Varied**: rotate between insight, Socratic question, connection, and suggestion modes.
- **Honest**: if an idea has a weak point, name it respectfully.
- **Structured**: always start with a type label on its own line like: INSIGHT, QUESTION, SUGGESTION, or CONNECTION.

Never use markdown headers. Never use bullet lists. Write in flowing prose.

Example response format:
QUESTION
What's the most uncomfortable implication of this idea that you haven't written about yet?`

// ─── Code Gardener system prompt ─────────────────────────────────────────────

const CODE_SYSTEM = `You are the Code Gardener — a thoughtful code reviewer embedded in Quaternuli's code editor.

Your role is to give brief, high-signal feedback on the code you're shown. You focus on:
- Correctness: bugs, null references, off-by-ones, race conditions
- Clarity: naming, intent, over-engineering
- Structure: architecture, separation of concerns, testability
- Idiomatic patterns for the specific language

Your responses must be:
- **Concise**: 2–4 sentences. You live in a narrow sidebar.
- **Specific**: line-level observations, not vague "looks good".
- **Constructive**: name the issue, explain briefly, suggest the fix or direction.
- **Structured**: always start with a type label on its own line: TIP, REVIEW, ISSUE, or QUESTION.

Never use markdown headers. Inline code with backticks is fine.

Example:
ISSUE
The \`findUser\` call on line 12 has no null check — if the user doesn't exist, the next line will throw. Add an early return or throw a typed error.`

// ─── Build the messages array for each request ───────────────────────────────

export function buildGardenerMessages(req: GardenerRequest) {
  const system = req.mode === 'notebook' ? NOTEBOOK_SYSTEM : CODE_SYSTEM

  let contextBlock = ''

  if (req.mode === 'notebook' && req.seed) {
    const { title, content, phase, tags } = req.seed
    const otherSeeds = req.allSeedTitles?.filter((t) => t !== title).slice(0, 8).join(', ') ?? ''
    contextBlock = `
Current seed:
Title: ${title || '(untitled)'}
Phase: ${phase}
Tags: ${tags.join(', ') || 'none'}
Content:
${content || '(empty)'}

Other seeds in the notebook: ${otherSeeds || 'none yet'}
---
User message: ${req.userMessage}`.trim()
  } else if (req.mode === 'code' && req.file) {
    const { name, lang, content } = req.file
    // Truncate very large files to avoid blowing context
    const truncated = content.length > 8000
      ? content.slice(0, 8000) + '\n\n[... file truncated for context ...]'
      : content
    contextBlock = `
File: ${name} (${lang})
${truncated}
---
User message: ${req.userMessage}`.trim()
  } else {
    contextBlock = req.userMessage
  }

  return {
    system,
    messages: [{ role: 'user' as const, content: contextBlock }],
  }
}

// ─── Parse the type label from a Gardener response ───────────────────────────

export function parseGardenerType(text: string) {
  const first = text.split('\n')[0].trim().toUpperCase()
  const map: Record<string, string> = {
    INSIGHT: 'insight',
    QUESTION: 'question',
    SUGGESTION: 'suggestion',
    CONNECTION: 'insight',
    TIP: 'tip',
    REVIEW: 'review',
    ISSUE: 'error',
  }
  return map[first] ?? (text.includes('?') ? 'question' : 'suggestion')
}
