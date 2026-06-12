'use client'
import { useState } from 'react'
import { WritingEditor } from '@/components/writing/WritingEditor'
import { EvaluationResult } from '@/components/writing/EvaluationResult'
import { createClient } from '@/lib/supabase/client'
import type { WritingEvaluation } from '@/types'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'

const TASKS = {
  task1: {
    taskNumber: 1 as const,
    prompt: 'The graph below shows the percentage of households with internet access in three countries between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  },
  task2: {
    taskNumber: 2 as const,
    prompt: 'Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?',
  },
}

export default function WritingTaskPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const task = TASKS[taskId as keyof typeof TASKS] ?? TASKS.task2
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(text: string, wordCount: number, timeTaken: number) {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: session } = await supabase
        .from('sessions')
        .insert({ user_id: user.id, section: 'writing', questions_count: 1 })
        .select()
        .single()

      const res = await fetch('/api/writing/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskNumber: task.taskNumber,
          prompt: task.prompt,
          response: text,
          wordCount,
          timeTaken,
        }),
      })

      if (!res.ok) throw new Error('Evaluation failed')

      const eval_ = await res.json() as WritingEvaluation
      setEvaluation(eval_)

      if (session) {
        await supabase.from('sessions').update({
          ended_at: new Date().toISOString(),
          score: eval_.overall,
        }).eq('id', session.id)

        await supabase.from('results').insert({
          session_id: session.id,
          question_id: null,
          user_answer: { text },
          gemini_feedback: eval_.feedback.detailed,
          band_score: eval_.overall,
        })
      }
    } catch {
      toast.error('Evaluation failed. Check your API key.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {loading && (
        <p className="text-center text-muted-foreground py-4">Evaluating your writing…</p>
      )}
      {!evaluation && !loading && (
        <WritingEditor
          prompt={task.prompt}
          taskNumber={task.taskNumber}
          onSubmit={handleSubmit}
          disabled={loading}
        />
      )}
      {evaluation && <EvaluationResult evaluation={evaluation} />}
    </div>
  )
}
