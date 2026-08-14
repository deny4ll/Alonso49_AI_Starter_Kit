'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { api, aiCoachApi, tagsApi } from '@/lib/api'
import { Send, Loader2, Bot, User, Search, Video as VideoIcon, Calendar } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AiCoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Bienvenido al AI High Performance Coach de Alonso49.

Soy tu entrenador especializado en la clase olímpica 49er.

Mi objetivo es ayudarte a alcanzar el más alto nivel de rendimiento.

¿En qué puedo ayudarte hoy?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')

  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTagKey, setSearchTagKey] = useState('')
  const [searchWindMin, setSearchWindMin] = useState('')
  const [searchWindMax, setSearchWindMax] = useState('')
  const [searchLocation, setSearchLocation] = useState('')

  const { data: sections } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => (await tagsApi.getAll()).data,
  })

  const searchMutation = useMutation({
    mutationFn: async () => {
      const res = await aiCoachApi.search({
        q: searchQuery || undefined,
        tagKey: searchTagKey || undefined,
        windMin: searchWindMin || undefined,
        windMax: searchWindMax || undefined,
        location: searchLocation || undefined,
      })
      return res.data as { videos: any[]; sessions: any[] }
    },
  })

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await api.post('/ai-coach/chat', { message })
      return res.data
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        },
      ])
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || chatMutation.isPending) return

    setMessages(prev => [
      ...prev,
      {
        role: 'user',
        content: input,
        timestamp: new Date(),
      },
    ])

    chatMutation.mutate(input)
    setInput('')
  }

  const quickQuestions = [
    '¿Cómo mejorar mi técnica de tacking?',
    'Análisis de mi última sesión',
    'Plan de entrenamiento semanal',
    '¿Qué ejercicios para aumentar velocidad?',
  ]

  const handleQuickQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-100 rounded-full">
              <Bot className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI High Performance Coach</h1>
              <p className="text-gray-600">Metodología Alonso49 · Clase Olímpica 49er</p>
            </div>
            <button
              onClick={() => setShowSearch((prev) => !prev)}
              className="ml-auto p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
              title="Buscador"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {showSearch && (
          <Card className="mb-6" title="Buscador">
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
              <input
                type="text"
                placeholder="Texto libre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm lg:col-span-2"
              />
              <select
                value={searchTagKey}
                onChange={(e) => setSearchTagKey(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Maniobra / área</option>
                {sections?.map((section: any) => (
                  <optgroup key={section.id} label={section.label}>
                    {section.children?.map((child: any) => (
                      <option key={child.id} value={child.key}>
                        {child.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <input
                type="text"
                placeholder="Sitio..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Viento kn mín"
                  value={searchWindMin}
                  onChange={(e) => setSearchWindMin(e.target.value)}
                  className="w-full min-w-0 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Viento kn máx"
                  value={searchWindMax}
                  onChange={(e) => setSearchWindMax(e.target.value)}
                  className="w-full min-w-0 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <Button size="sm" onClick={() => searchMutation.mutate()} disabled={searchMutation.isPending}>
              {searchMutation.isPending ? 'Buscando...' : 'Buscar'}
            </Button>

            {searchMutation.data && (
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Videos/Informes ({searchMutation.data.videos.length})
                  </p>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {searchMutation.data.videos.map((v) => (
                      <div key={v.id} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                        <VideoIcon className="h-4 w-4 text-gray-400 shrink-0" />
                        <span>{v.title}</span>
                      </div>
                    ))}
                    {searchMutation.data.videos.length === 0 && (
                      <p className="text-sm text-gray-400">Sin resultados</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Sesiones ({searchMutation.data.sessions.length})
                  </p>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {searchMutation.data.sessions.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                        <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                        <span>{s.title}</span>
                      </div>
                    ))}
                    {searchMutation.data.sessions.length === 0 && (
                      <p className="text-sm text-gray-400">Sin resultados</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        <Card className="mb-6">
          <div className="h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Bot className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs mt-2 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {chatMutation.isPending && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-gray-600">Analizando...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pregunta al coach..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={chatMutation.isPending}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || chatMutation.isPending}
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </Card>

        <Card title="Preguntas Rápidas">
          <div className="grid grid-cols-2 gap-3">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-red-300 transition-colors"
              >
                <p className="text-sm text-gray-700">{question}</p>
              </button>
            ))}
          </div>
        </Card>

        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <h3 className="font-semibold text-red-900 mb-2">💡 Sobre el AI Coach</h3>
          <p className="text-sm text-red-800">
            Este coach utiliza la metodología Alonso49 y análisis de datos para proporcionar
            feedback personalizado. Puede analizar videos, sesiones de entrenamiento, 
            condiciones meteorológicas y crear planes de entrenamiento específicos.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
