import mongoose, { Schema, Document } from 'mongoose'

interface IMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  createdAt: Date
}

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  messages: IMessage[]
  createdAt: Date
  updatedAt: Date
}

const messageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ['system', 'user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const chatSchema = new Schema<IChat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      default: 'New Chat'
    },
    messages: [messageSchema]
  },
  {
    timestamps: true
  }
)

export const Chat = mongoose.model<IChat>('Chat', chatSchema)
