import { embed } from 'ai'
import { ollama } from 'ollama-ai-provider-v2'
import { DocumentModel } from '../../models/Document.ts'

const embeddingModel = ollama.embedding('nomic-embed-text')

/**
 * MongoDB Atlas Vector Search Implementation
 *
 * To use this:
 * 1. You must be using MongoDB Atlas (cloud).
 * 2. You must create a Vector Search Index on your collection.
 *    Definition example:
 *    {
 *      "fields": [
 *        {
 *          "numDimensions": 768,
 *          "path": "embedding",
 *          "similarity": "cosine",
 *          "type": "vector"
 *        }
 *      ]
 *    }
 */
export async function retrieveContextViaAtlas(query: string, topK: number = 3) {
  // 1. Generate embedding for the query
  const { embedding: queryEmbedding } = await embed({
    model: embeddingModel,
    value: query
  })

  // 2. Ensure we are connected to DB (should be handled by app init, but good to know)

  // 3. Use $vectorSearch aggregation stage
  // This executes on the server side (MongoDB Atlas) which is much faster/scalable
  const documents = await DocumentModel.aggregate([
    {
      // @ts-ignore - $vectorSearch is a specific Atlas stage
      $vectorSearch: {
        index: 'default', // Your index name in Atlas
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: topK * 10,
        limit: topK
      }
    },
    {
      $project: {
        content: 1,
        score: { $meta: 'vectorSearchScore' },
        metadata: 1,
        _id: 0
      }
    }
  ])

  return documents.map((doc: any) => ({
    content: doc.content,
    score: doc.score,
    source:
      doc.metadata instanceof Map
        ? doc.metadata.get('source')
        : doc.metadata?.source
  }))
}
