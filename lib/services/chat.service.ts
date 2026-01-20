import { Chat, type IChat } from '../../models/Chat.ts'
import mongoose from 'mongoose'
import { paginate } from '../utils/pagination.ts'

export const createChat = async (
  userId: mongoose.Types.ObjectId | string,
  initialMessage: string
): Promise<IChat> => {
  return await Chat.create({
    userId,
    title: initialMessage.substring(0, 30) + '...',
    messages: []
  })
}

export const findChatById = async (
  chatId: string,
  userId: mongoose.Types.ObjectId | string
): Promise<IChat | null> => {
  return await Chat.findOne({ _id: chatId, userId })
}

export const addUserMessage = async (
  chatId: string,
  content: string
): Promise<IChat | null> => {
  const chat = await Chat.findById(chatId)
  if (!chat) return null

  chat.messages.push({
    role: 'user',
    content,
    createdAt: new Date()
  })
  return await chat.save()
}

export const addAssistantMessage = async (
  chatId: string,
  content: string
): Promise<IChat | null> => {
  return await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: {
        messages: {
          role: 'assistant',
          content,
          createdAt: new Date()
        }
      }
    },
    { new: true }
  )
}

export const getUserChats = async (
  userId: mongoose.Types.ObjectId | string,
  page: number = 1,
  limit: number = 10
) => {
  return await paginate(
    Chat,
    { userId },
    {
      page,
      limit,
      sort: { updatedAt: -1 },
      select: 'title createdAt updatedAt'
    }
  )
}

export const deleteChat = async (
  chatId: string,
  userId: mongoose.Types.ObjectId | string
): Promise<boolean> => {
  const result = await Chat.deleteOne({ _id: chatId, userId })
  return result.deletedCount === 1
}
