'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Upload, PenLine, MessagesSquare, ListChecks } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { entriesApi } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const ACTIONS = [
  {
    href: '/documents/upload',
    icon: Upload,
    title: 'Subir Documento',
    description: 'Sube un PDF o Word para que el AI Coach aprenda de él.',
  },
  {
    href: '/entries/new',
    icon: PenLine,
    title: 'Escribir Manualmente',
    description: 'Escribe conocimiento directamente, sin necesidad de un archivo.',
  },
  {
    href: '/test-chat',
    icon: MessagesSquare,
    title: 'Probar & Corregir',
    description: 'Haz una pregunta, revisa la respuesta de la IA y corrígela si hace falta.',
  },
  {
    href: '/review',
    icon: ListChecks,
    title: 'Cola de Revisión',
    description: 'Aprueba o rechaza todo el contenido pendiente.',
  },
]

export default function DashboardPage() {
  const { token } = useAuthStore()

  const { data: pending } = useQuery({
    queryKey: ['entries', 'PENDING_REVIEW'],
    queryFn: async () => (await entriesApi.list({ status: 'PENDING_REVIEW' })).data,
    enabled: !!token,
  })

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">¿Qué quieres hacer hoy?</h1>
        <p className="text-muted-foreground mt-1">
          Elige una acción. Todo lo que agregues pasa por revisión antes de contar para el AI Coach.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {ACTIONS.map((action) => {
          const Icon = action.icon
          const showBadge = action.href === '/review' && pending?.length > 0
          return (
            <Link key={action.href} href={action.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">{action.title}</h2>
                      {showBadge && <Badge tone="warning">{pending.length} pendientes</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
