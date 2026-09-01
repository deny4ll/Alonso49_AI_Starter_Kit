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
import { useT } from '@/lib/i18n/useT'

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

export default function SessionsPage() {
  const t = useT()
  const [showModal, setShowModal] = useState(false)
  const [editingSession, setEditingSession] = useState<any | null>(null)
  const queryClient = useQueryClient()

  const statusLabels: Record<string, string> = {
    DRAFT: t('sessions.status.draft'),
    SCHEDULED: t('sessions.status.scheduled'),
    IN_PROGRESS: t('sessions.status.inProgress'),
    COMPLETED: t('sessions.status.completed'),
    CANCELLED: t('sessions.status.cancelled'),
  }

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
          <h1 className="text-3xl font-bold mb-2">{t('sessions.title')}</h1>
          <p className="text-gray-600">{t('sessions.subtitle')}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('sessions.newSession')}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('sessions.loading')}</p>
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
                          {windRange} {t('sessions.windUnit')} {session.windDirection}
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
                          {t('sessions.coachOnWaterBadge')}
                        </div>
                      )}
                      <Link
                        href={`/videos?sessionId=${session.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`flex items-center gap-2 ${mediaCount > 0 ? 'text-red-600 hover:underline' : 'text-gray-400'}`}
                      >
                        <VideoIcon className="h-4 w-4" />
                        {mediaCount > 0 ? `${mediaCount} ${t('sessions.mediaCount')}` : t('sessions.noMedia')}
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
                        title={t('sessions.editSessionTitle')}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {session.status !== 'COMPLETED' && session.status !== 'CANCELLED' && (
                        <Button size="sm" variant="outline" onClick={() => markCompleted(session)}>
                          {t('sessions.markCompleted')}
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
            <p className="text-gray-500 mb-4">{t('sessions.empty.title')}</p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('sessions.empty.cta')}
            </Button>
          </div>
        </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{t('sessions.modal.createTitle')}</h2>
            <p className="text-sm text-gray-500 mb-4">{t('sessions.modal.createSubtitle')}</p>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('sessions.form.titleLabel')}
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder={t('sessions.form.titlePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('sessions.form.descriptionLabel')}
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder={t('sessions.form.descriptionPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('sessions.form.locationLabel')}
                </label>
                <input
                  name="location"
                  type="text"
                  placeholder={t('sessions.form.locationPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('sessions.form.scheduledAtLabel')}
                </label>
                <input
                  name="scheduledAt"
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('sessions.form.windLabel')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="windSpeedMin"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder={t('sessions.form.windMinPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <input
                    name="windSpeedMax"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder={t('sessions.form.windMaxPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('sessions.form.windDirectionLabel')}</label>
                  <input
                    name="windDirection"
                    type="text"
                    placeholder="NE"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('sessions.form.waveHeightLabel')}</label>
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
                  {createMutation.isPending ? t('sessions.form.creating') : t('sessions.form.create')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-1">{t('sessions.modal.editTitle')}</h2>
            <p className="text-sm text-gray-500 mb-4">{t('sessions.modal.editSubtitle')}</p>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('sessions.form.titleLabel')}</label>
                <input
                  name="title"
                  type="text"
                  required
                  defaultValue={editingSession.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('sessions.form.descriptionLabel')}</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingSession.description || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('sessions.form.locationLabel')}</label>
                <input
                  name="location"
                  type="text"
                  defaultValue={editingSession.location || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('sessions.form.statusLabel')}</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('sessions.form.scheduledAtPlannedLabel')}</label>
                <input
                  name="scheduledAt"
                  type="datetime-local"
                  defaultValue={toDateTimeLocal(editingSession.scheduledAt)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('sessions.form.startedAtLabel')}</label>
                  <input
                    name="startedAt"
                    type="datetime-local"
                    defaultValue={toDateTimeLocal(editingSession.startedAt)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('sessions.form.completedAtLabel')}</label>
                  <input
                    name="completedAt"
                    type="datetime-local"
                    defaultValue={toDateTimeLocal(editingSession.completedAt)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('sessions.form.windRealLabel')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="windSpeedMin"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder={t('sessions.form.windRealMinPlaceholder')}
                    defaultValue={editingSession.windSpeedMin ?? ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <input
                    name="windSpeedMax"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder={t('sessions.form.windRealMaxPlaceholder')}
                    defaultValue={editingSession.windSpeedMax ?? ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('sessions.form.windDirectionLabel')}</label>
                  <input
                    name="windDirection"
                    type="text"
                    defaultValue={editingSession.windDirection || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('sessions.form.waveHeightLabel')}</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('sessions.form.durationHoursLabel')}</label>
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
                {t('sessions.form.coachOnWaterLabel')}
              </label>

              <div className="flex gap-3">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? t('sessions.form.saving') : t('sessions.form.save')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingSession(null)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
