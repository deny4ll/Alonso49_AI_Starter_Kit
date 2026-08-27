'use client'

import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UploadCloud, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { documentsApi } from '@/lib/api'
import { CATEGORIES, CATEGORY_LABELS, cn } from '@/lib/utils'

export default function UploadDocumentPage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<string>('')
  const [dragOver, setDragOver] = useState(false)
  const [uploaded, setUploaded] = useState<any[]>([])

  const mutation = useMutation({
    mutationFn: () => documentsApi.upload(file!, title, category),
    onSuccess: (res) => {
      setUploaded((prev) => [res.data, ...prev])
      setFile(null)
      setTitle('')
      setCategory('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      queryClient.invalidateQueries({ queryKey: ['entries'] })
    },
  })

  const canSubmit = !!file && title.trim().length >= 3 && !!category && !mutation.isPending

  const pickFile = (f: File) => {
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.(pdf|docx)$/i, ''))
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-1">Subir Documento</h1>
      <p className="text-muted-foreground mb-6">Sube un PDF o Word (.docx). El AI Coach solo usará el contenido una vez aprobado en la Cola de Revisión.</p>

      <Card className="mb-8">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const f = e.dataTransfer.files?.[0]
            if (f) pickFile(f)
          }}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
            dragOver ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40',
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) pickFile(f)
            }}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-10 w-10 text-primary" />
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Haz clic para elegir otro archivo</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <UploadCloud className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium">Arrastra un archivo aquí o haz clic para elegirlo</p>
              <p className="text-sm text-muted-foreground">PDF o Word (.docx), máximo 20MB</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">Título del documento</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            placeholder="Ej: Manual de reglaje 49er con viento fuerte"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">Categoría</label>
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

        {mutation.isError && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm">
            {(mutation.error as any)?.response?.data?.message || 'Error al subir el documento'}
          </div>
        )}

        <Button
          size="lg"
          className="w-full mt-6"
          disabled={!canSubmit}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
          Subir
        </Button>
      </Card>

      {uploaded.length > 0 && (
        <Card title="Documentos subidos en esta sesión">
          <ul className="divide-y divide-border">
            {uploaded.map((doc) => (
              <li key={doc.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-sm text-muted-foreground">{CATEGORY_LABELS[doc.category]}</p>
                </div>
                <StatusBadge status={doc.processingStatus} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </DashboardLayout>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'READY') {
    return (
      <Badge tone="success">
        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Listo
      </Badge>
    )
  }
  if (status === 'FAILED') {
    return (
      <Badge tone="danger">
        <XCircle className="h-3.5 w-3.5 mr-1" /> Error
      </Badge>
    )
  }
  return (
    <Badge tone="warning">
      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Procesando
    </Badge>
  )
}
