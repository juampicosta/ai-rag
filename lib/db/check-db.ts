import process from 'node:process'
import { connectDB } from './db.ts'
import { DocumentModel } from '../../models/Document.ts'

process.loadEnvFile()

async function checkDb() {
  try {
    console.log('Connecting to DB...')
    await connectDB()

    const count = await DocumentModel.countDocuments()
    console.log(`Total Documents in DB: ${count}`)

    if (count > 0) {
      const doc = await DocumentModel.findOne()
      console.log('Sample Document:')
      console.log(`- ID: ${doc?._id}`)
      console.log(`- Content Length: ${doc?.content?.length}`)
      console.log(`- Metadata:`, doc?.metadata)
      console.log(`- Has Embedding? ${!!doc?.embedding}`)
      console.log(`- Embedding Length: ${doc?.embedding?.length}`)
    } else {
      console.log('WARNING: No documents found. Ingestion might have failed.')
    }

    process.exit(0)
  } catch (error) {
    console.error('Error checking DB:', error)
    process.exit(1)
  }
}

checkDb()
