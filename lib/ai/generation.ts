import { streamText } from 'ai'
import { ollama } from 'ollama-ai-provider-v2'
import { retrieveContextViaAtlas } from './retrieval.ts'
import type { ChatMessage } from '../../types/chat.types.ts'

const model = ollama('llama3.2')

export async function askAi(messages: ChatMessage[]) {
  // Get the last user message to use as the search query
  const question = messages[messages.length - 1].content

  // 1. Retrieve relevant context
  console.log(`Searching for context for: "${question}"...`)
  const contextDocs = await retrieveContextViaAtlas(question, 5)

  // Debug logs
  console.log('--- Debug: Retrieved Documents ---')
  contextDocs.forEach((d, i) => console.log(d))

  const contextText = contextDocs.map((d) => d.content).join('\n\n')

  // 2. Construct System Prompt
  const systemPrompt = `You are a helpful assistant.
Your goal is to answer the user's question using the provided context.

Rules:
1. If you find ANY relevant information in the context, answer directly. Do NOT apologize for partial information.
2. Only say "Lo siento, no tengo información..." if the context is completely unrelated or empty.
3. specific statistics or data points found in the context should be presented clearly.
4. Speak in Spanish.
5. Keep your answers concise and use bullet points.

<context>
${contextText}
</context>`

  // 3. Stream response
  const { textStream } = streamText({
    model,
    temperature: 0.1, // Low temperature for factual consistency
    messages: [{ role: 'system', content: systemPrompt }, ...messages] as any,
    maxOutputTokens: 500
  })

  return textStream
}
