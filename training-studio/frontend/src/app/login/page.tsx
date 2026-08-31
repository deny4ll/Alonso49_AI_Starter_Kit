'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authApi.login(email, password)
      const { user, accessToken } = response.data
      setAuth(user, accessToken)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center">
              <GraduationCap className="h-9 w-9 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Training Studio</h1>
          <p className="text-muted-foreground mt-2">Entrena el conocimiento del AI Coach</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card shadow-lg rounded-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? 'Iniciando sesión…' : 'Iniciar Sesión'}
          </Button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Acceso solo para entrenadores autorizados. Este es un módulo independiente de la
            plataforma principal Sailvex.
          </p>
        </form>
      </div>
    </div>
  )
}
