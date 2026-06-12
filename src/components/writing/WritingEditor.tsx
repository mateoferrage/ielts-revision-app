'use client'
import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface WritingEditorProps {
  prompt: string
  taskNumber: 1 | 2
  onSubmit: (text: string, wordCount: number, timeTaken: number) => void
  disabled?: boolean
}

export function WritingEditor({ prompt, taskNumber, onSubmit, disabled }: WritingEditorProps) {
  const [text, setText] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const limit = taskNumber === 1 ? 20 : 40
  const minWords = taskNumber === 1 ? 150 : 250

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 60000)
    return () => clearInterval(timer)
  }, [])

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const timeLeft = limit - elapsed

  return (
    <div className="space-y-4">
      <div className="bg-muted rounded-lg p-4">
        <p className="text-sm font-medium">Task {taskNumber}</p>
        <p className="mt-1 text-sm">{prompt}</p>
      </div>
      <div className="flex gap-3 items-center">
        <Badge variant={wordCount >= minWords ? 'default' : 'secondary'}>
          {wordCount} words {wordCount < minWords && `(min ${minWords})`}
        </Badge>
        <Badge variant={timeLeft <= 5 ? 'destructive' : 'outline'}>
          {timeLeft} min left
        </Badge>
      </div>
      <Textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Start writing here…"
        className="min-h-[400px] resize-none font-mono text-sm"
        disabled={disabled}
      />
      <button
        onClick={() => onSubmit(text, wordCount, elapsed)}
        disabled={disabled || wordCount < minWords}
        className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
      >
        Submit for evaluation
      </button>
    </div>
  )
}
