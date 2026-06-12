'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FlashCard } from '@/components/review/FlashCard'
import { sm2Update } from '@/lib/sm2/algorithm'
import type { Question, UserProgress } from '@/types'
import { toast } from 'sonner'

interface QueueItem {
  question: Question
  progress: UserProgress
}

export default function ReviewPage() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [current, setCurrent] = useState(0)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadQueue() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().split('T')[0]

      const { data: dueProgress } = await supabase
        .from('user_progress')
        .select('*, questions(*)')
        .eq('user_id', user.id)
        .lte('next_review', today)
        .limit(20)

      if (dueProgress) {
        const items: QueueItem[] = dueProgress.map((p: UserProgress & { questions: Question }) => ({
          question: p.questions,
          progress: p,
        }))
        setQueue(items)
      }
      setLoading(false)
    }
    loadQueue()
  }, [])

  async function handleRate(quality: number) {
    const item = queue[current]
    const updated = sm2Update(
      {
        ease_factor: item.progress.ease_factor,
        interval: item.progress.interval,
        repetitions: item.progress.repetitions,
      },
      quality
    )

    await supabase
      .from('user_progress')
      .update({
        ease_factor: updated.ease_factor,
        interval: updated.interval,
        repetitions: updated.repetitions,
        next_review: updated.next_review,
        last_score: quality,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.progress.id)

    if (current + 1 >= queue.length) {
      setDone(true)
      toast.success('Review session complete!')
    } else {
      setCurrent(c => c + 1)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground p-6">Loading reviews…</div>
  }

  if (queue.length === 0 || done) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-3">
        <p className="text-2xl">{done ? '✓' : '🎉'}</p>
        <p className="font-medium">
          {done ? `All ${queue.length} cards reviewed!` : 'No reviews due today!'}
        </p>
        {!done && <p className="text-sm text-muted-foreground">Come back tomorrow.</p>}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Review Queue</span>
        <span>{current + 1} / {queue.length}</span>
      </div>
      <FlashCard question={queue[current].question} onRate={handleRate} />
    </div>
  )
}
