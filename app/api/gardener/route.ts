import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'
import { buildGardenerMessages } from '@/lib/gardener-prompt'
import type { GardenerRequest } from '@/lib/types'

export const runtime = 'nodejs'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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

  const { system, messages } = buildGardenerMessages(body)

  // Create a streaming response using the Web Streams API
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      try {
        // Use the SDK's streaming API
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 400,  // Gardener is concise by design
          system,
          messages,
          stream: true,
        })

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            // Send each chunk as a plain text SSE data line
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
      'X-Accel-Buffering': 'no',  // Disable nginx buffering if behind proxy
    },
  })
}
