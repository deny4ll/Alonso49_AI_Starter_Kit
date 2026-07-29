'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { videosApi } from '@/lib/api'
import { Plus, Play, Trash2 } from 'lucide-react'

export default function VideosPage() {
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const res = await videosApi.getAll()
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await videosApi.create(data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      setShowModal(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await videosApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createMutation.mutate({
      title: formData.get('title'),
      description: formData.get('description'),
      url: formData.get('url'),
      status: 'READY',
    })
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Videos</h1>
          <p className="text-gray-600">Gestiona tus videos de entrenamiento</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Subir Video
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando videos...</p>
        </div>
      ) : videos && videos.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video: any) => (
            <Card key={video.id}>
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <Play className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="font-semibold mb-2">{video.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{video.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                  {video.status}
                </span>
                <button
                  onClick={() => deleteMutation.mutate(video.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
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
            <p className="text-gray-500 mb-4">No hay videos aún</p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Subir tu primer video
            </Button>
          </div>
        </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Subir Video</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del video
                </label>
                <input
                  name="url"
                  type="url"
                  required
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Subiendo...' : 'Subir Video'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
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
