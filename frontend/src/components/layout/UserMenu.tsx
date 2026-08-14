'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Settings, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function UserMenu() {
  const { user, logout } = useAuthStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted"
      >
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs font-semibold text-primary">{user?.role}</p>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg border border-border bg-card text-card-foreground shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>

          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
            Editar perfil
          </Link>

          <div className="px-4 py-3 border-t border-border">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Tema
            </p>
            <ThemeToggle className="w-full" />
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted border-t border-border"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
