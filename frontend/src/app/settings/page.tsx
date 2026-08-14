'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { usersApi } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const inputClass =
  'w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent'

export default function SettingsPage() {
  const { user, token, setAuth } = useAuthStore()

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  })
  const [profileStatus, setProfileStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [profileError, setProfileError] = useState('')

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [passwordError, setPasswordError] = useState('')

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileStatus('saving')
    setProfileError('')
    try {
      const res = await usersApi.updateProfile(profile)
      if (user && token) {
        setAuth({ ...user, firstName: res.data.firstName, lastName: res.data.lastName }, token)
      }
      setProfileStatus('saved')
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'No se pudo actualizar el perfil')
      setProfileStatus('error')
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (passwords.next !== passwords.confirm) {
      setPasswordError('Las contraseñas nuevas no coinciden')
      setPasswordStatus('error')
      return
    }

    setPasswordStatus('saving')
    try {
      await usersApi.changePassword({ currentPassword: passwords.current, newPassword: passwords.next })
      setPasswords({ current: '', next: '', confirm: '' })
      setPasswordStatus('saved')
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'No se pudo cambiar la contraseña')
      setPasswordStatus('error')
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
        <p className="text-muted-foreground">Editá tu perfil y preferencias de la cuenta</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card title="Perfil">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Nombre</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Apellido</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Correo electrónico
              </label>
              <input type="email" value={user?.email || ''} disabled className={`${inputClass} opacity-60`} />
            </div>

            {profileError && <p className="text-sm text-destructive">{profileError}</p>}
            {profileStatus === 'saved' && <p className="text-sm text-green-600">Perfil actualizado.</p>}

            <Button type="submit" disabled={profileStatus === 'saving'}>
              {profileStatus === 'saving' ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </form>
        </Card>

        <Card title="Contraseña">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Contraseña actual
              </label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={passwords.next}
                  onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                  className={inputClass}
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className={inputClass}
                  minLength={6}
                  required
                />
              </div>
            </div>

            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            {passwordStatus === 'saved' && <p className="text-sm text-green-600">Contraseña actualizada.</p>}

            <Button type="submit" disabled={passwordStatus === 'saving'}>
              {passwordStatus === 'saving' ? 'Guardando...' : 'Cambiar contraseña'}
            </Button>
          </form>
        </Card>

        <Card title="Tema">
          <p className="text-sm text-muted-foreground mb-4">
            Elegí cómo se ve la app. &quot;Sistema&quot; sigue la preferencia de tu computadora.
          </p>
          <ThemeToggle />
        </Card>
      </div>
    </DashboardLayout>
  )
}
