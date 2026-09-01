'use client'

import Link from 'next/link'
import { Anchor, Video, Users, BookOpen } from 'lucide-react'
import { useT } from '@/lib/i18n/useT'
import { LanguageToggle } from '@/components/ui/LanguageToggle'

export default function HomePage() {
  const t = useT()

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo-mark-512.png" alt="SAILVEX" className="h-9 w-9 rounded" />
              <span className="text-2xl font-bold text-gray-900">SAILVEX</span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900">
                {t('home.nav.login')}
              </Link>
              <Link href="/register" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                {t('home.nav.register')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            {t('home.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('home.hero.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <FeatureCard
            icon={<Video className="h-12 w-12 text-red-600" />}
            title={t('home.features.videos.title')}
            description={t('home.features.videos.description')}
          />
          <FeatureCard
            icon={<Users className="h-12 w-12 text-red-600" />}
            title={t('home.features.teams.title')}
            description={t('home.features.teams.description')}
          />
          <FeatureCard
            icon={<BookOpen className="h-12 w-12 text-red-600" />}
            title={t('home.features.courses.title')}
            description={t('home.features.courses.description')}
          />
          <FeatureCard
            icon={<Anchor className="h-12 w-12 text-red-600" />}
            title={t('home.features.analytics.title')}
            description={t('home.features.analytics.description')}
          />
        </div>

        <div className="bg-red-600 text-white rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t('home.cta.subtitle')}
          </p>
          <Link href="/register" className="inline-block px-8 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50">
            {t('home.cta.button')}
          </Link>
        </div>
      </main>

      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 SAILVEX. {t('home.footer.rights')}</p>
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
