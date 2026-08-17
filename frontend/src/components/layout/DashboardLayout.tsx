'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Video,
  Calendar,
  Users,
  BookOpen,
  TrendingUp,
  Bot,
  Target,
  Map,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserMenu } from './UserMenu'

interface DashboardLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Coach', href: '/ai-coach', icon: Bot },
  { name: 'Progreso', href: '/progress', icon: Target },
  { name: 'Videos', href: '/videos', icon: Video },
  { name: 'Sesiones', href: '/sessions', icon: Calendar },
  { name: 'Trackers', href: '/trackers', icon: Map },
  { name: 'Equipos', href: '/teams', icon: Users },
  { name: 'Cursos', href: '/courses', icon: BookOpen },
  { name: 'Estadísticas', href: '/analytics', icon: TrendingUp },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-end">
            <UserMenu />
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-[#0B1F33] min-h-[calc(100vh-73px)] sticky top-[73px]">
          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
            <img src="/logo-mark-512.png" alt="SAILVEX" className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-bold text-white tracking-wide">SAILVEX</span>
          </Link>
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 pl-2 pr-4 py-2 rounded-lg transition-colors',
                    isActive ? 'bg-white/5 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  )}
                >
                  <span
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors',
                      isActive ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
