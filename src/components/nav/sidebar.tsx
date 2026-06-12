'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Headphones, PenLine, Mic, LayoutDashboard, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reading', label: 'Reading', icon: BookOpen },
  { href: '/listening', label: 'Listening', icon: Headphones },
  { href: '/writing', label: 'Writing', icon: PenLine },
  { href: '/speaking', label: 'Speaking', icon: Mic },
  { href: '/review', label: 'Review', icon: RotateCcw },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-56 min-h-screen bg-card border-r flex flex-col">
      <div className="p-4 border-b">
        <h1 className="font-bold text-lg">IELTS 7.0+</h1>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              pathname.startsWith(href)
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-2">
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
