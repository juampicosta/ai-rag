import { User, type IUser } from '../../models/User.ts'
import { hashPassword, comparePassword } from './password.service.ts'
import { generateToken } from '../auth.ts'
import { AppError } from '../utils/AppError.ts'

export const registerUserService = async (
  email: string,
  password: string
): Promise<{ user: IUser; token: string }> => {
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new AppError('User already exists', 400)
  }

  const hashedPassword = await hashPassword(password)
  const user = await User.create({
    email,
    password: hashedPassword
  })

  const token = generateToken(user._id.toString())
  return { user, token }
}

export const loginUserService = async (
  email: string,
  password: string
): Promise<{ user: IUser; token: string }> => {
  const user = await User.findOne({ email })
  if (!user) {
    throw new AppError('Invalid email or password', 401)
  }

  const isMatch = await comparePassword(password, user.password)
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401)
  }

  const token = generateToken(user._id.toString())
  return { user, token }
}
