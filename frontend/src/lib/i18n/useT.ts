'use client'

import { useLanguageStore } from '@/stores/language'
import { dictionaries } from './dictionaries'

function lookup(obj: any, path: string[]): unknown {
  let node = obj
  for (const key of path) {
    if (node == null) return undefined
    node = node[key]
  }
  return node
}

export function useT() {
  const lang = useLanguageStore((state) => state.lang)

  return (key: string): string => {
    const path = key.split('.')
    const value = lookup(dictionaries[lang], path)
    if (typeof value === 'string') return value

    const fallback = lookup(dictionaries.es, path)
    if (typeof fallback === 'string') return fallback

    return key
  }
}
