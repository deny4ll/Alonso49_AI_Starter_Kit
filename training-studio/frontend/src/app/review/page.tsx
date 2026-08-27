'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, XCircle, ShieldAlert, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, statusTone } from '@/components/ui/Badge'
import { entriesApi } from '@/lib/api'
import { CATEGORY_LABELS, ORIGIN_LABELS, STATUS_LABELS, formatDateTime, cn } from '@/lib/utils'

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'PENDING_REVIEW', label: 'Pendiente' },
  { value: 'APPROVED', label: 'Aprobado' },
  { value: 'REJECTED', label: 'Rechazado' },
]

const ORIGIN_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'UPLOAD', label: 'Documentos' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'CORRECTION', label: 'Correcciones' },
]

export default function ReviewPage() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('')
  const [origin, setOrigin] = useState('')
  const [piiEntry, setPiiEntry] = useState<any | null>(null)

  const { data: entries, isLoading } = useQuery({
    queryKey: ['entries', status, origin],
    queryFn: async () => (await entriesApi.list({ status: status || undefined, origin: origin || undefined })).data,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['entries'] })

  const approveMutation = useMutation({
    mutationFn: (id: string) => entriesApi.approve(id),
    onSuccess: invalidate,
  })
  const rejectMutation = useMutation({
    mutationFn: (id: string) => entriesApi.reject(id),
    onSuccess: invalidate,
  })
  const confirmPiiMutation = useMutation({
    mutationFn: (id: string) => entriesApi.confirmPii(id),
    onSuccess: () => {
      invalidate()
      setPiiEntry(null)
    },
  })

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-1">Cola de Revisión</h1>
      <p className="text-muted-foreground mb-6">
        Todo el contenido (documentos, manual y correcciones) pasa por aquí antes de contar para el
        AI Coach.
      </p>

      <div className="flex flex-wrap gap-4 mb-6">
        <ChipGroup value={status} onChange={setStatus} options={STATUS_FILTERS} />
        <ChipGroup value={origin} onChange={setOrigin} options={ORIGIN_FILTERS} />
      </div>

      <Card>
        {isLoading ? (
          <div className="py-10 flex justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : entries?.length ? (
          <ul className="divide-y divide-border">
            {entries.map((entry: any) => (
              <li key={entry.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">{entry.title}</p>
                    <Badge tone="primary">{ORIGIN_LABELS[entry.origin]}</Badge>
                    <Badge>{CATEGORY_LABELS[entry.category]}</Badge>
                    <Badge tone={statusTone(entry.status)}>{STATUS_LABELS[entry.status]}</Badge>
                    {entry.piiStatus === 'FLAGGED' && (
                      <Badge tone="danger">
                        <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Info. sensible
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Creado por {entry.createdBy?.firstName} {entry.createdBy?.lastName} ·{' '}
                    {formatDateTime(entry.createdAt)}
                  </p>
                </div>

                {entry.status === 'PENDING_REVIEW' && (
                  <div className="flex gap-2 shrink-0">
                    {entry.piiStatus === 'FLAGGED' ? (
                      <Button variant="outline" size="sm" onClick={() => setPiiEntry(entry)}>
                        <ShieldAlert className="h-4 w-4" /> Revisar Info Sensible
                      </Button>
                    ) : (
                      <Button
                        variant="success"
                        size="sm"
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate(entry.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Aprobar
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={rejectMutation.isPending}
                      onClick={() => rejectMutation.mutate(entry.id)}
                    >
                      <XCircle className="h-4 w-4" /> Rechazar
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground py-10">No hay entradas con estos filtros.</p>
        )}
      </Card>

      {piiEntry && (
        <PiiModal
          entry={piiEntry}
          onClose={() => setPiiEntry(null)}
          onConfirm={() => confirmPiiMutation.mutate(piiEntry.id)}
          loading={confirmPiiMutation.isPending}
        />
      )}
    </DashboardLayout>
  )
}

function ChipGroup({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex gap-1 bg-muted rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            value === opt.value ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function PiiModal({
  entry,
  onClose,
  onConfirm,
  loading,
}: {
  entry: any
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  const [checked, setChecked] = useState(false)
  const findings = entry.piiFindings || []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-lg w-full p-6">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-warning" /> Información sensible detectada
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Se detectaron los siguientes elementos en &quot;{entry.title}&quot;. Revísalos antes de
          aprobar: nunca se guarda ni exporta PII sin confirmación explícita.
        </p>

        <ul className="mb-4 space-y-1 max-h-40 overflow-y-auto">
          {findings.map((f: any, i: number) => (
            <li key={i} className="text-sm bg-muted/60 rounded px-3 py-2 flex justify-between gap-2">
              <span className="font-mono truncate">{f.snippet}</span>
              <Badge tone={f.confidence === 'high' ? 'danger' : 'warning'}>{f.type}</Badge>
            </li>
          ))}
        </ul>

        <label className="flex items-start gap-2 text-sm mb-6">
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-1" />
          Confirmo que revisé este contenido y que puede aprobarse (la información sensible fue
          eliminada o es aceptable conservarla).
        </label>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" disabled={!checked || loading} onClick={onConfirm}>
            Confirmar y continuar
          </Button>
        </div>
      </div>
    </div>
  )
}
