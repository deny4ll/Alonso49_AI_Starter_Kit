'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { usersApi } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const inputClass =
  'w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent'

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite']

const emptyAthleteProfile = {
  weight: '',
  height: '',
  birthDate: '',
  sailNumber: '',
  position: '',
  experienceLevel: '',
  nationality: '',
  seasonGoal: '',
  currentMicrocycle: '',
  weeklyObjectives: '',
  todayObjective: '',
  kpis: '',
  nextEvent: '',
  boatSetup: '',
}

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

  const [athleteProfile, setAthleteProfile] = useState(emptyAthleteProfile)
  const [athleteProfileStatus, setAthleteProfileStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>(
    user?.role === 'ATHLETE' ? 'loading' : 'idle',
  )
  const [athleteProfileError, setAthleteProfileError] = useState('')

  useEffect(() => {
    if (user?.role !== 'ATHLETE') return
    usersApi
      .getAthleteProfile()
      .then((res) => {
        const p = res.data
        if (!p) {
          setAthleteProfileStatus('idle')
          return
        }
        setAthleteProfile({
          weight: p.weight ?? '',
          height: p.height ?? '',
          birthDate: p.birthDate ? p.birthDate.slice(0, 10) : '',
          sailNumber: p.sailNumber ?? '',
          position: p.position ?? '',
          experienceLevel: p.experienceLevel ?? '',
          nationality: p.nationality ?? '',
          seasonGoal: p.seasonGoal ?? '',
          currentMicrocycle: p.currentMicrocycle ?? '',
          weeklyObjectives: p.weeklyObjectives ?? '',
          todayObjective: p.todayObjective ?? '',
          kpis: p.kpis ? JSON.stringify(p.kpis, null, 2) : '',
          nextEvent: p.nextEvent ?? '',
          boatSetup: p.boatSetup ?? '',
        })
        setAthleteProfileStatus('idle')
      })
      .catch(() => setAthleteProfileStatus('idle'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role])

  const handleAthleteProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAthleteProfileError('')

    let kpis: Record<string, unknown> | undefined
    if (athleteProfile.kpis.trim()) {
      try {
        kpis = JSON.parse(athleteProfile.kpis)
      } catch {
        setAthleteProfileError('Los KPIs deben ser un JSON válido, ej: {"vmg": 6.2}')
        setAthleteProfileStatus('error')
        return
      }
    }

    setAthleteProfileStatus('saving')
    try {
      await usersApi.updateAthleteProfile({
        weight: athleteProfile.weight ? Number(athleteProfile.weight) : undefined,
        height: athleteProfile.height ? Number(athleteProfile.height) : undefined,
        birthDate: athleteProfile.birthDate || undefined,
        sailNumber: athleteProfile.sailNumber || undefined,
        position: athleteProfile.position || undefined,
        experienceLevel: athleteProfile.experienceLevel || undefined,
        nationality: athleteProfile.nationality || undefined,
        seasonGoal: athleteProfile.seasonGoal || undefined,
        currentMicrocycle: athleteProfile.currentMicrocycle || undefined,
        weeklyObjectives: athleteProfile.weeklyObjectives || undefined,
        todayObjective: athleteProfile.todayObjective || undefined,
        kpis,
        nextEvent: athleteProfile.nextEvent || undefined,
        boatSetup: athleteProfile.boatSetup || undefined,
      })
      setAthleteProfileStatus('saved')
    } catch (err: any) {
      setAthleteProfileError(err.response?.data?.message || 'No se pudo actualizar el perfil de atleta')
      setAthleteProfileStatus('error')
    }
  }

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

        {user?.role === 'ATHLETE' && (
          <Card title="Datos de Atleta">
            {athleteProfileStatus === 'loading' ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : (
              <form onSubmit={handleAthleteProfileSubmit} className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Físico</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Peso (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={athleteProfile.weight}
                        onChange={(e) => setAthleteProfile({ ...athleteProfile, weight: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Altura (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={athleteProfile.height}
                        onChange={(e) => setAthleteProfile({ ...athleteProfile, height: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Fecha de nacimiento
                      </label>
                      <input
                        type="date"
                        value={athleteProfile.birthDate}
                        onChange={(e) => setAthleteProfile({ ...athleteProfile, birthDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Deportivo</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Número de vela
                      </label>
                      <input
                        type="text"
                        value={athleteProfile.sailNumber}
                        onChange={(e) => setAthleteProfile({ ...athleteProfile, sailNumber: e.target.value })}
                        className={inputClass}
                        placeholder="Ej: ARG-49"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Posición</label>
                      <input
                        type="text"
                        value={athleteProfile.position}
                        onChange={(e) => setAthleteProfile({ ...athleteProfile, position: e.target.value })}
                        className={inputClass}
                        placeholder="Ej: Helm, Crew"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Nivel de experiencia
                      </label>
                      <select
                        value={athleteProfile.experienceLevel}
                        onChange={(e) => setAthleteProfile({ ...athleteProfile, experienceLevel: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">Sin definir</option>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Nacionalidad</label>
                      <input
                        type="text"
                        value={athleteProfile.nationality}
                        onChange={(e) => setAthleteProfile({ ...athleteProfile, nationality: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Planificación</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Objetivo de temporada
                      </label>
                      <input
                        type="text"
                        value={athleteProfile.seasonGoal}
                        onChange={(e) => setAthleteProfile({ ...athleteProfile, seasonGoal: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Microciclo actual
                        </label>
                        <input
                          type="text"
                          value={athleteProfile.currentMicrocycle}
                          onChange={(e) =>
                            setAthleteProfile({ ...athleteProfile, currentMicrocycle: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Foco de hoy
                        </label>
                        <input
                          type="text"
                          value={athleteProfile.todayObjective}
                          onChange={(e) => setAthleteProfile({ ...athleteProfile, todayObjective: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Objetivos de la semana
                      </label>
                      <textarea
                        value={athleteProfile.weeklyObjectives}
                        onChange={(e) => setAthleteProfile({ ...athleteProfile, weeklyObjectives: e.target.value })}
                        className={inputClass}
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        KPIs (formato JSON)
                      </label>
                      <textarea
                        value={athleteProfile.kpis}
                        onChange={(e) => setAthleteProfile({ ...athleteProfile, kpis: e.target.value })}
                        className={`${inputClass} font-mono text-sm`}
                        rows={3}
                        placeholder='{"vmg": 6.2, "tackingEfficiency": 0.85}'
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Competición y Equipo</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Próximo evento
                      </label>
                      <input
                        type="text"
                        value={athleteProfile.nextEvent}
                        onChange={(e) => setAthleteProfile({ ...athleteProfile, nextEvent: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Setup del barco
                      </label>
                      <input
                        type="text"
                        value={athleteProfile.boatSetup}
                        onChange={(e) => setAthleteProfile({ ...athleteProfile, boatSetup: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {athleteProfileError && <p className="text-sm text-destructive">{athleteProfileError}</p>}
                {athleteProfileStatus === 'saved' && (
                  <p className="text-sm text-green-600">Perfil de atleta actualizado.</p>
                )}

                <Button type="submit" disabled={athleteProfileStatus === 'saving'}>
                  {athleteProfileStatus === 'saving' ? 'Guardando...' : 'Guardar datos de atleta'}
                </Button>
              </form>
            )}
          </Card>
        )}

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
