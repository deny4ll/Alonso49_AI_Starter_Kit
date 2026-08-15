'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { videosApi, tagsApi } from '@/lib/api'
import { Plus, Play, Trash2, FileText, Search } from 'lucide-react'

interface Tag {
  id: string
  key: string
  label: string
  children?: Tag[]
}

export default function VideosPage() {
  const [showModal, setShowModal] = useState(false)
  const [contentType, setContentType] = useState<'VIDEO' | 'REPORT'>('VIDEO')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [areaFilter, setAreaFilter] = useState('')
  const [uploadError, setUploadError] = useState('')
  const queryClient = useQueryClient()

  const { data: sections } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await tagsApi.getAll()
      return res.data as Tag[]
    },
  })

  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos', search, areaFilter],
    queryFn: async () => {
      const res = await videosApi.getAll({
        q: search || undefined,
        tagKey: areaFilter || undefined,
      })
      return res.data
    },
  })

  const { data: loadDistribution } = useQuery({
    queryKey: ['videos-load-distribution'],
    queryFn: async () => {
      const res = await videosApi.getLoadDistribution()
      return res.data as { total: number; sections: { key: string; label: string; percentage: number }[] }
    },
  })

  const onUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['videos'] })
    queryClient.invalidateQueries({ queryKey: ['videos-load-distribution'] })
    queryClient.invalidateQueries({ queryKey: ['progress-summary'] })
    setShowModal(false)
    setSelectedTagIds([])
    setContentType('VIDEO')
    setUploadError('')
  }

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await videosApi.create(data)
      return res.data
    },
    onSuccess: onUploadSuccess,
  })

  const uploadMutation = useMutation({
    mutationFn: async ({ file, fields }: { file: File; fields: Record<string, any> }) => {
      const res = await videosApi.uploadFile(file, fields)
      return res.data
    },
    onSuccess: onUploadSuccess,
    onError: (err: any) => {
      setUploadError(err.response?.data?.message || 'No se pudo subir el video. Probá con un archivo más liviano.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await videosApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      queryClient.invalidateQueries({ queryKey: ['videos-load-distribution'] })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploadError('')
    const formData = new FormData(e.currentTarget)

    if (contentType === 'VIDEO') {
      const file = formData.get('file') as File
      if (!file || file.size === 0) {
        setUploadError('Elegí un archivo de video')
        return
      }
      uploadMutation.mutate({
        file,
        fields: {
          title: formData.get('title'),
          description: formData.get('description') || undefined,
          feedback: formData.get('feedback') || undefined,
          tagIds: selectedTagIds,
        },
      })
      return
    }

    createMutation.mutate({
      type: contentType,
      title: formData.get('title'),
      description: formData.get('description'),
      feedback: formData.get('feedback') || undefined,
      status: 'READY',
      tagIds: selectedTagIds,
    })
  }

  const isSubmitting = createMutation.isPending || uploadMutation.isPending

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Videos e Informes</h1>
          <p className="text-gray-600">Organizados por área de trabajo (Metodología Alonso49)</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Subir Video / Informe
        </Button>
      </div>

      {loadDistribution && loadDistribution.total > 0 && (
        <Card className="mb-6" title="Distribución de carga por área">
          <div className="space-y-2">
            {loadDistribution.sections
              .filter((s) => s.percentage > 0)
              .map((s) => (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 w-48 shrink-0">{s.label}</span>
                  <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 rounded-full" style={{ width: `${s.percentage}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">{s.percentage}%</span>
                </div>
              ))}
            {loadDistribution.sections.every((s) => s.percentage === 0) && (
              <p className="text-sm text-gray-500">Todavía no hay contenido etiquetado por área.</p>
            )}
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título, descripción o feedback..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent sm:w-64"
          >
            <option value="">Todas las áreas</option>
            {sections?.map((section) => (
              <optgroup key={section.id} label={section.label}>
                <option value={section.key}>{section.label} (toda la sección)</option>
                {section.children?.map((child) => (
                  <option key={child.id} value={child.key}>
                    {child.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando...</p>
        </div>
      ) : videos && videos.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video: any) => (
            <Card key={video.id}>
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {video.type === 'REPORT' ? (
                  <FileText className="h-12 w-12 text-gray-400" />
                ) : video.url ? (
                  <video src={video.url} controls className="w-full h-full object-cover bg-black" />
                ) : (
                  <Play className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                  {video.type === 'REPORT' ? 'Informe' : 'Video'}
                </span>
              </div>
              <h3 className="font-semibold mb-2">{video.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{video.description}</p>
              {video.feedback && (
                <p className="text-sm text-red-700 bg-red-50 rounded p-2 mb-2">{video.feedback}</p>
              )}
              {video.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {video.tags.map((vt: any) => (
                    <span key={vt.tagId} className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                      {vt.tag.label}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">{video.status}</span>
                <button
                  onClick={() => deleteMutation.mutate(video.id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No hay videos ni informes que coincidan</p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Subir contenido
            </Button>
          </div>
        </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Subir Video o Informe</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setContentType('VIDEO')}
                    className={`flex-1 px-3 py-2 rounded-lg border ${contentType === 'VIDEO' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-300 text-gray-600'}`}
                  >
                    Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType('REPORT')}
                    className={`flex-1 px-3 py-2 rounded-lg border ${contentType === 'REPORT' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-300 text-gray-600'}`}
                  >
                    Informe (sin video)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  name="description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              {contentType === 'VIDEO' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Archivo de video</label>
                  <input
                    name="file"
                    type="file"
                    accept="video/*"
                    required
                    className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo 200MB.</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback (qué estuvo bien / qué mejorar)
                </label>
                <textarea
                  name="feedback"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Áreas / etiquetas (Metodología Alonso49)
                </label>
                <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-3">
                  {sections?.map((section) => (
                    <div key={section.id}>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{section.label}</p>
                      <div className="flex flex-wrap gap-1">
                        {section.children?.map((child) => (
                          <button
                            type="button"
                            key={child.id}
                            onClick={() => toggleTag(child.id)}
                            className={`text-xs px-2 py-1 rounded-full border ${
                              selectedTagIds.includes(child.id)
                                ? 'bg-red-600 text-white border-red-600'
                                : 'border-gray-300 text-gray-600'
                            }`}
                          >
                            {child.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}

              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Subiendo...' : 'Subir'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
