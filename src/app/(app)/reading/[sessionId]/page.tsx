'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PassageViewer } from '@/components/reading/PassageViewer'
import { QuestionPanel } from '@/components/reading/QuestionPanel'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Question } from '@/types'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'

export default function ReadingSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<{ answer: string; isCorrect: boolean }[]>([])
  const [sessionDbId, setSessionDbId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: qs } = await supabase
        .from('questions')
        .select('*')
        .eq('section', 'reading')
        .limit(5)

      setQuestions(qs ?? [])

      if (sessionId === 'new') {
        const { data: session } = await supabase
          .from('sessions')
          .insert({ user_id: user.id, section: 'reading', questions_count: qs?.length ?? 0 })
          .select()
          .single()
        setSessionDbId(session?.id ?? null)
      } else {
        setSessionDbId(sessionId)
      }
    }
    init()
  }, [sessionId])

  async function handleAnswer(answer: string, isCorrect: boolean) {
    const newAnswers = [...answers, { answer, isCorrect }]
    setAnswers(newAnswers)

    if (sessionDbId) {
      await supabase.from('results').insert({
        session_id: sessionDbId,
        question_id: questions[current].id,
        user_answer: { text: answer },
        is_correct: isCorrect,
      })
    }
  }

  async function handleNext() {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
    } else {
      const correct = answers.filter(a => a.isCorrect).length
      const score = parseFloat(((correct / questions.length) * 9).toFixed(1))
      if (sessionDbId) {
        await supabase.from('sessions').update({
          ended_at: new Date().toISOString(),
          score,
        }).eq('id', sessionDbId)
      }
      toast.success(`Session complete! Band ${score}`)
      router.push('/reading')
    }
  }

  if (questions.length === 0) {
    return <div className="p-6 text-muted-foreground">Loading questions…</div>
  }

  const q = questions[current]
  const answered = answers.length > current

  return (
    <div className="max-w-6xl">
      <div className="mb-4 flex items-center gap-4">
        <Progress value={(current / questions.length) * 100} className="flex-1" />
        <span className="text-sm text-muted-foreground">{current + 1} / {questions.length}</span>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6 overflow-auto max-h-[70vh]">
          <PassageViewer passage={q.content.passage ?? q.content.text} />
        </div>
        <div className="bg-card border rounded-lg p-6 space-y-6">
          <QuestionPanel
            question={q}
            onAnswer={handleAnswer}
            answered={answered}
          />
          {answered && (
            <Button onClick={handleNext} className="w-full">
              {current < questions.length - 1 ? 'Next question' : 'Finish session'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
