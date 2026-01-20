import type { Response, NextFunction } from 'express'
import { Readable } from 'stream'
import { askAi } from '../lib/ai/generation.ts'
import type { AuthRequest } from '../middleware/auth.middleware.ts'
import * as chatService from '../lib/services/chat.service.ts'
import { chatRequestSchema } from '../schemas/chat.schema.ts'
import { AppError } from '../lib/utils/AppError.ts'

export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = chatRequestSchema.safeParse(req.body)

    if (!validation.success) {
      res.status(400).json({
        status: 'fail',
        message: 'Validation Error',
        errors: validation.error.issues
      })
      return
    }

    const { message, chatId: bodyChatId } = validation.data
    const chatId = (req.params.id as string) || bodyChatId // Data from URL params has priority
    const userId = req.user!._id.toString()

    // 1. Get or Create Chat
    let chat
    if (chatId) {
      chat = await chatService.findChatById(chatId, userId)
      if (!chat) {
        throw new AppError('Chat not found', 404)
      }
    } else {
      chat = await chatService.createChat(userId, message)
    }

    // 2. Add User Message
    const updatedChat = await chatService.addUserMessage(
      chat._id.toString(),
      message
    )
    if (!updatedChat) throw new AppError('Error updating chat', 500)

    // 3. Prepare AI Context
    const history = updatedChat.messages.slice(-10).map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content
    }))

    // 4. Stream Response & Save
    const aiStream = await askAi(history, async (responseContent) => {
      await chatService.addAssistantMessage(
        chat!._id.toString(),
        responseContent
      )
    })

    // 5. Pipe Stream
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Transfer-Encoding', 'chunked')
    res.setHeader('X-Chat-Id', chat._id.toString())

    // @ts-ignore
    const nodeStream = Readable.fromWeb(aiStream as any)
    nodeStream.pipe(res)
  } catch (error) {
    next(error)
  }
}

export const getUserChats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    const result = await chatService.getUserChats(
      req.user!._id.toString(),
      page,
      limit
    )
    res.json({
      status: 'success',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

export const getChatHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id: string }
    const chat = await chatService.findChatById(id, req.user!._id.toString())

    if (!chat) {
      throw new AppError('Chat not found', 404)
    }

    res.json({
      status: 'success',
      data: chat
    })
  } catch (error) {
    next(error)
  }
}

export const deleteChat = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id: string }
    const success = await chatService.deleteChat(id, req.user!._id.toString())

    if (!success) {
      throw new AppError('Chat not found or not authorized', 404)
    }

    res.json({
      status: 'success',
      message: 'Chat deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}
