import { streamText } from 'ai'
import { ollama } from 'ollama-ai-provider-v2'
import { retrieveContextViaAtlas } from './retrieval.ts'
import type { ChatMessage } from '../../types/chat.types.ts'

const model = ollama('deepseek-r1')

export async function askAi(messages: ChatMessage[]) {
  // Get the last user message to use as the search query
  const question = messages[messages.length - 1].content

  // 1. Retrieve relevant context
  console.log(`Searching for context for: "${question}"...`)
  const contextDocs = await retrieveContextViaAtlas(question, 5)

  // Debug logs
  console.log('--- Debug: Retrieved Documents ---')
  contextDocs.forEach((d, i) =>
    console.log(`[${i}] Score: ${(d as any).score.toFixed(4)}`)
  )

  const contextText = contextDocs.map((d) => d.content).join('\n\n')

  // 2. Construct System Prompt
  const systemPrompt = `You are a helpful assistant. You must answer the user's question using the provided context below.
If the answer is not in the context, say "I cannot find the answer in the provided documents."

Context:
${contextText}`

  // 3. Stream response
  // We prepend the system prompt to the messages history
  const { textStream } = streamText({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.reverse() // Restore order after reverse() check above
    ] as any
  })

  return textStream
}
