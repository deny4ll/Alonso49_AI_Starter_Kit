'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Video, Calendar, BookOpen, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()

  useEffect(() => {
    if (!token) {
      router.push('/login')
    }
  }, [token, router])

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

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Bienvenido, {user.firstName}
        </h1>
        <p className="text-gray-600">
          Panel de control - Rol: {user.role}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Video className="h-8 w-8 text-blue-600" />}
          title="Videos"
          value={stats?.videos || 0}
          description="Videos subidos"
        />
        <StatCard
          icon={<Calendar className="h-8 w-8 text-green-600" />}
          title="Sesiones"
          value={stats?.sessions || 0}
          description="Sesiones completadas"
        />
        <StatCard
          icon={<BookOpen className="h-8 w-8 text-purple-600" />}
          title="Cursos"
          value="0"
          description="Cursos activos"
        />
        <StatCard
          icon={<TrendingUp className="h-8 w-8 text-orange-600" />}
          title="Rendimiento"
          value="--"
          description="Score promedio"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Sesiones Recientes">
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
              No hay sesiones recientes
            </p>
          )}
        </Card>

        <Card title="Videos Recientes">
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
              No hay videos recientes
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>{icon}</div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </div>
  )
}
