'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { teamsApi, progressApi, videosApi, sessionsApi, trackersApi } from '@/lib/api'
import { nivelBandClasses, NivelReadout } from '@/components/progress/Nivel'
import { formatDateTime } from '@/lib/utils'
import { useT } from '@/lib/i18n/useT'
import {
  ArrowLeft,
  Users as UsersIcon,
  Video as VideoIcon,
  Calendar,
  Map as MapIcon,
  Target,
  ChevronDown,
  ChevronRight,
  Ruler,
  Clock,
  Gauge,
} from 'lucide-react'

const TrackMap = dynamic(() => import('@/components/TrackMap'), { ssr: false })

function formatDuration(seconds?: number) {
  if (!seconds) return '--'
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SCHEDULED: 'bg-red-100 text-red-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function TeamDetailPage() {
  const t = useT()
  const params = useParams()
  const teamId = params.id as string
  const [expandedSection, setExpandedSection] = useState<Set<string>>(new Set())
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)

  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const res = await teamsApi.getOne(teamId)
      return res.data
    },
  })

  const { data: progress } = useQuery({
    queryKey: ['progress-summary', teamId],
    queryFn: async () => {
      const res = await progressApi.getSummary(teamId)
      return res.data as {
        totalEntries: number
        sections: {
          id: string
          label: string
          entries: number
          nivel: number | null
          nivelDelta: number | null
          subsections: { id: string; label: string; entries: number; nivel: number | null; nivelDelta: number | null }[]
        }[]
      }
    },
  })

  const { data: sessions } = useQuery({
    queryKey: ['sessions', teamId],
    queryFn: async () => {
      const res = await sessionsApi.getAll(teamId)
      return res.data
    },
  })

  const { data: videos } = useQuery({
    queryKey: ['videos', 'team', teamId],
    queryFn: async () => {
      const res = await videosApi.getAll({ teamId })
      return res.data
    },
  })

  const { data: tracks } = useQuery({
    queryKey: ['trackers', 'team', teamId],
    queryFn: async () => {
      const res = await trackersApi.getAll({ teamId })
      return res.data
    },
  })

  const { data: selectedTrack } = useQuery({
    queryKey: ['tracker', selectedTrackId],
    queryFn: async () => {
      const res = await trackersApi.getOne(selectedTrackId as string)
      return res.data
    },
    enabled: !!selectedTrackId,
  })

  const maxEntries = Math.max(1, ...(progress?.sections.map((s) => s.entries) || [1]))

  const toggleSection = (id: string) => {
    setExpandedSection((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <DashboardLayout>
      <Link href="/teams" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" />
        {t('teamDetail.backLink')}
      </Link>

      {teamLoading ? (
        <p className="text-gray-500">{t('teamDetail.loading')}</p>
      ) : !team ? (
        <p className="text-gray-500">{t('teamDetail.notFound')}</p>
      ) : (
        <>
          <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-red-100 rounded-lg">
                  <UsersIcon className="h-6 w-6 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold">{team.name}</h1>
                {team.isActive && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">{t('teamDetail.activeBadge')}</span>
                )}
              </div>
              {team.description && <p className="text-gray-600">{team.description}</p>}
            </div>

            <div className="flex flex-wrap gap-2 max-w-md">
              {team.members?.map((m: any) => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-sm"
                >
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-semibold flex items-center justify-center">
                    {m.user?.firstName?.[0]}
                    {m.user?.lastName?.[0]}
                  </span>
                  {m.user?.firstName} {m.user?.lastName}
                </span>
              ))}
              {!team.members?.length && (
                <span className="text-sm text-gray-500">{t('teamDetail.noMembers')}</span>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-red-100 text-red-600">
                  <VideoIcon className="h-6 w-6" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{videos?.length ?? 0}</div>
              <div className="text-sm text-gray-600">{t('teamDetail.stats.videosReports')}</div>
            </Card>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-red-100 text-red-800">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{sessions?.length ?? 0}</div>
              <div className="text-sm text-gray-600">{t('teamDetail.stats.sessions')}</div>
            </Card>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-red-50 text-red-500">
                  <MapIcon className="h-6 w-6" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{tracks?.length ?? 0}</div>
              <div className="text-sm text-gray-600">{t('teamDetail.stats.trackers')}</div>
            </Card>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-red-200 text-red-700">
                  <Target className="h-6 w-6" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{progress?.totalEntries ?? 0}</div>
              <div className="text-sm text-gray-600">{t('teamDetail.stats.progressEntries')}</div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold mb-3">{t('teamDetail.recentSessions.title')}</h2>
              <div className="space-y-3">
                {sessions && sessions.length > 0 ? (
                  sessions.slice(0, 5).map((session: any) => (
                    <Card key={session.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{session.title}</p>
                          {session.scheduledAt && (
                            <p className="text-xs text-gray-500 mt-1">{formatDateTime(session.scheduledAt)}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded shrink-0 ${statusColors[session.status] || 'bg-gray-100 text-gray-800'}`}>
                          {t(`teamDetail.sessionStatus.${session.status}`)}
                        </span>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <p className="text-sm text-gray-500 text-center py-6">{t('teamDetail.recentSessions.empty')}</p>
                  </Card>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">{t('teamDetail.recentVideos.title')}</h2>
              <div className="space-y-3">
                {videos && videos.length > 0 ? (
                  videos.slice(0, 5).map((video: any) => (
                    <Card key={video.id}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <VideoIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{video.title}</p>
                          <p className="text-xs text-gray-500 truncate">{video.uploadedBy?.firstName} {video.uploadedBy?.lastName}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <p className="text-sm text-gray-500 text-center py-6">{t('teamDetail.recentVideos.empty')}</p>
                  </Card>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">{t('teamDetail.trackersSection.title')}</h2>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-3">
                {tracks && tracks.length === 0 && (
                  <Card>
                    <p className="text-sm text-gray-500 text-center py-6">{t('teamDetail.trackersSection.empty')}</p>
                  </Card>
                )}
                {tracks?.map((track: any) => (
                  <Card
                    key={track.id}
                    className={`cursor-pointer transition-colors ${selectedTrackId === track.id ? 'ring-2 ring-red-500' : ''}`}
                  >
                    <div onClick={() => setSelectedTrackId(track.id)}>
                      <p className="font-semibold mb-1 truncate">{track.originalFileName || track.source || t('teamDetail.trackersSection.fallbackName')}</p>
                      <p className="text-xs text-gray-500 mb-3">
                        {track.uploadedBy?.firstName} {track.uploadedBy?.lastName}
                        {track.startedAt ? ` · ${new Date(track.startedAt).toLocaleDateString()}` : ''}
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <Ruler className="h-4 w-4 text-red-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">{Math.round((track.distanceMeters || 0) / 100) / 10} km</p>
                        </div>
                        <div>
                          <Clock className="h-4 w-4 text-red-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">{formatDuration(track.durationSeconds)}</p>
                        </div>
                        <div>
                          <Gauge className="h-4 w-4 text-red-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">{track.maxSpeed ?? '--'} {t('teamDetail.trackersSection.maxSpeedSuffix')}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="lg:col-span-2">
                <Card className="h-[400px] p-0 overflow-hidden">
                  {selectedTrack?.points?.length ? (
                    <TrackMap points={selectedTrack.points} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      {t('teamDetail.trackersSection.mapPlaceholder')}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">{t('teamDetail.progressByArea.title')}</h2>
            <div className="space-y-3">
              {progress?.sections.map((section) => {
                const isOpen = expandedSection.has(section.id)
                const pct = Math.round((section.entries / maxEntries) * 100)
                return (
                  <Card key={section.id}>
                    <button
                      className="w-full flex items-center justify-between text-left gap-4"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center gap-2">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="font-semibold">{section.label}</span>
                      </div>
                      <div className="flex items-center gap-5 shrink-0">
                        <NivelReadout nivel={section.nivel} delta={section.nivelDelta} />
                        <span className="text-sm text-gray-600">{section.entries} {t('teamDetail.progressByArea.entriesSuffix')}</span>
                      </div>
                    </button>
                    <div className="mt-3 space-y-1.5">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        {section.nivel != null && (
                          <div
                            className={`h-full rounded-full ${nivelBandClasses(section.nivel).bar}`}
                            style={{ width: `${section.nivel * 10}%` }}
                          />
                        )}
                      </div>
                    </div>
                    {isOpen && (
                      <div className="mt-4 space-y-2 pl-6 border-l-2 border-gray-100">
                        {section.subsections.map((sub) => {
                          const subPct = Math.round((sub.entries / maxEntries) * 100)
                          return (
                            <div key={sub.id} className="flex items-center justify-between gap-4">
                              <span className="text-sm text-gray-700">{sub.label}</span>
                              <div className="flex items-center gap-4 shrink-0">
                                <NivelReadout nivel={sub.nivel} delta={sub.nivelDelta} />
                                <div className="flex items-center gap-2 w-[140px]">
                                  <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${subPct}%` }} />
                                  </div>
                                  <span className="text-xs text-gray-500 w-6 text-right">{sub.entries}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
