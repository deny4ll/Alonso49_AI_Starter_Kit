'use client'

import { useQuery } from '@tanstack/react-query'
import { UploadCloud, Terminal } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { entriesApi } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'

export default function ExportPage() {
  const { data } = useQuery({
    queryKey: ['export-status'],
    queryFn: async () => (await entriesApi.exportStatus()).data,
  })

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-1">Exportar hacia la Plataforma</h1>
      <p className="text-muted-foreground mb-6">
        Panel de solo lectura. Por diseño, este módulo no tiene conexión en tiempo real con la
        plataforma principal: la sincronización se ejecuta manualmente desde el servidor.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <UploadCloud className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold">{data?.approvedReadyToSync ?? '—'}</p>
              <p className="text-sm text-muted-foreground">Aprobadas, listas para sincronizar</p>
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-3xl font-bold">{data?.totalAlreadySynced ?? '—'}</p>
          <p className="text-sm text-muted-foreground">Ya sincronizadas históricamente</p>
          <p className="text-xs text-muted-foreground mt-2">
            Última sincronización: {data?.lastSyncedAt ? formatDateTime(data.lastSyncedAt) : 'nunca'}
          </p>
        </Card>
      </div>

      <Card title="Cómo sincronizar">
        <div className="flex items-start gap-3">
          <Terminal className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Ejecuta este comando en el servidor del Training Studio cuando quieras publicar el
              contenido aprobado en la Knowledge Base de la plataforma principal:
            </p>
            <pre className="bg-muted rounded-lg p-3 text-sm font-mono overflow-x-auto">npm run sync:platform</pre>
            <p className="text-xs text-muted-foreground mt-2">
              El script vuelve a validar que no haya información sensible sin confirmar antes de
              exportar cada entrada.
            </p>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  )
}
