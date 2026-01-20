import express from 'express'
import cors from 'cors'
import { connectDB } from './lib/db/db.ts'
import chatRoutes from './routes/chat.routes.ts'
process.loadEnvFile()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Database Connection
await connectDB()

// Routes
app.use('/api/chat', chatRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
