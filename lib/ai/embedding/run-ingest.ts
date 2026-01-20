process.loadEnvFile()
import { connectDB } from '../../db/db.ts'
import { processPdf } from './ingest.ts'
import path from 'path'
import fs from 'fs'

// Helper to process all PDFs in a directory
async function runIngestion() {
  await connectDB()

  const filesDir = path.join(process.cwd(), 'data') // Ensure you have a 'data' folder with PDFs

  if (!fs.existsSync(filesDir)) {
    console.log('Creating data directory...')
    fs.mkdirSync(filesDir)
    console.log(
      'Please put your PDF files in the "data" directory and run this script again.'
    )
    process.exit(0)
  }

  const files = fs
    .readdirSync(filesDir)
    .filter((file) => file.toLowerCase().endsWith('.pdf'))

  if (files.length === 0) {
    console.log('No PDF files found in "data" directory.')
    process.exit(0)
  }

  for (const file of files) {
    await processPdf(path.join(filesDir, file))
  }

  console.log('Ingestion complete!')
  process.exit(0)
}

runIngestion()
