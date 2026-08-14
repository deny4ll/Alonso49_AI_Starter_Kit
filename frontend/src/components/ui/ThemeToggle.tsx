'use client'

import { Monitor, Sun, Moon } from 'lucide-react'
import { useThemeStore, ThemeMode } from '@/stores/theme'
import { cn } from '@/lib/utils'

const options: { value: ThemeMode; label: string; icon: typeof Monitor }[] = [
  { value: 'system', label: 'Sistema', icon: Monitor },
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
]

export function ThemeToggle({ className }: { className?: string }) {
  const mode = useThemeStore((state) => state.mode)
  const setMode = useThemeStore((state) => state.setMode)

  return (
    <div className={cn('flex rounded-lg bg-muted p-1 gap-1', className)}>
      {options.map((opt) => {
        const Icon = opt.icon
        const active = mode === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setMode(opt.value)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-background/60'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
