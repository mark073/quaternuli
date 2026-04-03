import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'
import { buildGardenerMessages } from '@/lib/gardener-prompt'
import type { GardenerRequest } from '@/lib/types'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let body: GardenerRequest
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  if (!body.mode || !body.userMessage) {
    return new Response('Missing required fields', { status: 400 })
  }

  // Use user's own key if provided, otherwise fall back to server key
  const userKey = req.headers.get('x-api-key')
  const apiKey = userKey || process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'No API key configured. Add your Anthropic API key via the ⚙ settings button.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const anthropic = new Anthropic({ apiKey })
  const { system, messages } = buildGardenerMessages(body)

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 400,
          system,
          messages,
          stream: true,
        })

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
            controller.enqueue(encoder.encode(chunk))
          } else if (event.type === 'message_stop') {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
