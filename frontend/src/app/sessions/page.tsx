'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { sessionsApi } from '@/lib/api'
import { Plus, Calendar, MapPin, Wind, Waves } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function SessionsPage() {
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await sessionsApi.getAll()
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await sessionsApi.create(data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      setShowModal(false)
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const windSpeed = formData.get('windSpeed') as string
    const waveHeight = formData.get('waveHeight') as string
    const scheduledAt = formData.get('scheduledAt') as string
    createMutation.mutate({
      title: formData.get('title'),
      description: formData.get('description') || undefined,
      location: formData.get('location') || undefined,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      windSpeed: windSpeed ? Number(windSpeed) : undefined,
      windDirection: formData.get('windDirection') || undefined,
      waveHeight: waveHeight ? Number(waveHeight) : undefined,
      status: 'SCHEDULED',
    })
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SCHEDULED: 'bg-red-100 text-red-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Sesiones</h1>
          <p className="text-gray-600">Planifica y gestiona tus sesiones de entrenamiento</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Sesión
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando sesiones...</p>
        </div>
      ) : sessions && sessions.length > 0 ? (
        <div className="grid gap-4">
          {sessions.map((session: any) => (
            <Card key={session.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{session.title}</h3>
                  <p className="text-gray-600 mb-4">{session.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {session.scheduledAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDateTime(session.scheduledAt)}
                      </div>
                    )}
                    {session.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {session.location}
                      </div>
                    )}
                    {session.windSpeed && (
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4" />
                        {session.windSpeed} nudos {session.windDirection}
                      </div>
                    )}
                    {session.waveHeight && (
                      <div className="flex items-center gap-2">
                        <Waves className="h-4 w-4" />
                        {session.waveHeight} m
                      </div>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[session.status]}`}>
                  {session.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No hay sesiones programadas</p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear tu primera sesión
            </Button>
          </div>
        </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card text-card-foreground rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Nueva Sesión</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="Ej: Entrenamiento de tacking"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Describe los objetivos de la sesión..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación
                </label>
                <input
                  name="location"
                  type="text"
                  placeholder="Ej: Bahía de Santander"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y hora
                </label>
                <input
                  name="scheduledAt"
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Viento (nudos)</label>
                  <input
                    name="windSpeed"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <input
                    name="windDirection"
                    type="text"
                    placeholder="NE"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Olas (m)</label>
                  <input
                    name="waveHeight"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creando...' : 'Crear Sesión'}
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
