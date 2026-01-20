import express from 'express'
import {
  registerUser,
  loginUser,
  logoutUser
} from '../controllers/auth.controller.ts'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)

export default router
