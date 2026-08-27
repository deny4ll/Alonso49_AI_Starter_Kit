'use client'

import { ReactNode, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/Button'
import { GraduationCap, LayoutGrid, Upload, PenLine, MessagesSquare, ListChecks, UploadCloud, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutGrid },
  { href: '/documents/upload', label: 'Subir Documento', icon: Upload },
  { href: '/entries/new', label: 'Escribir Manualmente', icon: PenLine },
  { href: '/test-chat', label: 'Probar & Corregir', icon: MessagesSquare },
  { href: '/review', label: 'Cola de Revisión', icon: ListChecks },
]

export function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, token, isHydrated, initAuth, logout } = useAuthStore()

  useEffect(() => {
    if (!isHydrated) initAuth()
  }, [isHydrated, initAuth])

  useEffect(() => {
    if (isHydrated && !token) {
      router.push('/login')
    }
  }, [isHydrated, token, router])

  if (!isHydrated || !token) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Cargando…</div>
  }

  const navItems = user?.role === 'ADMIN' ? [...NAV_ITEMS, { href: '/export', label: 'Exportar', icon: UploadCloud }] : NAV_ITEMS

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <GraduationCap className="h-6 w-6 text-primary" />
            Training Studio
          </Link>

          <nav className="flex items-center gap-1 flex-wrap">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.firstName} {user?.lastName}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
