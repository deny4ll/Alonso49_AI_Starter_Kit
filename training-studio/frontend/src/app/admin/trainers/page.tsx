'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, ShieldCheck, ShieldOff, UserPlus, X } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { authApi, trainersApi } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'

interface Trainer {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'TRAINER' | 'ADMIN'
  isActive: boolean
  createdAt: string
}

export default function TrainersAdminPage() {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)
  const [inviteOpen, setInviteOpen] = useState(false)

  const { data: trainers, isLoading } = useQuery({
    queryKey: ['trainers'],
    queryFn: async () => (await trainersApi.list()).data as Trainer[],
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['trainers'] })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { role?: string; isActive?: boolean } }) =>
      trainersApi.updateAccess(id, data),
    onSuccess: invalidate,
  })

  return (
    <DashboardLayout>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Administración de Acceso</h1>
          <p className="text-muted-foreground">
            Gestiona quiénes pueden entrar al Training Studio del AI Coach y con qué rol.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="h-4 w-4" /> Invitar Entrenador
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="py-10 flex justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : trainers?.length ? (
          <ul className="divide-y divide-border">
            {trainers.map((trainer) => {
              const isSelf = trainer.id === currentUser?.id
              return (
                <li
                  key={trainer.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">
                        {trainer.firstName} {trainer.lastName}
                        {isSelf && <span className="text-muted-foreground font-normal"> (tú)</span>}
                      </p>
                      <Badge tone={trainer.role === 'ADMIN' ? 'primary' : 'neutral'}>{trainer.role}</Badge>
                      <Badge tone={trainer.isActive ? 'success' : 'danger'}>
                        {trainer.isActive ? 'Acceso activo' : 'Sin acceso'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {trainer.email} · Alta {formatDateTime(trainer.createdAt)}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={updateMutation.isPending}
                      onClick={() =>
                        updateMutation.mutate({
                          id: trainer.id,
                          data: { role: trainer.role === 'ADMIN' ? 'TRAINER' : 'ADMIN' },
                        })
                      }
                    >
                      {trainer.role === 'ADMIN' ? 'Quitar Admin' : 'Hacer Admin'}
                    </Button>
                    <Button
                      variant={trainer.isActive ? 'danger' : 'success'}
                      size="sm"
                      disabled={updateMutation.isPending || isSelf}
                      onClick={() => updateMutation.mutate({ id: trainer.id, data: { isActive: !trainer.isActive } })}
                    >
                      {trainer.isActive ? (
                        <>
                          <ShieldOff className="h-4 w-4" /> Quitar Acceso
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" /> Dar Acceso
                        </>
                      )}
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground py-10">No hay entrenadores todavía.</p>
        )}
      </Card>

      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} onInvited={invalidate} />}
    </DashboardLayout>
  )
}

function InviteModal({ onClose, onInvited }: { onClose: () => void; onInvited: () => void }) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'TRAINER' | 'ADMIN'>('TRAINER')

  const mutation = useMutation({
    mutationFn: () => authApi.register({ email, password, firstName, lastName, role }),
    onSuccess: () => {
      onInvited()
      onClose()
    },
  })

  const canSubmit =
    email.trim().length > 3 && firstName.trim() && lastName.trim() && password.length >= 6

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Invitar Entrenador</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Apellido</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="entrenador@alonso49.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contraseña temporal</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <div className="flex gap-2">
              {(['TRAINER', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    role === r ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'
                  }`}
                >
                  {r === 'ADMIN' ? 'Admin' : 'Entrenador'}
                </button>
              ))}
            </div>
          </div>

          {mutation.isError && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm">
              {(mutation.error as any)?.response?.data?.message || 'Error al invitar entrenador'}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="flex-1"
            disabled={!canSubmit || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Enviar Invitación
          </Button>
        </div>
      </div>
    </div>
  )
}
