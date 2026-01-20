import mongoose from 'mongoose'

const documentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    required: true,
    index: true // Useful if using simple queries, but vector search requires specific indexes usually
  },
  metadata: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export const DocumentModel = mongoose.model('Document', documentSchema)
