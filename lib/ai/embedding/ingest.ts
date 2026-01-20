import fs from 'fs'
import { PDFParse } from 'pdf-parse'
import { embedMany } from 'ai'
import { ollama } from 'ollama-ai-provider-v2'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { DocumentModel } from '../../../models/Document.ts'

// Embedding model to use
const embeddingModel = ollama.embedding('nomic-embed-text')

export async function processPdf(filePath: string) {
  try {
    console.log(`Processing file: ${filePath}`)

    // Check if already processed
    const exists = await DocumentModel.exists({ 'metadata.source': filePath })
    if (exists) {
      console.log(`Skipping ${filePath} - already ingested.`)
      return
    }

    // 1. Read PDF
    const dataBuffer = fs.readFileSync(filePath)

    // New API Usage based on user feedback and logs
    const parser = new PDFParse({ data: dataBuffer })
    const result = await parser.getText()
    const fullText = result.text
    await parser.destroy()

    // 2. Chunk text using LangChain's splitter
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '.', '?', '!', ' ', ''] // Default robust separators
    })

    const chunks = await splitter.splitText(fullText)

    console.log(`Generated ${chunks.length} chunks. Generating embeddings...`)

    // 3. Generate Embeddings
    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: chunks
    })

    // 4. Save to DB
    const documents = chunks.map((chunk, i) => ({
      content: chunk,
      embedding: embeddings[i],
      metadata: { source: filePath, chunkIndex: i }
    }))

    // 4. Save to DB
    await DocumentModel.insertMany(documents)
    console.log(`Successfully saved ${documents.length} document chunks to DB.`)
  } catch (error) {
    console.error('Error processing PDF:', error)
  }
}
