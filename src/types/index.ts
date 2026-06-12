export type Section = 'listening' | 'reading' | 'writing' | 'speaking'
export type QuestionType = 'mcq' | 'fill_blank' | 'true_false' | 'matching' | 'essay' | 'prompt'

export interface QuestionContent {
  text: string
  options?: string[]
  correct_answer?: string | string[]
  passage?: string
  audio_url?: string
  image_url?: string
  prompt?: string
}

export interface Question {
  id: string
  section: Section
  type: QuestionType
  difficulty: 1 | 2 | 3
  content: QuestionContent
  theme: string | null
  created_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  question_id: string
  ease_factor: number
  interval: number
  repetitions: number
  next_review: string
  last_score: number | null
  updated_at: string
}

export interface Session {
  id: string
  user_id: string
  section: Section
  started_at: string
  ended_at: string | null
  score: number | null
  questions_count: number | null
}

export interface Result {
  id: string
  session_id: string
  question_id: string | null
  user_answer: unknown
  is_correct: boolean | null
  gemini_feedback: string | null
  band_score: number | null
  answered_at: string
}

export interface WritingEvaluation {
  task_achievement: number
  coherence: number
  lexical: number
  grammar: number
  overall: number
  feedback: {
    strengths: string[]
    improvements: string[]
    detailed: string
  }
}
