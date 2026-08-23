'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { sessionsApi } from '@/lib/api'
import { Plus, Calendar, MapPin, Wind, Waves, Clock, UserCheck, Video as VideoIcon, Pencil } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

function formatWindRange(min?: number | null, max?: number | null) {
  if (min == null && max == null) return null
  if (min == null) return `${max}`
  if (max == null) return `${min}`
  if (min === max) return `${min}`
  return `${min}-${max}`
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return ''
  const d = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SCHEDULED: 'bg-red-100 text-red-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  SCHEDULED: 'Planificada',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
}

export default function SessionsPage() {
  const [showModal, setShowModal] = useState(false)
  const [editingSession, setEditingSession] = useState<any | null>(null)
  const queryClient = useQueryClient()

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await sessionsApi.getAll()
      return res.data
    },
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['sessions'] })
  }

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await sessionsApi.create(data)
      return res.data
    },
    onSuccess: () => {
      invalidate()
      setShowModal(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await sessionsApi.update(id, data)
      return res.data
    },
    onSuccess: () => {
      invalidate()
      setEditingSession(null)
    },
  })

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const windSpeedMin = formData.get('windSpeedMin') as string
    const windSpeedMax = formData.get('windSpeedMax') as string
    const waveHeight = formData.get('waveHeight') as string
    const scheduledAt = formData.get('scheduledAt') as string
    createMutation.mutate({
      title: formData.get('title'),
      description: formData.get('description') || undefined,
      location: formData.get('location') || undefined,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      windSpeedMin: windSpeedMin ? Number(windSpeedMin) : undefined,
      windSpeedMax: windSpeedMax ? Number(windSpeedMax) : windSpeedMin ? Number(windSpeedMin) : undefined,
      windDirection: formData.get('windDirection') || undefined,
      waveHeight: waveHeight ? Number(waveHeight) : undefined,
      status: 'SCHEDULED',
    })
  }

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingSession) return
    const formData = new FormData(e.currentTarget)
    const windSpeedMin = formData.get('windSpeedMin') as string
    const windSpeedMax = formData.get('windSpeedMax') as string
    const waveHeight = formData.get('waveHeight') as string
    const durationHours = formData.get('durationHours') as string
    const scheduledAt = formData.get('scheduledAt') as string
    const startedAt = formData.get('startedAt') as string
    const completedAt = formData.get('completedAt') as string
    const status = formData.get('status') as string

    updateMutation.mutate({
      id: editingSession.id,
      data: {
        title: formData.get('title'),
        description: formData.get('description') || undefined,
        location: formData.get('location') || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        startedAt: startedAt ? new Date(startedAt).toISOString() : undefined,
        completedAt: completedAt ? new Date(completedAt).toISOString() : undefined,
        windSpeedMin: windSpeedMin ? Number(windSpeedMin) : undefined,
        windSpeedMax: windSpeedMax ? Number(windSpeedMax) : windSpeedMin ? Number(windSpeedMin) : undefined,
        windDirection: formData.get('windDirection') || undefined,
        waveHeight: waveHeight ? Number(waveHeight) : undefined,
        durationHours: durationHours ? Number(durationHours) : undefined,
        coachOnWater: formData.get('coachOnWater') === 'on',
        status,
      },
    })
  }

  const markCompleted = (session: any) => {
    updateMutation.mutate({
      id: session.id,
      data: { status: 'COMPLETED', completedAt: session.completedAt || new Date().toISOString() },
    })
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
          {sessions.map((session: any) => {
            const windRange = formatWindRange(session.windSpeedMin, session.windSpeedMax)
            const mediaCount = session.videos?.length ?? 0
            return (
              <Card key={session.id}>
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setEditingSession(session)}
                  >
                    <h3 className="text-lg font-semibold mb-2 hover:text-red-600">{session.title}</h3>
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
                      {windRange && (
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4" />
                          {windRange} nudos {session.windDirection}
                        </div>
                      )}
                      {session.waveHeight != null && (
                        <div className="flex items-center gap-2">
                          <Waves className="h-4 w-4" />
                          {session.waveHeight} m
                        </div>
                      )}
                      {session.durationHours != null && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {session.durationHours} h
                        </div>
                      )}
                      {session.coachOnWater && (
                        <div className="flex items-center gap-2 text-red-700">
                          <UserCheck className="h-4 w-4" />
                          Soporte coach en agua
                        </div>
                      )}
                      <Link
                        href={`/videos?sessionId=${session.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`flex items-center gap-2 ${mediaCount > 0 ? 'text-red-600 hover:underline' : 'text-gray-400'}`}
                      >
                        <VideoIcon className="h-4 w-4" />
                        {mediaCount > 0 ? `${mediaCount} video(s)/informe(s)` : 'Sin video/informe'}
                      </Link>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[session.status]}`}>
                      {statusLabels[session.status] || session.status}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingSession(session)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        title="Editar sesión"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {session.status !== 'COMPLETED' && session.status !== 'CANCELLED' && (
                        <Button size="sm" variant="outline" onClick={() => markCompleted(session)}>
                          Marcar completada
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Nueva Sesión</h2>
            <p className="text-sm text-gray-500 mb-4">Planificá lo que tenés pensado hacer. Después vas a poder editarla con lo que realmente se hizo.</p>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Viento (nudos)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="windSpeedMin"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Mín. ej. 10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <input
                    name="windSpeedMax"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Máx. ej. 13"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
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

      {editingSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-1">Editar Sesión</h2>
            <p className="text-sm text-gray-500 mb-4">Actualizá con lo que realmente pasó en el agua y marcá el estado.</p>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  name="title"
                  type="text"
                  required
                  defaultValue={editingSession.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingSession.description || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                <input
                  name="location"
                  type="text"
                  defaultValue={editingSession.location || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  name="status"
                  defaultValue={editingSession.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha planificada</label>
                <input
                  name="scheduledAt"
                  type="datetime-local"
                  defaultValue={toDateTimeLocal(editingSession.scheduledAt)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salida al agua</label>
                  <input
                    name="startedAt"
                    type="datetime-local"
                    defaultValue={toDateTimeLocal(editingSession.startedAt)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vuelta</label>
                  <input
                    name="completedAt"
                    type="datetime-local"
                    defaultValue={toDateTimeLocal(editingSession.completedAt)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Viento real (nudos)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="windSpeedMin"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Mín."
                    defaultValue={editingSession.windSpeedMin ?? ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <input
                    name="windSpeedMax"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Máx."
                    defaultValue={editingSession.windSpeedMax ?? ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <input
                    name="windDirection"
                    type="text"
                    defaultValue={editingSession.windDirection || ''}
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
                    defaultValue={editingSession.waveHeight ?? ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horas</label>
                  <input
                    name="durationHours"
                    type="number"
                    step="0.25"
                    min="0"
                    placeholder="2"
                    defaultValue={editingSession.durationHours ?? ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  name="coachOnWater"
                  type="checkbox"
                  defaultChecked={!!editingSession.coachOnWater}
                  className="rounded border-gray-300"
                />
                Hubo soporte de coach en el agua
              </label>

              <div className="flex gap-3">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingSession(null)}>
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
