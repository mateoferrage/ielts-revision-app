'use client'
import { useState } from 'react'
import type { Question } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const QUALITY_LABELS = [
  '0 — Blackout',
  '1 — Wrong',
  '2 — Wrong (familiar)',
  '3 — Hard',
  '4 — Good',
  '5 — Perfect',
]

interface FlashCardProps {
  question: Question
  onRate: (quality: number) => void
}

export function FlashCard({ question, onRate }: FlashCardProps) {
  const [revealed, setReveal] = useState(false)

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Card className="min-h-48">
        <CardContent className="p-6 space-y-4">
          <p className="text-sm font-medium">{question.content.text}</p>
          {question.content.passage && (
            <p className="text-sm text-muted-foreground border-l-2 pl-3">
              {question.content.passage}
            </p>
          )}
          {revealed && (
            <div className="pt-4 border-t">
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                Answer: {question.content.correct_answer as string}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      {!revealed ? (
        <Button onClick={() => setReveal(true)} className="w-full">
          Reveal answer
        </Button>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {QUALITY_LABELS.map((label, i) => (
            <Button
              key={i}
              variant={i >= 3 ? 'default' : 'outline'}
              size="sm"
              onClick={() => onRate(i)}
              className={cn(i < 3 && 'border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20')}
            >
              {label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
