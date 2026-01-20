import express from 'express'
import { protect } from '../middleware/auth.middleware.ts'
import {
  sendMessage,
  getUserChats,
  getChatHistory,
  deleteChat
} from '../controllers/chat.controller.ts'

const router = express.Router()

// All routes here require authentication
router.use(protect)

router.post('/', sendMessage) // Create new chat
router.post('/:id', sendMessage) // Reply to existing chat
router.get('/', getUserChats)
router.get('/:id', getChatHistory)
router.delete('/:id', deleteChat)

export default router
