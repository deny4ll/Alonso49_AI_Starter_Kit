'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { progressApi } from '@/lib/api'
import { ChevronDown, ChevronRight, Target } from 'lucide-react'
import { nivelBandClasses, NivelReadout } from '@/components/progress/Nivel'

interface RecentEntry {
  title: string
  score: number
  note: string | null
  createdAt: string
}

interface Subsection {
  id: string
  key: string
  label: string
  entries: number
  nivel: number | null
  nivelDelta: number | null
  recentEntries: RecentEntry[]
}

interface Section {
  id: string
  key: string
  label: string
  entries: number
  nivel: number | null
  nivelDelta: number | null
  subsections: Subsection[]
}

export default function ProgressPage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const { data, isLoading } = useQuery({
    queryKey: ['progress-summary'],
    queryFn: async () => {
      const res = await progressApi.getSummary()
      return res.data as { scope: string; totalEntries: number; sections: Section[] }
    },
  })

  const maxEntries = Math.max(1, ...(data?.sections.map((s) => s.entries) || [1]))

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Área de Progreso</h1>
        <p className="text-gray-600">
          Progreso acumulado según la Metodología SAILVEX
          {data?.scope === 'team' ? ' — vista de equipo' : ' — vista individual'}
        </p>
      </div>

      <Card className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-red-100 text-red-600">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <div className="text-3xl font-bold">{data?.totalEntries ?? 0}</div>
            <div className="text-sm text-gray-600">Videos e informes etiquetados en total</div>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2 rounded-full bg-red-600" />Carga de trabajo</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2 rounded-full bg-emerald-500" />Nivel (AI Coach)</span>
      </div>

      {isLoading && <p className="text-gray-500">Cargando progreso...</p>}

      <div className="space-y-3">
        {data?.sections.map((section) => {
          const isOpen = expanded.has(section.id)
          const pct = Math.round((section.entries / maxEntries) * 100)
          const nivelPct = section.nivel != null ? section.nivel * 10 : 0
          return (
            <Card key={section.id}>
              <button
                className="w-full flex items-center justify-between text-left gap-4"
                onClick={() => toggle(section.id)}
              >
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="font-semibold">{section.label}</span>
                </div>
                <div className="flex items-center gap-5 shrink-0">
                  <NivelReadout nivel={section.nivel} delta={section.nivelDelta} />
                  <span className="text-sm text-gray-600">{section.entries} entradas</span>
                </div>
              </button>

              <div className="mt-3 space-y-1.5">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  {section.nivel != null && (
                    <div
                      className={`h-full rounded-full ${nivelBandClasses(section.nivel).bar}`}
                      style={{ width: `${nivelPct}%` }}
                    />
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="mt-4 space-y-4 pl-6 border-l-2 border-gray-100">
                  {section.subsections.map((sub) => {
                    const subPct = Math.round((sub.entries / maxEntries) * 100)
                    return (
                      <div key={sub.id}>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-gray-700">{sub.label}</span>
                          <div className="flex items-center gap-4 shrink-0">
                            <NivelReadout nivel={sub.nivel} delta={sub.nivelDelta} />
                            <span className="text-xs text-gray-500 w-14 text-right">{sub.entries} ent.</span>
                          </div>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 max-w-[280px]">
                          <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-red-400 rounded-full" style={{ width: `${subPct}%` }} />
                          </div>
                        </div>

                        {sub.recentEntries.length > 0 && (
                          <div className="mt-2 space-y-1.5">
                            {sub.recentEntries.map((entry, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2 text-xs bg-gray-50 rounded-md px-2.5 py-1.5"
                              >
                                <span
                                  className={`shrink-0 font-semibold tabular-nums ${nivelBandClasses(entry.score).text}`}
                                >
                                  {entry.score}/10
                                </span>
                                <span className="text-gray-600 min-w-0 flex-1">
                                  <span className="font-medium text-gray-700">{entry.title}</span>
                                  {entry.note ? ` — ${entry.note}` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
