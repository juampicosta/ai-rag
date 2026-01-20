import { z } from 'zod'

export const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty')
})

export type ChatRequest = z.infer<typeof chatRequestSchema>
