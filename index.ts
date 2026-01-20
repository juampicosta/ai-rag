import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { connectDB } from './lib/db/db.ts'
import chatRoutes from './routes/chat.routes.ts'
import authRoutes from './routes/auth.routes.ts'
import { errorHandler } from './middleware/error.middleware.ts'

process.loadEnvFile()

const app = express()
const PORT = process.env.PORT || 3000

// 1. Security Headers
app.use(helmet())

// 2. Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// 3. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
})
app.use('/api', limiter)

// 4. Body Parsers & CORS
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
)

// Database Connection
await connectDB()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Global Error Handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
