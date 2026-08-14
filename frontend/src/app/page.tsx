import Link from 'next/link'
import { Anchor, Video, Users, BookOpen } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Anchor className="h-8 w-8 text-red-600" />
              <span className="text-2xl font-bold text-gray-900">Alonso49</span>
            </div>
            <div className="flex gap-4">
              <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            Plataforma de Alto Rendimiento para Vela Olímpica
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistema de entrenamiento avanzado para la clase 49er con análisis de video, 
            seguimiento de rendimiento y coaching personalizado.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <FeatureCard
            icon={<Video className="h-12 w-12 text-red-600" />}
            title="Videos de Entrenamiento"
            description="Sube y analiza videos de tus sesiones en el agua"
          />
          <FeatureCard
            icon={<Users className="h-12 w-12 text-red-600" />}
            title="Gestión de Equipos"
            description="Organiza tu equipo y recibe coaching personalizado"
          />
          <FeatureCard
            icon={<BookOpen className="h-12 w-12 text-red-600" />}
            title="Cursos Especializados"
            description="Accede a contenido educativo de alto nivel"
          />
          <FeatureCard
            icon={<Anchor className="h-12 w-12 text-red-600" />}
            title="Análisis de Rendimiento"
            description="Métricas detalladas y feedback continuo"
          />
        </div>

        <div className="bg-red-600 text-white rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para llevar tu entrenamiento al siguiente nivel?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a la plataforma de entrenamiento más avanzada para vela olímpica
          </p>
          <Link href="/register" className="inline-block px-8 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50">
            Comenzar Ahora
          </Link>
        </div>
      </main>

      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 Alonso49. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
