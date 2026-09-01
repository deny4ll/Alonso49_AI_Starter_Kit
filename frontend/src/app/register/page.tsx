'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { useT } from '@/lib/i18n/useT'
import { LanguageToggle } from '@/components/ui/LanguageToggle'

export default function RegisterPage() {
  const t = useT()
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'ATHLETE',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authApi.register(formData)
      const { user, accessToken } = response.data

      setAuth(user, accessToken)

      await new Promise(resolve => setTimeout(resolve, 100))

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || t('register.defaultError'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="flex justify-end mb-4">
          <LanguageToggle />
        </div>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo-mark-512.png" alt="SAILVEX" className="h-16 w-16 rounded-lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t('register.title')}</h1>
          <p className="text-gray-600 mt-2">{t('register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                {t('register.firstName')}
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                {t('register.lastName')}
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('register.email')}
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('register.password')}
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
              minLength={6}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              {t('register.role')}
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="ATHLETE">{t('register.roleAthlete')}</option>
              <option value="COACH">{t('register.roleCoach')}</option>
              <option value="ACADEMY">{t('register.roleAcademy')}</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('register.submitting') : t('register.submit')}
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            {t('register.haveAccount')}{' '}
            <Link href="/login" className="text-red-600 hover:underline">
              {t('register.loginLink')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
