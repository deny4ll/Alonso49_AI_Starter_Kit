'use client'

import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { coursesApi } from '@/lib/api'
import { BookOpen, Clock, DollarSign } from 'lucide-react'

export default function CoursesPage() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await coursesApi.getAll()
      return res.data
    },
  })

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cursos</h1>
        <p className="text-gray-600">Explora y accede a cursos de alto rendimiento</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando cursos...</p>
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <Card key={course.id}>
              <div className="aspect-video bg-gradient-to-br from-red-500 to-red-700 rounded-lg mb-4 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{course.modules?.length || 0} módulos</span>
                </div>
                <div className="flex items-center gap-1 text-lg font-bold text-red-600">
                  <DollarSign className="h-5 w-5" />
                  {course.price === 0 ? 'Gratis' : course.price}
                </div>
              </div>
              <Button className="w-full">
                {course.price === 0 ? 'Acceder' : 'Inscribirse'}
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No hay cursos disponibles en este momento</p>
            <p className="text-sm text-gray-400">Pronto habrá contenido educativo disponible</p>
          </div>
        </Card>
      )}
    </DashboardLayout>
  )
}
