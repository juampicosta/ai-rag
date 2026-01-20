import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/auth.ts'
import { User, type IUser } from '../models/User.ts'

export interface AuthRequest extends Request {
  user?: IUser | null
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token

  if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (token) {
    try {
      const decoded = verifyToken(token)
      req.user = await User.findById(decoded.userId).select('-password')
      next()
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' })
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' })
  }
}
