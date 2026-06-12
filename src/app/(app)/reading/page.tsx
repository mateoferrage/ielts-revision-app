import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default async function ReadingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user!.id)
    .eq('section', 'reading')
    .order('started_at', { ascending: false })
    .limit(10)

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reading</h1>
        <Link href="/reading/new">
          <Button>Start session</Button>
        </Link>
      </div>
      <div className="space-y-3">
        {sessions?.map(session => (
          <Card key={session.id}>
            <CardContent className="py-4 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {new Date(session.started_at).toLocaleDateString()}
              </span>
              <span className="font-medium">
                {session.score != null ? `Band ${session.score.toFixed(1)}` : 'In progress'}
              </span>
            </CardContent>
          </Card>
        ))}
        {(!sessions || sessions.length === 0) && (
          <p className="text-muted-foreground text-sm">No sessions yet. Start your first one!</p>
        )}
      </div>
    </div>
  )
}
