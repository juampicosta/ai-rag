import type { Request, Response } from 'express'
import { chatRequestSchema } from '../schemas/chat.schema.ts'
import { askAi } from '../lib/ai/generation.ts'
import type { ChatMessage } from '../types/chat.types.ts'

export const chatHandler = async (req: Request, res: Response) => {
  try {
    // 1. Zod Validation
    const validation = chatRequestSchema.safeParse(req.body)

    if (!validation.success) {
      res.status(400).json({
        error: 'Validation Error',
        details: validation.error.format()
      })
      return
    }

    const { message } = validation.data

    // 2. Prepare message for AI
    const messages: ChatMessage[] = [{ role: 'user', content: message }]

    // 3. Call AI Service
    const stream = await askAi(messages)

    // 4. Setup Streaming Response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Transfer-Encoding', 'chunked')

    // 5. Pipe stream
    for await (const chunk of stream) {
      res.write(chunk)
    }

    res.end()
  } catch (error) {
    console.error('Chat Controller Error:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' })
    } else {
      res.end()
    }
  }
}
