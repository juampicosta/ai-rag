import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/utils/AppError.ts'
import { ZodError } from 'zod'

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err }
  error.message = err.message

  // Log error for debugging (in production use a logger like Winston)
  console.error('ERROR 💥', err)

  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation Error',
      errors: err.issues
    })
  }

  // 2. Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const message = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field`
    error = new AppError(message, 400)
  }

  // 3. Mongoose Cast Error (Invalid ID)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`
    error = new AppError(message, 400)
  }

  // 4. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again', 401)
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired. Please log in again', 401)
  }

  // Fallback to generic error if not operational
  if (!error.statusCode) {
    error.statusCode = err.statusCode || 500
    error.status = err.status || 'error'
  }

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message || 'Something went wrong!'
  })
}
