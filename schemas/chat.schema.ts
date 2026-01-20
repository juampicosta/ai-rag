import { z } from 'zod'

export const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  chatId: z.string().optional()
})

// Schema for req.params validation (if needed manually)
export const chatIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Chat ID') // MongoDB ObjectId regex
})
