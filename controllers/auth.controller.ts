import type { Request, Response, NextFunction } from 'express'
import { setTokenCookie } from '../lib/auth.ts'
import {
  registerUserService,
  loginUserService
} from '../lib/services/auth.service.ts'
import { registerSchema, loginSchema } from '../schemas/auth.schema.ts'

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validation = registerSchema.safeParse(req.body)

    if (!validation.success) {
      // We can also throw an error here if we want the middleware to handle it,
      // but returning explicit 400 for validation is also fine.
      res.status(400).json({
        status: 'fail',
        message: 'Validation Error',
        errors: validation.error.issues
      })
      return
    }

    const { email, password } = validation.data
    const { user, token } = await registerUserService(email, password)

    setTokenCookie(res, token)
    res.status(201).json({
      status: 'success',
      data: { _id: user._id, email: user.email }
    })
  } catch (error) {
    next(error)
  }
}

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validation = loginSchema.safeParse(req.body)

    if (!validation.success) {
      res.status(400).json({
        status: 'fail',
        message: 'Validation Error',
        errors: validation.error.issues
      })
      return
    }

    const { email, password } = validation.data
    const { user, token } = await loginUserService(email, password)

    setTokenCookie(res, token)
    res.json({
      status: 'success',
      data: { _id: user._id, email: user.email }
    })
  } catch (error) {
    next(error)
  }
}

export const logoutUser = (req: Request, res: Response): void => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  })
  res.status(200).json({ status: 'success', message: 'Logged out' })
}
