import jwt from 'jsonwebtoken'
import type { Response } from 'express'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this'

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '7d'
  })
}

export const setTokenCookie = (res: Response, token: string) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as { userId: string }
}
