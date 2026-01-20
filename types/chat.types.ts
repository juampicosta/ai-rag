export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'data'
  content: string
}
