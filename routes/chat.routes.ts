import { Router } from 'express'
import { chatHandler } from '../controllers/chat.controller.ts'

const router = Router()

router.post('/', chatHandler)

export default router
