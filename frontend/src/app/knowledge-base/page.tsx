'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { knowledgeBaseApi } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { Trash2, Upload } from 'lucide-react'

const inputClass =
  'w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent'

const CATEGORY_OPTIONS = [
  { value: 'methodology', label: 'Metodología' },
  { value: 'technique', label: 'Técnica' },
  { value: 'tactics', label: 'Táctica' },
  { value: 'boat_setup', label: 'Puesta a punto' },
  { value: 'physical_prep', label: 'Preparación física' },
  { value: 'mental_prep', label: 'Preparación mental' },
]

const STATUS_LABELS: Record<string, string> = {
  PROCESSING: 'Procesando...',
  READY: 'Listo',
  FAILED: 'Error',
}

export default function KnowledgeBasePage() {
  const router = useRouter()
  const { user, isHydrated } = useAuthStore()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0].value)
  const [file, setFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState('')

  const canAccess = user?.role === 'ADMIN' || user?.role === 'COACH'

  useEffect(() => {
    if (isHydrated && user && !canAccess) {
      router.replace('/dashboard')
    }
  }, [isHydrated, user, canAccess, router])

  const { data: documents, isLoading } = useQuery({
    queryKey: ['knowledge-base-documents'],
    queryFn: async () => {
      const res = await knowledgeBaseApi.getDocuments()
      return res.data
    },
    enabled: canAccess,
    refetchInterval: (query) =>
      (query.state.data || []).some((d: any) => d.status === 'PROCESSING') ? 3000 : false,
  })

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Falta el archivo')
      const res = await knowledgeBaseApi.uploadDocument(file, { title, category })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-documents'] })
      setTitle('')
      setFile(null)
    },
    onError: (err: any) => {
      setUploadError(err.response?.data?.message || 'No se pudo subir el documento')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await knowledgeBaseApi.deleteDocument(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-documents'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setUploadError('')
    uploadMutation.mutate()
  }

  if (!canAccess) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Subí documentos (PDF o Word) con la metodología SAILVEX para que el AI Coach los use como fuente de
          respuestas
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        <Card title="Subir documento">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="Ej: Estándar técnico de puesta a punto (SOP & Rigging)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Categoría</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Archivo (PDF o .docx)</label>
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className={inputClass}
                required
              />
            </div>

            {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}

            <Button type="submit" disabled={uploadMutation.isPending}>
              <Upload className="h-4 w-4 mr-2 inline" />
              {uploadMutation.isPending ? 'Subiendo...' : 'Subir documento'}
            </Button>
          </form>
        </Card>

        <Card title="Documentos">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : !documents || documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no subiste ningún documento.</p>
          ) : (
            <div className="divide-y divide-border">
              {documents.map((doc: any) => (
                <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{doc.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {CATEGORY_OPTIONS.find((c) => c.value === doc.category)?.label || doc.category} ·{' '}
                      {doc._count?.chunks ?? 0} fragmentos ·{' '}
                      <span
                        className={
                          doc.status === 'FAILED'
                            ? 'text-destructive'
                            : doc.status === 'READY'
                              ? 'text-green-600'
                              : ''
                        }
                      >
                        {STATUS_LABELS[doc.status] || doc.status}
                      </span>
                    </p>
                    {doc.status === 'FAILED' && doc.errorMessage && (
                      <p className="text-xs text-destructive mt-1 truncate">{doc.errorMessage}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => deleteMutation.mutate(doc.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
