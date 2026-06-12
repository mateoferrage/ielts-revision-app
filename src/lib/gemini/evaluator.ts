import { GoogleGenerativeAI } from '@google/generative-ai'
import type { WritingEvaluation } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function evaluateWriting(params: {
  taskNumber: 1 | 2
  prompt: string
  response: string
  wordCount: number
  timeTaken: number
}): Promise<WritingEvaluation> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const systemPrompt = `You are an expert IELTS examiner. Evaluate the following Writing Task ${params.taskNumber} response.

Prompt: ${params.prompt}
Student response: ${params.response}
Word count: ${params.wordCount}
Time taken: ${params.timeTaken} minutes

Score each criterion from 0 to 9 (use half-band scores like 6.5):
- Task ${params.taskNumber === 1 ? 'Achievement' : 'Response'}
- Coherence and Cohesion
- Lexical Resource
- Grammatical Range and Accuracy

Return ONLY a valid JSON object with no markdown, no backticks:
{
  "task_achievement": number,
  "coherence": number,
  "lexical": number,
  "grammar": number,
  "overall": number,
  "feedback": {
    "strengths": string[],
    "improvements": string[],
    "detailed": string
  }
}`

  const result = await model.generateContent(systemPrompt)
  const text = result.response.text().trim()
  const json = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(json) as WritingEvaluation
}
