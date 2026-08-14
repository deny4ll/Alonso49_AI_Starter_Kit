'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { analyticsApi, progressApi } from '@/lib/api'
import { TrendingUp, Activity, Target, Bot, Waves, Moon } from 'lucide-react'

interface BenchmarkDraft {
  averageSpeed: string
  maxSpeed: string
  tackingEfficiency: string
  performanceScore: string
  daysOnWaterPerMonth: string
}

const EMPTY_BENCHMARK_DRAFT: BenchmarkDraft = {
  averageSpeed: '',
  maxSpeed: '',
  tackingEfficiency: '',
  performanceScore: '',
  daysOnWaterPerMonth: '',
}

export default function AnalyticsPage() {
  const queryClient = useQueryClient()
  const [bigPictureDraft, setBigPictureDraft] = useState('')
  const [editingBigPicture, setEditingBigPicture] = useState(false)
  const [benchmarkDraft, setBenchmarkDraft] = useState<BenchmarkDraft>(EMPTY_BENCHMARK_DRAFT)
  const [editingBenchmark, setEditingBenchmark] = useState(false)

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const res = await analyticsApi.getMyStats()
      return res.data
    },
  })

  const { data: progress } = useQuery({
    queryKey: ['progress-summary'],
    queryFn: async () => {
      const res = await progressApi.getSummary()
      return res.data as { teamId: string | null; scope: string }
    },
  })

  const teamId = progress?.teamId

  const { data: comparison } = useQuery({
    queryKey: ['team-comparison', teamId],
    queryFn: async () => {
      const res = await analyticsApi.getComparison(teamId as string)
      return res.data
    },
    enabled: !!teamId,
  })

  const { data: bigPicture } = useQuery({
    queryKey: ['big-picture', teamId],
    queryFn: async () => {
      const res = await analyticsApi.getBigPicture(teamId as string)
      return res.data
    },
    enabled: !!teamId,
  })

  useEffect(() => {
    setBigPictureDraft(bigPicture?.content || '')
  }, [bigPicture])

  useEffect(() => {
    const b = comparison?.benchmark
    setBenchmarkDraft({
      averageSpeed: b?.averageSpeed?.toString() ?? '',
      maxSpeed: b?.maxSpeed?.toString() ?? '',
      tackingEfficiency: b?.tackingEfficiency?.toString() ?? '',
      performanceScore: b?.performanceScore?.toString() ?? '',
      daysOnWaterPerMonth: b?.daysOnWaterPerMonth?.toString() ?? '',
    })
  }, [comparison])

  const saveBigPictureMutation = useMutation({
    mutationFn: async () => {
      await analyticsApi.upsertBigPicture(teamId as string, bigPictureDraft)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['big-picture', teamId] })
      setEditingBigPicture(false)
    },
  })

  const saveBenchmarkMutation = useMutation({
    mutationFn: async () => {
      const toNumber = (v: string) => (v === '' ? undefined : Number(v))
      await analyticsApi.upsertBenchmark(teamId as string, {
        averageSpeed: toNumber(benchmarkDraft.averageSpeed),
        maxSpeed: toNumber(benchmarkDraft.maxSpeed),
        tackingEfficiency: toNumber(benchmarkDraft.tackingEfficiency),
        performanceScore: toNumber(benchmarkDraft.performanceScore),
        daysOnWaterPerMonth: toNumber(benchmarkDraft.daysOnWaterPerMonth),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-comparison', teamId] })
      setEditingBenchmark(false)
    },
  })

  const metrics = [
    { name: 'Días de agua', value: stats?.daysOnWater ?? 0, icon: Waves, color: 'blue' },
    { name: 'Promedio mensual', value: stats?.monthlyAvgDaysOnWater ?? 0, icon: TrendingUp, color: 'green' },
    { name: 'Días de descanso', value: stats?.restDays ?? 0, icon: Moon, color: 'purple' },
    { name: 'Horas con AI Coach', value: stats?.aiCoachHours ?? 0, icon: Bot, color: 'orange' },
  ]

  const colors: Record<string, string> = {
    blue: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  const comparisonRows = comparison
    ? [
        { label: 'Velocidad media (nudos)', actual: comparison.actual.averageSpeed, target: comparison.benchmark?.averageSpeed },
        { label: 'Velocidad máxima (nudos)', actual: comparison.actual.maxSpeed, target: comparison.benchmark?.maxSpeed },
        {
          label: 'Eficiencia de viradas (%)',
          actual: comparison.actual.tackingEfficiency,
          target: comparison.benchmark?.tackingEfficiency,
        },
        {
          label: 'Score de rendimiento',
          actual: comparison.actual.performanceScore,
          target: comparison.benchmark?.performanceScore,
        },
      ]
    : []

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Estadísticas</h1>
        <p className="text-gray-600">Analiza tu rendimiento y progreso</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-100 text-red-600">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats?.sessions ?? 0}</div>
          <div className="text-sm text-gray-600">Total Sesiones</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <Target className="h-6 w-6" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats?.videos ?? 0}</div>
          <div className="text-sm text-gray-600">Total Videos</div>
        </Card>
        {metrics.slice(0, 2).map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.name}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colors[metric.color]}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.name}</div>
            </Card>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {metrics.slice(2).map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.name}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${colors[metric.color]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.name}</div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {teamId ? (
        <Card className="mb-6" title="Progreso del equipo vs. Equipo Target AI">
          {editingBenchmark ? (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Velocidad media objetivo (nudos)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={benchmarkDraft.averageSpeed}
                    onChange={(e) => setBenchmarkDraft((d) => ({ ...d, averageSpeed: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Velocidad máxima objetivo (nudos)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={benchmarkDraft.maxSpeed}
                    onChange={(e) => setBenchmarkDraft((d) => ({ ...d, maxSpeed: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Eficiencia de viradas objetivo (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={benchmarkDraft.tackingEfficiency}
                    onChange={(e) => setBenchmarkDraft((d) => ({ ...d, tackingEfficiency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Score de rendimiento objetivo</label>
                  <input
                    type="number"
                    step="0.1"
                    value={benchmarkDraft.performanceScore}
                    onChange={(e) => setBenchmarkDraft((d) => ({ ...d, performanceScore: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Días de agua/mes objetivo</label>
                  <input
                    type="number"
                    step="0.1"
                    value={benchmarkDraft.daysOnWaterPerMonth}
                    onChange={(e) => setBenchmarkDraft((d) => ({ ...d, daysOnWaterPerMonth: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => saveBenchmarkMutation.mutate()} disabled={saveBenchmarkMutation.isPending}>
                  Guardar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingBenchmark(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : comparison?.benchmark ? (
            <div className="space-y-3">
              {comparisonRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm text-gray-700">{row.label}</span>
                  <span className="text-sm">
                    <span className="font-semibold">{row.actual ?? '--'}</span>
                    <span className="text-gray-400"> / objetivo {row.target ?? '--'}</span>
                  </span>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => setEditingBenchmark(true)}>
                Editar benchmark
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-3">Todavía no hay un benchmark configurado para este equipo.</p>
              <Button size="sm" variant="outline" onClick={() => setEditingBenchmark(true)}>
                Configurar benchmark
              </Button>
            </div>
          )}
        </Card>
      ) : null}

      {teamId ? (
        <Card title="Big Picture: resumen del progreso del equipo">
          {editingBigPicture ? (
            <div className="space-y-3">
              <textarea
                value={bigPictureDraft}
                onChange={(e) => setBigPictureDraft(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Resumen cualitativo del progreso del equipo a la fecha..."
              />
              <div className="flex gap-2">
                <Button onClick={() => saveBigPictureMutation.mutate()} disabled={saveBigPictureMutation.isPending}>
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setEditingBigPicture(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-700 whitespace-pre-wrap mb-4">
                {bigPicture?.content || 'Todavía no hay un resumen. Agregá el análisis "Big Picture" del equipo.'}
              </p>
              <Button variant="outline" onClick={() => setEditingBigPicture(true)}>
                {bigPicture?.content ? 'Editar' : 'Escribir resumen'}
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-gray-500">
            El benchmark de equipo y el resumen &quot;Big Picture&quot; están disponibles cuando el atleta pertenece a un
            equipo.
          </p>
        </Card>
      )}
    </DashboardLayout>
  )
}
