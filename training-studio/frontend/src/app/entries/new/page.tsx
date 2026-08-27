'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Save, Send, CheckCircle2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { entriesApi } from '@/lib/api'
import { CATEGORIES, CATEGORY_LABELS, cn } from '@/lib/utils'

export default function NewEntryPage() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [success, setSuccess] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (submit: boolean) => entriesApi.create({ title, category, content, submit }),
    onSuccess: (_res, submit) => {
      setSuccess(submit ? 'Enviado a revisión.' : 'Guardado como borrador.')
      setTitle('')
      setCategory('')
      setContent('')
    },
  })

  const canSave = title.trim().length >= 3 && !!category && content.trim().length >= 10

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-1">Escribir Manualmente</h1>
      <p className="text-muted-foreground mb-6">
        Escribe el conocimiento con tus propias palabras. Puedes guardarlo como borrador para
        terminarlo después, o enviarlo directo a revisión.
      </p>

      <Card>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">1. Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            placeholder="Ej: Cómo ajustar el cunningham con viento fuerte"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">2. Categoría</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  'px-4 py-3 rounded-lg text-sm font-medium border transition-colors text-left',
                  category === c
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-muted',
                )}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">3. Contenido</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background font-sans"
            placeholder="Escribe aquí el conocimiento en texto simple, como si se lo explicaras a un atleta..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            Texto simple, sin necesidad de formato especial.
          </p>
        </div>

        {mutation.isError && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm">
            {(mutation.error as any)?.response?.data?.message || 'Error al guardar'}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-success/10 border border-success/30 text-success rounded-lg text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {success}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            disabled={!canSave || mutation.isPending}
            onClick={() => mutation.mutate(false)}
          >
            <Save className="h-5 w-5" /> Guardar Borrador
          </Button>
          <Button
            size="lg"
            className="flex-1"
            disabled={!canSave || mutation.isPending}
            onClick={() => mutation.mutate(true)}
          >
            <Send className="h-5 w-5" /> Enviar a Revisión
          </Button>
        </div>
      </Card>
    </DashboardLayout>
  )
}
