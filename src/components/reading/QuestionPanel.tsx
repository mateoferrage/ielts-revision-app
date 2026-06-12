'use client'
import type { Question } from '@/types'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface QuestionPanelProps {
  question: Question
  onAnswer: (answer: string, isCorrect: boolean) => void
  answered: boolean
}

export function QuestionPanel({ question, onAnswer, answered }: QuestionPanelProps) {
  const [localAnswer, setLocalAnswer] = useState<string | null>(null)
  const options = (question.content.options ?? []) as string[]
  const correct = question.content.correct_answer as string

  function handleSelect(option: string) {
    if (answered) return
    setLocalAnswer(option)
    onAnswer(option, option === correct)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">{question.content.text}</p>
      <div className="space-y-2">
        {options.map(option => {
          const selected = localAnswer === option
          const isCorrectOption = option === correct
          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={answered}
              className={cn(
                'w-full text-left px-4 py-2 rounded-md border text-sm transition-colors',
                !answered && 'hover:bg-muted cursor-pointer',
                answered && isCorrectOption && 'border-green-500 bg-green-50 dark:bg-green-900/20',
                answered && selected && !isCorrectOption && 'border-red-500 bg-red-50 dark:bg-red-900/20',
                !answered && selected && 'border-primary bg-primary/10'
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
      {answered && (
        <p className={cn('text-sm font-medium', localAnswer === correct ? 'text-green-600' : 'text-red-600')}>
          {localAnswer === correct ? 'Correct!' : `Correct answer: ${correct}`}
        </p>
      )}
    </div>
  )
}
