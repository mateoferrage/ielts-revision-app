import type { WritingEvaluation } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function BandBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{score}</span>
      </div>
      <div className="h-2 bg-muted rounded-full">
        <div
          className="h-2 bg-primary rounded-full transition-all"
          style={{ width: `${(score / 9) * 100}%` }}
        />
      </div>
    </div>
  )
}

export function EvaluationResult({ evaluation }: { evaluation: WritingEvaluation }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Overall Band Score</p>
        <p className="text-5xl font-bold text-primary">{evaluation.overall}</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Criterion Scores</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <BandBar label="Task Achievement" score={evaluation.task_achievement} />
          <BandBar label="Coherence &amp; Cohesion" score={evaluation.coherence} />
          <BandBar label="Lexical Resource" score={evaluation.lexical} />
          <BandBar label="Grammar" score={evaluation.grammar} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Strengths</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {evaluation.feedback.strengths.map((s, i) => (
              <li key={i} className="text-sm text-green-700 dark:text-green-400">&#10003; {s}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Improvements</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {evaluation.feedback.improvements.map((s, i) => (
              <li key={i} className="text-sm text-orange-700 dark:text-orange-400">&#8594; {s}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Detailed Feedback</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{evaluation.feedback.detailed}</p>
        </CardContent>
      </Card>
    </div>
  )
}
