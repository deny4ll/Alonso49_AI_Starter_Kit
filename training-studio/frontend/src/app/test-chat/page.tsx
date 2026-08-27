'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Send, ThumbsUp, Pencil, Trash2, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { testChatApi } from '@/lib/api'
import { CATEGORIES, CATEGORY_LABELS, cn } from '@/lib/utils'

type AskResult = {
  answer: string
  piiFlagged: boolean
  sources: { title: string; category: string; similarity: number }[]
}

export default function TestChatPage() {
  const [question, setQuestion] = useState('')
  const [category, setCategory] = useState('')
  const [result, setResult] = useState<AskResult | null>(null)

  const [title, setTitle] = useState('')
  const [mode, setMode] = useState<'idle' | 'correcting'>('idle')
  const [correctedAnswer, setCorrectedAnswer] = useState('')
  const [saved, setSaved] = useState<string | null>(null)

  const askMutation = useMutation({
    mutationFn: () => testChatApi.ask(question, category || undefined),
    onSuccess: (res) => {
      setResult(res.data)
      setMode('idle')
      setSaved(null)
      setCorrectedAnswer(res.data.answer)
    },
  })

  const saveMutation = useMutation({
    mutationFn: (action: 'APPROVE' | 'CORRECT') =>
      testChatApi.save({
        title,
        category: category || 'methodology',
        question,
        aiAnswer: result!.answer,
        correctedAnswer: action === 'CORRECT' ? correctedAnswer : undefined,
        action,
      }),
    onSuccess: () => {
      setSaved('Guardado y enviado a la Cola de Revisión.')
      setResult(null)
      setQuestion('')
      setTitle('')
      setMode('idle')
    },
  })

  const discard = () => {
    setResult(null)
    setQuestion('')
    setTitle('')
    setMode('idle')
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-1">Probar & Corregir</h1>
      <p className="text-muted-foreground mb-6">
        Haz una pregunta como lo haría un atleta. La IA responde solo con el conocimiento ya
        aprobado. Aprueba la respuesta o corrígela para mejorar al AI Coach.
      </p>

      <Card className="mb-6">
        <label className="block text-sm font-medium mb-2">Categoría (opcional, para filtrar la búsqueda)</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(category === c ? '' : c)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium border transition-colors text-left',
                category === c ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted',
              )}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium mb-2">Pregunta</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
          placeholder="Ej: ¿Cómo debo regular el cunningham con 18 nudos?"
        />

        <Button
          size="lg"
          className="mt-4"
          disabled={question.trim().length < 3 || askMutation.isPending}
          onClick={() => askMutation.mutate()}
        >
          {askMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          Preguntar
        </Button>
      </Card>

      {saved && (
        <div className="mb-6 p-3 bg-success/10 border border-success/30 text-success rounded-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {saved}
        </div>
      )}

      {result && (
        <Card title="Respuesta de la IA">
          {result.piiFlagged && (
            <div className="mb-4 p-3 bg-warning/15 text-warning rounded-lg text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              Se detectó y ocultó posible información sensible en la respuesta.
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm mb-4">{result.answer}</div>

          {result.sources.length > 0 && (
            <p className="text-xs text-muted-foreground mb-4">
              Fuentes usadas: {result.sources.map((s) => s.title).join(', ')}
            </p>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Título para guardar esta entrada</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="Ej: Regulación del cunningham con viento fuerte"
            />
          </div>

          {mode === 'idle' ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="success"
                size="lg"
                className="flex-1"
                disabled={title.trim().length < 3 || saveMutation.isPending}
                onClick={() => saveMutation.mutate('APPROVE')}
              >
                <ThumbsUp className="h-5 w-5" /> Aprobar
              </Button>
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setMode('correcting')}>
                <Pencil className="h-5 w-5" /> Corregir
              </Button>
              <Button variant="danger" size="lg" className="flex-1" onClick={discard}>
                <Trash2 className="h-5 w-5" /> Descartar
              </Button>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Respuesta corregida</label>
              <textarea
                value={correctedAnswer}
                onChange={(e) => setCorrectedAnswer(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background mb-3"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="success"
                  size="lg"
                  className="flex-1"
                  disabled={title.trim().length < 3 || correctedAnswer.trim().length < 3 || saveMutation.isPending}
                  onClick={() => saveMutation.mutate('CORRECT')}
                >
                  <CheckCircle2 className="h-5 w-5" /> Guardar Corrección
                </Button>
                <Button variant="outline" size="lg" onClick={() => setMode('idle')}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </DashboardLayout>
  )
}
