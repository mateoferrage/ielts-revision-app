import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function WritingPage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Writing</h1>
      <div className="grid gap-4">
        <Card>
          <CardHeader><CardTitle>Task 1 — Data Description</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Describe a graph, chart, or diagram. Minimum 150 words. 20 minutes.</p>
            <Link href="/writing/task1"><Button className="w-full">Start Task 1</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Task 2 — Argumentative Essay</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Write an essay responding to a point of view. Minimum 250 words. 40 minutes.</p>
            <Link href="/writing/task2"><Button className="w-full">Start Task 2</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
