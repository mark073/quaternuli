import type { CodeLang, SeedPhase } from './types'

export const seedFixtures: Array<{
  title: string; content: string; phase: SeedPhase; tags: string[]
}> = [
  {
    title: 'The compounding nature of small rituals',
    phase: 'capture',
    tags: ['philosophy', 'habit'],
    content: `What if productivity isn't about doing more but about repeating tiny acts until they become invisible infrastructure? Morning pages. Cold water. One sentence before bed.

The interesting thing: none of these are valuable alone. The value is in the compounding — the way repetition turns a conscious act into a reflex, and a reflex into an identity.`,
  },
  {
    title: 'Quaternuli product vision',
    phase: 'tend',
    tags: ['product', 'vision'],
    content: `A notebook that grows with you. Not just storage — cultivation. Seeds are half-formed thoughts. The Gardener tends them. Harvest is when they're ready to become something real.

Key insight: most note apps are filing systems. This should feel like a garden.

The Capture → Tend → Harvest flow mirrors how good thinking actually works: messy input, deliberate shaping, clean output. Most tools only handle one of these.`,
  },
  {
    title: 'Swiss grid as cognitive model',
    phase: 'harvest',
    tags: ['design', 'typography', 'philosophy'],
    content: `The Swiss International Style isn't just aesthetic — it's epistemic. The grid enforces hierarchy. Forces you to know what matters most before you design. Maybe all thinking should start with a grid.

Müller-Brockmann said the grid is not a cage but a framework for freedom. Apply to thought architecture: constraints that generate rather than limit.

The parallel with code: a good type system is a grid for your data. It forces you to be explicit about shape before you can be creative about logic.`,
  },
]

export const fileFixtures: Array<{
  name: string; lang: CodeLang; content: string
}> = [
  {
    name: 'seed-processor.js',
    lang: 'javascript',
    content: `// Quaternuli seed processor
// Transforms raw thoughts into structured output

const seeds = [];

function plantSeed(content, tags = []) {
  const seed = {
    id: crypto.randomUUID(),
    content,
    tags,
    phase: 'capture',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  seeds.push(seed);
  return seed;
}

function tendSeed(id, updates) {
  const seed = seeds.find(s => s.id === id);
  if (!seed) throw new Error(\`Seed \${id} not found\`);
  Object.assign(seed, updates, { updatedAt: new Date().toISOString() });
  return seed;
}

function harvestSeed(id) {
  const seed = seeds.find(s => s.id === id);
  if (!seed) throw new Error(\`Seed \${id} not found\`);
  if (seed.phase !== 'harvest') throw new Error('Seed not ready');
  return {
    title: seed.content.split('\\n')[0],
    body: seed.content,
    tags: seed.tags,
    exportedAt: new Date().toISOString(),
  };
}

const mySeed = plantSeed(
  'What if every API was designed\\nlike a conversation, not a contract?',
  ['api', 'design', 'philosophy']
);

console.log('Seed planted:', mySeed.id);
`,
  },
  {
    name: 'gardener.py',
    lang: 'python',
    content: `# Gardener — AI thought cultivator
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional
import re

@dataclass
class Seed:
    id: str
    content: str
    phase: str = 'capture'
    tags: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    maturity_score: float = 0.0

class Gardener:
    """The AI gardener that tends your thought seeds."""

    INSIGHT_PATTERNS = [
        r'what if', r'maybe', r'i wonder',
        r'the key insight', r'pattern:',
    ]

    def assess_maturity(self, seed: Seed) -> float:
        score = 0.0
        word_count = len(seed.content.split())
        score += min(word_count / 200, 0.3)

        has_insight = any(
            re.search(p, seed.content.lower())
            for p in self.INSIGHT_PATTERNS
        )
        if has_insight:
            score += 0.2

        score += min(len(seed.tags) * 0.1, 0.2)
        if '\\n' in seed.content:
            score += 0.15

        return min(score, 1.0)

    def suggest_phase(self, seed: Seed) -> str:
        maturity = self.assess_maturity(seed)
        if maturity >= 0.7:
            return 'harvest'
        elif maturity >= 0.3:
            return 'tend'
        return 'capture'

    def generate_question(self, seed: Seed) -> Optional[str]:
        questions = [
            "What's the most surprising implication of this?",
            "If this were true, what would have to change?",
            "What's the strongest objection to this idea?",
            "Who else has thought about this, and differently?",
        ]
        idx = len(seed.content) % len(questions)
        return questions[idx]


gardener = Gardener()
seed = Seed(
    id='abc-123',
    content='The best interfaces disappear.\\nWhen a tool is truly good, you forget it exists.',
    tags=['design', 'ux']
)

print(f"Maturity: {gardener.assess_maturity(seed):.2f}")
print(f"Suggested phase: {gardener.suggest_phase(seed)}")
print(f"Question: {gardener.generate_question(seed)}")
`,
  },
]
