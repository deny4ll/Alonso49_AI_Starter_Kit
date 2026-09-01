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
import { useT } from '@/lib/i18n/useT'

const inputClass =
  'w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent'

const CATEGORY_OPTIONS = [
  { value: 'methodology', labelKey: 'knowledgeBase.categories.methodology' },
  { value: 'technique', labelKey: 'knowledgeBase.categories.technique' },
  { value: 'tactics', labelKey: 'knowledgeBase.categories.tactics' },
  { value: 'boat_setup', labelKey: 'knowledgeBase.categories.boatSetup' },
  { value: 'physical_prep', labelKey: 'knowledgeBase.categories.physicalPrep' },
  { value: 'mental_prep', labelKey: 'knowledgeBase.categories.mentalPrep' },
]

export default function KnowledgeBasePage() {
  const t = useT()
  const router = useRouter()
  const { user, isHydrated } = useAuthStore()
  const queryClient = useQueryClient()

  const STATUS_LABELS: Record<string, string> = {
    PROCESSING: t('knowledgeBase.status.processing'),
    READY: t('knowledgeBase.status.ready'),
    FAILED: t('knowledgeBase.status.failed'),
  }

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
      if (!file) throw new Error(t('knowledgeBase.upload.missingFile'))
      const res = await knowledgeBaseApi.uploadDocument(file, { title, category })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-documents'] })
      setTitle('')
      setFile(null)
    },
    onError: (err: any) => {
      setUploadError(err.response?.data?.message || t('knowledgeBase.upload.genericError'))
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
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('knowledgeBase.header.title')}</h1>
        <p className="text-muted-foreground">{t('knowledgeBase.header.subtitle')}</p>
      </div>

      <div className="max-w-3xl space-y-6">
        <Card title={t('knowledgeBase.upload.cardTitle')}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {t('knowledgeBase.upload.titleLabel')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder={t('knowledgeBase.upload.titlePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {t('knowledgeBase.upload.categoryLabel')}
              </label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {t('knowledgeBase.upload.fileLabel')}
              </label>
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
              {uploadMutation.isPending ? t('knowledgeBase.upload.buttonLoading') : t('knowledgeBase.upload.button')}
            </Button>
          </form>
        </Card>

        <Card title={t('knowledgeBase.documents.cardTitle')}>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t('knowledgeBase.documents.loading')}</p>
          ) : !documents || documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('knowledgeBase.documents.empty')}</p>
          ) : (
            <div className="divide-y divide-border">
              {documents.map((doc: any) => (
                <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{doc.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        const opt = CATEGORY_OPTIONS.find((c) => c.value === doc.category)
                        return opt ? t(opt.labelKey) : doc.category
                      })()} ·{' '}
                      {doc._count?.chunks ?? 0} {t('knowledgeBase.documents.fragments')} ·{' '}
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
