'use client'

import { ReactNode, useEffect, useState } from 'react'
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
  Library,
  Menu,
  X,
  GraduationCap,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserMenu } from './UserMenu'
import { useAuthStore } from '@/stores/auth'
import { useT } from '@/lib/i18n/useT'
import { LanguageToggle } from '@/components/ui/LanguageToggle'

interface DashboardLayoutProps {
  children: ReactNode
}

interface NavItem {
  nameKey: string
  href: string
  icon: typeof LayoutDashboard
  roles?: string[]
  external?: boolean
}

const navigation: NavItem[] = [
  { nameKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { nameKey: 'nav.aiCoach', href: '/ai-coach', icon: Bot },
  { nameKey: 'nav.progress', href: '/progress', icon: Target },
  { nameKey: 'nav.videos', href: '/videos', icon: Video },
  { nameKey: 'nav.sessions', href: '/sessions', icon: Calendar },
  { nameKey: 'nav.trackers', href: '/trackers', icon: Map },
  { nameKey: 'nav.teams', href: '/teams', icon: Users },
  { nameKey: 'nav.courses', href: '/courses', icon: BookOpen },
  { nameKey: 'nav.analytics', href: '/analytics', icon: TrendingUp },
]

const adminNavigation: NavItem[] = [
  { nameKey: 'nav.knowledgeBase', href: '/knowledge-base', icon: Library, roles: ['ADMIN', 'COACH'] },
  // App independiente (login y base de datos propios) donde los
  // entrenadores curan el conocimiento del AI Coach. Es solo un enlace de
  // salida — nunca hay una llamada API en runtime entre ambos frontends.
  {
    nameKey: 'nav.trainingStudio',
    href: process.env.NEXT_PUBLIC_TRAINING_STUDIO_URL || 'http://localhost:3003',
    icon: GraduationCap,
    roles: ['ADMIN', 'COACH'],
    external: true,
  },
]

function SidebarNav({ items, pathname, onNavigate }: { items: NavItem[]; pathname: string; onNavigate?: () => void }) {
  const t = useT()
  return (
    <nav className="p-4 space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        const content = (
          <>
            <span
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors',
                isActive ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'
              )}
            >
              <item.icon className="h-4 w-4" />
            </span>
            <span className="font-medium">{t(item.nameKey)}</span>
            {item.external && <ExternalLink className="h-3.5 w-3.5 ml-auto text-gray-500" />}
          </>
        )

        const className = cn(
          'flex items-center gap-3 pl-2 pr-4 py-2 rounded-lg transition-colors',
          isActive ? 'bg-white/5 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
        )

        if (item.external) {
          return (
            <a key={item.nameKey} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
              {content}
            </a>
          )
        }

        return (
          <Link key={item.nameKey} href={item.href} onClick={onNavigate} className={className}>
            {content}
          </Link>
        )
      })}
    </nav>
  )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const t = useT()
  const pathname = usePathname()
  const { user } = useAuthStore()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const items = [
    ...navigation,
    ...adminNavigation.filter((item) => !item.roles || item.roles.includes(user?.role || '')),
  ]

  // Cerrar el drawer mobile automáticamente al cambiar de página.
  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between md:justify-end">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden p-2 -ml-2 text-foreground"
              aria-label={t('nav.openMenu')}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="hidden md:block w-64 bg-[#0B1F33] min-h-[calc(100vh-73px)] sticky top-[73px]">
          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
            <img src="/logo-mark-512.png" alt="SAILVEX" className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-bold text-white tracking-wide">SAILVEX</span>
          </Link>
          <SidebarNav items={items} pathname={pathname} />
        </aside>

        {mobileNavOpen && (
          <div className="md:hidden fixed inset-0 z-[60]">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileNavOpen(false)}
              aria-hidden="true"
            />
            <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0B1F33] overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <img src="/logo-mark-512.png" alt="SAILVEX" className="h-8 w-8 rounded-lg" />
                  <span className="text-lg font-bold text-white tracking-wide">SAILVEX</span>
                </Link>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-2 text-gray-400 hover:text-white"
                  aria-label={t('nav.closeMenu')}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarNav items={items} pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
            </aside>
          </div>
        )}

        <main className="flex-1 p-4 md:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
