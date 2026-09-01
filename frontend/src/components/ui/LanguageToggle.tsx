'use client'

import { useLanguageStore, Lang } from '@/stores/language'
import { cn } from '@/lib/utils'

const options: { value: Lang; label: string }[] = [
  { value: 'es', label: 'ESP' },
  { value: 'en', label: 'ENG' },
]

export function LanguageToggle({ className }: { className?: string }) {
  const lang = useLanguageStore((state) => state.lang)
  const setLang = useLanguageStore((state) => state.setLang)

  return (
    <div className={cn('flex rounded-lg bg-muted p-1 gap-1', className)}>
      {options.map((opt) => {
        const active = lang === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLang(opt.value)}
            aria-pressed={active}
            className={cn(
              'flex-1 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-background/60'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
