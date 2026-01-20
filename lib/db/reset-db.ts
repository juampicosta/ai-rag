import process from 'node:process'
import { connectDB } from './db.ts'
import { DocumentModel } from '../../models/Document.ts'

// Cargar variables de entorno
process.loadEnvFile()

async function resetDb() {
  try {
    console.log('Connecting to DB...')
    await connectDB()

    console.log('Deleting all documents...')
    const result = await DocumentModel.deleteMany({})

    console.log(`Deleted ${result.deletedCount} documents.`)
    console.log('Database is clean. You can now run "npm run ingest".')

    process.exit(0)
  } catch (error) {
    console.error('Error resetting DB:', error)
    process.exit(1)
  }
}

resetDb()
