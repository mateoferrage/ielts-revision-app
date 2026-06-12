import { createClient } from '@/lib/supabase/server'
import { BandScoreChart } from '@/components/dashboard/BandScoreChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user!.id)
    .not('score', 'is', null)
    .order('started_at', { ascending: true })

  const { count: dueCount } = await supabase
    .from('user_progress')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .lte('next_review', new Date().toISOString().split('T')[0])

  const bySection: Record<string, number[]> = {}
  sessions?.forEach(s => {
    if (!bySection[s.section]) bySection[s.section] = []
    bySection[s.section].push(s.score!)
  })

  const sectionAvg = Object.entries(bySection).map(([section, scores]) => ({
    section,
    avg: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)),
  }))

  const overall = sectionAvg.length
    ? parseFloat((sectionAvg.reduce((a, b) => a + b.avg, 0) / sectionAvg.length).toFixed(1))
    : null

  const chartData = sessions?.map(s => ({
    date: new Date(s.started_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    score: s.score!,
  })) ?? []

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Estimated Band</CardTitle></CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">
              {overall != null ? overall : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Target: 7.0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Due Reviews</CardTitle></CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{dueCount ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">cards to review today</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Progress Over Time</CardTitle></CardHeader>
        <CardContent>
          {chartData.length > 1 ? (
            <BandScoreChart data={chartData} />
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Complete sessions to see your progress chart.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">By Section</CardTitle></CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          {sectionAvg.map(({ section, avg }) => (
            <div key={section} className="text-center">
              <Badge variant="outline" className="mb-1 capitalize">{section}</Badge>
              <p className="text-lg font-bold">{avg}</p>
            </div>
          ))}
          {sectionAvg.length === 0 && (
            <p className="text-sm text-muted-foreground">No sessions yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
