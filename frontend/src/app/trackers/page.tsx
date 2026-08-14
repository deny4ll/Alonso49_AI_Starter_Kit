'use client'

import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { trackersApi } from '@/lib/api'
import { parseTrackFile } from '@/lib/gpsParser'
import { Upload, Gauge, Clock, Ruler, Map as MapIcon } from 'lucide-react'

const TrackMap = dynamic(() => import('@/components/TrackMap'), { ssr: false })

function formatDuration(seconds?: number) {
  if (!seconds) return '--'
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

export default function TrackersPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { data: tracks, isLoading } = useQuery({
    queryKey: ['trackers'],
    queryFn: async () => {
      const res = await trackersApi.getAll()
      return res.data
    },
  })

  const { data: selectedTrack } = useQuery({
    queryKey: ['tracker', selectedId],
    queryFn: async () => {
      const res = await trackersApi.getOne(selectedId as string)
      return res.data
    },
    enabled: !!selectedId,
  })

  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await trackersApi.create(data)
      return res.data
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['trackers'] })
      setSelectedId(created.id)
      setError(null)
    },
    onError: () => setError('No se pudo subir el tracker. Verificá el formato del archivo (GPX o CSV).'),
  })

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const points = parseTrackFile(file.name, text)

    if (points.length < 2) {
      setError('No se pudieron leer al menos 2 puntos GPS del archivo.')
      e.target.value = ''
      return
    }

    uploadMutation.mutate({
      source: file.name.toLowerCase().endsWith('.gpx') ? 'GPX' : 'CSV',
      originalFileName: file.name,
      points,
    })
    e.target.value = ''
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Trackers GPS</h1>
          <p className="text-gray-600">Sube el recorrido de tus sesiones (GPX/CSV) y visualízalo en el mapa</p>
        </div>
        <div>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
            <Upload className="h-4 w-4 mr-2" />
            {uploadMutation.isPending ? 'Subiendo...' : 'Subir tracker'}
          </Button>
          <input ref={fileInputRef} type="file" accept=".gpx,.csv" className="hidden" onChange={handleFile} />
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {isLoading && <p className="text-gray-500">Cargando trackers...</p>}
          {tracks && tracks.length === 0 && (
            <Card>
              <div className="text-center py-8">
                <MapIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Todavía no subiste ningún tracker GPS.</p>
              </div>
            </Card>
          )}
          {tracks?.map((track: any) => (
            <Card
              key={track.id}
              className={`cursor-pointer transition-colors ${selectedId === track.id ? 'ring-2 ring-red-500' : ''}`}
            >
              <div onClick={() => setSelectedId(track.id)}>
                <p className="font-semibold mb-1">{track.originalFileName || track.source || 'Tracker'}</p>
                <p className="text-xs text-gray-500 mb-3">
                  {track.startedAt ? new Date(track.startedAt).toLocaleString() : ''}
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
                    <p className="text-xs text-gray-500">{track.maxSpeed ?? '--'} kn max</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          <Card className="h-[500px] p-0 overflow-hidden">
            {selectedTrack?.points?.length ? (
              <TrackMap points={selectedTrack.points} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Seleccioná un tracker para ver el recorrido en el mapa
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
