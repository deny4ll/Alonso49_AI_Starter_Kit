'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Video, Calendar, BookOpen, TrendingUp } from 'lucide-react'
import { api, videosApi } from '@/lib/api'
import { useT } from '@/lib/i18n/useT'

export default function DashboardPage() {
  const t = useT()
  const router = useRouter()
  const { user, token, isHydrated, initAuth } = useAuthStore()

  useEffect(() => {
    if (!isHydrated) {
      initAuth()
    }
  }, [isHydrated, initAuth])

  useEffect(() => {
    if (isHydrated && !token) {
      router.push('/login')
    }
  }, [isHydrated, token, router])

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const res = await api.get('/analytics/users/me/stats')
      return res.data
    },
    enabled: !!token,
  })

  const { data: sessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await api.get('/sessions')
      return res.data
    },
    enabled: !!token,
  })

  const { data: videos } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const res = await api.get('/videos')
      return res.data
    },
    enabled: !!token,
  })

  const { data: loadDistribution } = useQuery({
    queryKey: ['videos-load-distribution'],
    queryFn: async () => {
      const res = await videosApi.getLoadDistribution()
      return res.data as { total: number; sections: { key: string; label: string; percentage: number }[] }
    },
    enabled: !!token,
  })

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!token || !user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t('dashboard.welcome')}, {user.firstName}
        </h1>
        <p className="text-gray-600">
          {t('dashboard.roleLabel')}: {user.role}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Video className="h-8 w-8 text-red-600" />}
          title={t('dashboard.stats.videos.title')}
          value={stats?.videos || 0}
          description={t('dashboard.stats.videos.description')}
        />
        <StatCard
          icon={<Calendar className="h-8 w-8 text-red-500" />}
          title={t('dashboard.stats.sessions.title')}
          value={stats?.sessions || 0}
          description={t('dashboard.stats.sessions.description')}
        />
        <StatCard
          icon={<BookOpen className="h-8 w-8 text-red-800" />}
          title={t('dashboard.stats.courses.title')}
          value="0"
          description={t('dashboard.stats.courses.description')}
        />
        <StatCard
          icon={<TrendingUp className="h-8 w-8 text-red-400" />}
          title={t('dashboard.stats.performance.title')}
          value="--"
          description={t('dashboard.stats.performance.description')}
        />
      </div>

      {loadDistribution && loadDistribution.total > 0 && (
        <Card className="mb-8" title={t('dashboard.loadDistribution.title')}>
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
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card title={t('dashboard.recentSessions.title')}>
          {sessions && sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session: any) => (
                <div key={session.id} className="p-3 border rounded-lg hover:bg-gray-50">
                  <h3 className="font-medium">{session.title}</h3>
                  <p className="text-sm text-gray-500">{session.status}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              {t('dashboard.recentSessions.empty')}
            </p>
          )}
        </Card>

        <Card title={t('dashboard.recentVideos.title')}>
          {videos && videos.length > 0 ? (
            <div className="space-y-3">
              {videos.slice(0, 5).map((video: any) => (
                <div key={video.id} className="p-3 border rounded-lg hover:bg-gray-50">
                  <h3 className="font-medium">{video.title}</h3>
                  <p className="text-sm text-gray-500">{video.status}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              {t('dashboard.recentVideos.empty')}
            </p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ icon, title, value, description }: {
  icon: React.ReactNode
  title: string
  value: string | number
  description: string
}) {
  return (
    <div className="bg-card text-card-foreground rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>{icon}</div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </div>
  )
}
