'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { analyticsApi, progressApi } from '@/lib/api'
import { TrendingUp, Activity, Target, Bot, Waves, Moon, Gauge } from 'lucide-react'
import { useT } from '@/lib/i18n/useT'

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
  const t = useT()
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
    { name: t('analytics.metrics.daysOnWater'), value: stats?.daysOnWater ?? 0, icon: Waves, color: 'blue' },
    {
      name: t('analytics.metrics.monthlyAvg'),
      value: stats?.monthlyAvgDaysOnWater ?? 0,
      icon: TrendingUp,
      color: 'green',
    },
    { name: t('analytics.metrics.restDays'), value: stats?.restDays ?? 0, icon: Moon, color: 'purple' },
    { name: t('analytics.metrics.aiCoachHours'), value: stats?.aiCoachHours ?? 0, icon: Bot, color: 'orange' },
  ]

  const colors: Record<string, string> = {
    blue: 'bg-red-100 text-red-600',
    green: 'bg-red-100 text-red-800',
    purple: 'bg-red-50 text-red-500',
    orange: 'bg-red-200 text-red-700',
  }

  const comparisonRows = comparison
    ? [
        {
          label: t('analytics.benchmark.rows.averageSpeed'),
          actual: comparison.actual.averageSpeed,
          target: comparison.benchmark?.averageSpeed,
        },
        {
          label: t('analytics.benchmark.rows.maxSpeed'),
          actual: comparison.actual.maxSpeed,
          target: comparison.benchmark?.maxSpeed,
        },
        {
          label: t('analytics.benchmark.rows.tackingEfficiency'),
          actual: comparison.actual.tackingEfficiency,
          target: comparison.benchmark?.tackingEfficiency,
        },
        {
          label: t('analytics.benchmark.rows.performanceScore'),
          actual: comparison.actual.performanceScore,
          target: comparison.benchmark?.performanceScore,
        },
      ]
    : []

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('analytics.header.title')}</h1>
        <p className="text-gray-600">{t('analytics.header.subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-100 text-red-600">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats?.sessions ?? 0}</div>
          <div className="text-sm text-gray-600">{t('analytics.cards.totalSessions')}</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-50 text-red-500">
              <Target className="h-6 w-6" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats?.videos ?? 0}</div>
          <div className="text-sm text-gray-600">{t('analytics.cards.totalVideos')}</div>
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

      <Card className="mb-6" title={t('analytics.gps.title')}>
        {stats?.gpsTracksCount ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-100 text-red-600">
                <Gauge className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.bestMaxSpeed ?? '--'} kn</div>
                <div className="text-sm text-gray-600">{t('analytics.gps.maxSpeed')}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-50 text-red-500">
                <Gauge className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.bestAverageSpeed ?? '--'} kn</div>
                <div className="text-sm text-gray-600">{t('analytics.gps.bestAverageSpeed')}</div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            {t('analytics.gps.emptyPrefix')}{' '}
            <a href="/trackers" className="text-red-600 hover:underline">
              {t('analytics.gps.emptyLinkText')}
            </a>{' '}
            {t('analytics.gps.emptySuffix')}
          </p>
        )}
      </Card>

      {teamId ? (
        <Card className="mb-6" title={t('analytics.benchmark.title')}>
          {editingBenchmark ? (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('analytics.benchmark.fields.averageSpeed')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={benchmarkDraft.averageSpeed}
                    onChange={(e) => setBenchmarkDraft((d) => ({ ...d, averageSpeed: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('analytics.benchmark.fields.maxSpeed')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={benchmarkDraft.maxSpeed}
                    onChange={(e) => setBenchmarkDraft((d) => ({ ...d, maxSpeed: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('analytics.benchmark.fields.tackingEfficiency')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={benchmarkDraft.tackingEfficiency}
                    onChange={(e) => setBenchmarkDraft((d) => ({ ...d, tackingEfficiency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('analytics.benchmark.fields.performanceScore')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={benchmarkDraft.performanceScore}
                    onChange={(e) => setBenchmarkDraft((d) => ({ ...d, performanceScore: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t('analytics.benchmark.fields.daysOnWaterPerMonth')}
                  </label>
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
                  {t('analytics.benchmark.save')}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingBenchmark(false)}>
                  {t('analytics.benchmark.cancel')}
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
                    <span className="text-gray-400">
                      {' '}
                      / {t('analytics.benchmark.targetLabel')} {row.target ?? '--'}
                    </span>
                  </span>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => setEditingBenchmark(true)}>
                {t('analytics.benchmark.edit')}
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-3">{t('analytics.benchmark.empty')}</p>
              <Button size="sm" variant="outline" onClick={() => setEditingBenchmark(true)}>
                {t('analytics.benchmark.configure')}
              </Button>
            </div>
          )}
        </Card>
      ) : null}

      {teamId ? (
        <Card title={t('analytics.bigPicture.title')}>
          {editingBigPicture ? (
            <div className="space-y-3">
              <textarea
                value={bigPictureDraft}
                onChange={(e) => setBigPictureDraft(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder={t('analytics.bigPicture.placeholder')}
              />
              <div className="flex gap-2">
                <Button onClick={() => saveBigPictureMutation.mutate()} disabled={saveBigPictureMutation.isPending}>
                  {t('analytics.bigPicture.save')}
                </Button>
                <Button variant="outline" onClick={() => setEditingBigPicture(false)}>
                  {t('analytics.bigPicture.cancel')}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-700 whitespace-pre-wrap mb-4">
                {bigPicture?.content || t('analytics.bigPicture.empty')}
              </p>
              <Button variant="outline" onClick={() => setEditingBigPicture(true)}>
                {bigPicture?.content ? t('analytics.bigPicture.edit') : t('analytics.bigPicture.write')}
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-gray-500">{t('analytics.bigPicture.noTeam')}</p>
        </Card>
      )}
    </DashboardLayout>
  )
}
