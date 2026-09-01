'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { usersApi } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { useT } from '@/lib/i18n/useT'

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
  const t = useT()
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
        setAthleteProfileError(t('settings.athlete.kpisInvalid'))
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
      setAthleteProfileError(err.response?.data?.message || t('settings.athlete.error'))
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
      setProfileError(err.response?.data?.message || t('settings.profile.error'))
      setProfileStatus('error')
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (passwords.next !== passwords.confirm) {
      setPasswordError(t('settings.password.mismatch'))
      setPasswordStatus('error')
      return
    }

    setPasswordStatus('saving')
    try {
      await usersApi.changePassword({ currentPassword: passwords.current, newPassword: passwords.next })
      setPasswords({ current: '', next: '', confirm: '' })
      setPasswordStatus('saved')
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || t('settings.password.error'))
      setPasswordStatus('error')
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card title={t('settings.profile.cardTitle')}>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">{t('settings.profile.firstName')}</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">{t('settings.profile.lastName')}</label>
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
                {t('settings.profile.email')}
              </label>
              <input type="email" value={user?.email || ''} disabled className={`${inputClass} opacity-60`} />
            </div>

            {profileError && <p className="text-sm text-destructive">{profileError}</p>}
            {profileStatus === 'saved' && <p className="text-sm text-green-600">{t('settings.profile.saved')}</p>}

            <Button type="submit" disabled={profileStatus === 'saving'}>
              {profileStatus === 'saving' ? t('settings.profile.saving') : t('settings.profile.save')}
            </Button>
          </form>
        </Card>

        {user?.role === 'ATHLETE' && (
          <Card title={t('settings.athlete.cardTitle')}>
            {athleteProfileStatus === 'loading' ? (
              <p className="text-sm text-muted-foreground">{t('settings.athlete.loading')}</p>
            ) : (
              <form onSubmit={handleAthleteProfileSubmit} className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">{t('settings.athlete.physical')}</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">{t('settings.athlete.weight')}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={athleteProfile.weight}
                        onChange={(e) => setAthleteProfile({ ...athleteProfile, weight: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">{t('settings.athlete.height')}</label>
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
                        {t('settings.athlete.birthDate')}
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
                  <h3 className="text-sm font-semibold text-foreground mb-3">{t('settings.athlete.sportive')}</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        {t('settings.athlete.sailNumber')}
                      </label>
                      <input
                        type="text"
                        value={athleteProfile.sailNumber}
                        onChange={(e) => setAthleteProfile({ ...athleteProfile, sailNumber: e.target.value })}
                        className={inputClass}
                        placeholder={t('settings.athlete.sailNumberPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">{t('settings.athlete.position')}</label>
                      <input
                        type="text"
                        value={athleteProfile.position}
                        onChange={(e) => setAthleteProfile({ ...athleteProfile, position: e.target.value })}
                        className={inputClass}
                        placeholder={t('settings.athlete.positionPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        {t('settings.athlete.experienceLevel')}
                      </label>
                      <select
                        value={athleteProfile.experienceLevel}
                        onChange={(e) => setAthleteProfile({ ...athleteProfile, experienceLevel: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">{t('settings.athlete.experienceUndefined')}</option>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">{t('settings.athlete.nationality')}</label>
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
                  <h3 className="text-sm font-semibold text-foreground mb-3">{t('settings.athlete.planning')}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        {t('settings.athlete.seasonGoal')}
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
                          {t('settings.athlete.currentMicrocycle')}
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
                          {t('settings.athlete.todayObjective')}
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
                        {t('settings.athlete.weeklyObjectives')}
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
                        {t('settings.athlete.kpisLabel')}
                      </label>
                      <textarea
                        value={athleteProfile.kpis}
                        onChange={(e) => setAthleteProfile({ ...athleteProfile, kpis: e.target.value })}
                        className={`${inputClass} font-mono text-sm`}
                        rows={3}
                        placeholder={t('settings.athlete.kpisPlaceholder')}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">{t('settings.athlete.competitionTeam')}</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        {t('settings.athlete.nextEvent')}
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
                        {t('settings.athlete.boatSetup')}
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
                  <p className="text-sm text-green-600">{t('settings.athlete.saved')}</p>
                )}

                <Button type="submit" disabled={athleteProfileStatus === 'saving'}>
                  {athleteProfileStatus === 'saving' ? t('settings.athlete.saving') : t('settings.athlete.save')}
                </Button>
              </form>
            )}
          </Card>
        )}

        <Card title={t('settings.password.cardTitle')}>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {t('settings.password.current')}
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
                  {t('settings.password.new')}
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
                  {t('settings.password.confirm')}
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
            {passwordStatus === 'saved' && <p className="text-sm text-green-600">{t('settings.password.saved')}</p>}

            <Button type="submit" disabled={passwordStatus === 'saving'}>
              {passwordStatus === 'saving' ? t('settings.password.saving') : t('settings.password.save')}
            </Button>
          </form>
        </Card>

        <Card title={t('settings.theme.cardTitle')}>
          <p className="text-sm text-muted-foreground mb-4">
            {t('settings.theme.description')}
          </p>
          <ThemeToggle />
        </Card>
      </div>
    </DashboardLayout>
  )
}
