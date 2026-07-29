'use client'

import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { api } from '@/lib/api'
import { TrendingUp, TrendingDown, Activity, Target, Wind, Waves } from 'lucide-react'

export default function AnalyticsPage() {
  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const res = await api.get('/analytics/users/me/stats')
      return res.data
    },
  })

  const metrics = [
    { name: 'Total Sesiones', value: stats?.sessions || 0, icon: Activity, color: 'blue' },
    { name: 'Total Videos', value: stats?.videos || 0, icon: Target, color: 'green' },
    { name: 'Rendimiento', value: '--', icon: TrendingUp, color: 'purple' },
    { name: 'Progreso', value: '--', icon: TrendingUp, color: 'orange' },
  ]

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Estadísticas</h1>
        <p className="text-gray-600">Analiza tu rendimiento y progreso</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon
          const colors: Record<string, string> = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600',
          }
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

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Rendimiento por Sesión">
          <div className="py-8 text-center text-gray-500">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>Completa sesiones para ver estadísticas</p>
          </div>
        </Card>

        <Card title="Condiciones de Entrenamiento">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <Wind className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Viento Promedio</span>
              </div>
              <span className="text-gray-600">-- nudos</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <Waves className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Ola Promedio</span>
              </div>
              <span className="text-gray-600">-- m</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Progreso Semanal">
          <div className="py-8 text-center text-gray-500">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>Los datos de progreso aparecerán aquí</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
