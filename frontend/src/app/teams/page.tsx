'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { teamsApi, analyticsApi } from '@/lib/api'
import { Plus, Users as UsersIcon, User, Scale } from 'lucide-react'
import { useT } from '@/lib/i18n/useT'

export default function TeamsPage() {
  const t = useT()

  const METRIC_ROWS: { key: string; label: string; format: (v: any) => string }[] = [
    { key: 'sessionsTotal', label: t('teams.metrics.sessionsTotal'), format: (v) => `${v ?? 0}` },
    { key: 'sessionsCompleted', label: t('teams.metrics.sessionsCompleted'), format: (v) => `${v ?? 0}` },
    { key: 'videos', label: t('teams.metrics.videos'), format: (v) => `${v ?? 0}` },
    { key: 'trainingDays', label: t('teams.metrics.trainingDays'), format: (v) => `${v ?? 0}` },
    { key: 'restDays', label: t('teams.metrics.restDays'), format: (v) => `${v ?? 0}` },
    { key: 'aiCoachHours', label: t('teams.metrics.aiCoachHours'), format: (v) => `${v ?? 0} h` },
  ]

  const [showModal, setShowModal] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([])
  const queryClient = useQueryClient()

  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await teamsApi.getAll()
      return res.data
    },
  })

  const { data: comparison, isLoading: isComparing } = useQuery({
    queryKey: ['teams-compare', selectedTeamIds],
    queryFn: async () => {
      const res = await analyticsApi.compareTeams(selectedTeamIds)
      return res.data as { team: { id: string; name: string }; stats: Record<string, any> & { workAreas: { key: string; label: string; percentage: number }[] } }[]
    },
    enabled: selectedTeamIds.length >= 2,
  })

  const toggleTeamSelection = (id: string) => {
    setSelectedTeamIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  const exitCompareMode = () => {
    setCompareMode(false)
    setSelectedTeamIds([])
  }

  const allAreaKeys = Array.from(
    new Set((comparison || []).flatMap((c) => c.stats.workAreas.map((a) => a.key))),
  )
  const areaLabelByKey = new Map(
    (comparison || []).flatMap((c) => c.stats.workAreas.map((a) => [a.key, a.label] as const)),
  )

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await teamsApi.create(data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      setShowModal(false)
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createMutation.mutate({
      name: formData.get('name'),
      description: formData.get('description'),
      isActive: true,
    })
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('teams.title')}</h1>
          <p className="text-gray-600">{t('teams.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant={compareMode ? 'secondary' : 'outline'} onClick={() => (compareMode ? exitCompareMode() : setCompareMode(true))}>
            <Scale className="h-4 w-4 mr-2" />
            {compareMode ? t('teams.compare.exit') : t('teams.compare.enter')}
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('teams.newTeam')}
          </Button>
        </div>
      </div>

      {compareMode && (
        <Card className="mb-6">
          <p className="text-sm text-gray-600">
            {t('teams.compare.banner')}{' '}
            {selectedTeamIds.length > 0 && (
              <span className="font-medium text-gray-800">{selectedTeamIds.length} {t('teams.compare.selectedSuffix')}</span>
            )}
          </p>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('teams.loading')}</p>
        </div>
      ) : teams && teams.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team: any) => {
            const selected = selectedTeamIds.includes(team.id)
            const cardContent = (
              <Card
                className={`h-full transition-shadow ${compareMode ? 'cursor-pointer' : 'hover:shadow-md cursor-pointer'} ${selected ? 'ring-2 ring-red-500' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <UsersIcon className="h-6 w-6 text-red-600" />
                  </div>
                  {compareMode ? (
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleTeamSelection(team.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-5 w-5 rounded border-gray-300"
                    />
                  ) : (
                    team.isActive && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {t('teams.active')}
                      </span>
                    )
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">{team.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{team.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>{team.members?.length || 0} {t('teams.membersCount')}</span>
                </div>
              </Card>
            )
            return compareMode ? (
              <div key={team.id} onClick={() => toggleTeamSelection(team.id)}>
                {cardContent}
              </div>
            ) : (
              <Link key={team.id} href={`/teams/${team.id}`}>
                {cardContent}
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{t('teams.empty')}</p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('teams.createFirst')}
            </Button>
          </div>
        </Card>
      )}

      {compareMode && selectedTeamIds.length >= 2 && (
        <Card className="mt-8" title={t('teams.compare.cardTitle')}>
          {isComparing ? (
            <p className="text-gray-500 text-center py-6">{t('teams.compare.calculating')}</p>
          ) : comparison && comparison.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 font-medium text-gray-500">{t('teams.compare.metric')}</th>
                    {comparison.map((c) => (
                      <th key={c.team.id} className="text-left py-2 px-4 font-semibold">{c.team.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {METRIC_ROWS.map((row) => (
                    <tr key={row.key} className="border-b border-gray-100">
                      <td className="py-2 pr-4 text-gray-600">{row.label}</td>
                      {comparison.map((c) => (
                        <td key={c.team.id} className="py-2 px-4">{row.format(c.stats[row.key])}</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="py-3 pr-4 text-gray-600 font-medium align-top">{t('teams.compare.workAreaPercentage')}</td>
                    {comparison.map((c) => (
                      <td key={c.team.id} className="py-3 px-4 align-top">
                        <div className="space-y-1.5 min-w-[160px]">
                          {allAreaKeys.map((key) => {
                            const area = c.stats.workAreas.find((a) => a.key === key)
                            const pct = area?.percentage ?? 0
                            return (
                              <div key={key}>
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-0.5">
                                  <span>{areaLabelByKey.get(key)}</span>
                                  <span>{pct}%</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-red-600 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">{t('teams.compare.failed')}</p>
          )}
        </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card text-card-foreground rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">{t('teams.modal.title')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('teams.modal.nameLabel')}
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder={t('teams.modal.namePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('teams.modal.descriptionLabel')}
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder={t('teams.modal.descriptionPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? t('teams.modal.creating') : t('teams.modal.create')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  {t('teams.modal.cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
