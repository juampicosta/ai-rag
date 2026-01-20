import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    const dbUrl = process.env.DB_URL
    if (!dbUrl) {
      throw new Error('DB_URL is not defined in environment variables')
    }

    await mongoose.connect(dbUrl)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}
