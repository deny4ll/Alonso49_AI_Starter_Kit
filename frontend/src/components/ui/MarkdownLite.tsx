import { Fragment } from 'react'

/**
 * Renderer de markdown liviano para las respuestas del AI Coach (headers ##/###,
 * **negrita**, listas -/* y numeradas). Evita sumar una dependencia como
 * react-markdown solo para el subset de sintaxis que devuelve el modelo.
 */
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    }
    return <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>
  })
}

export function MarkdownLite({ content }: { content: string }) {
  const lines = content.split('\n')
  const blocks: React.ReactNode[] = []
  let listBuffer: { type: 'ul' | 'ol'; items: string[] } | null = null

  const flushList = (key: string) => {
    if (!listBuffer) return
    const ListTag = listBuffer.type
    blocks.push(
      <ListTag key={key} className={listBuffer.type === 'ul' ? 'list-disc pl-5 space-y-1' : 'list-decimal pl-5 space-y-1'}>
        {listBuffer.items.map((item, i) => (
          <li key={i}>{renderInline(item, `${key}-li-${i}`)}</li>
        ))}
      </ListTag>
    )
    listBuffer = null
  }

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim()
    const key = `b-${idx}`

    if (!line) {
      flushList(`${key}-flush`)
      return
    }

    const headerMatch = line.match(/^(#{1,4})\s+(.*)$/)
    if (headerMatch) {
      flushList(`${key}-flush`)
      const level = headerMatch[1].length
      const sizeClass = level === 1 ? 'text-lg font-bold' : level === 2 ? 'text-base font-bold' : 'text-sm font-bold'
      blocks.push(
        <div key={key} className={cnHeader(sizeClass)}>
          {renderInline(headerMatch[2], key)}
        </div>
      )
      return
    }

    const ulMatch = line.match(/^[-*]\s+(.*)$/)
    if (ulMatch) {
      if (!listBuffer || listBuffer.type !== 'ul') {
        flushList(`${key}-flush`)
        listBuffer = { type: 'ul', items: [] }
      }
      listBuffer.items.push(ulMatch[1])
      return
    }

    const olMatch = line.match(/^\d+[.)]\s+(.*)$/)
    if (olMatch) {
      if (!listBuffer || listBuffer.type !== 'ol') {
        flushList(`${key}-flush`)
        listBuffer = { type: 'ol', items: [] }
      }
      listBuffer.items.push(olMatch[1])
      return
    }

    flushList(`${key}-flush`)
    blocks.push(<p key={key}>{renderInline(line, key)}</p>)
  })

  flushList('final-flush')

  return <div className="space-y-2">{blocks}</div>
}

function cnHeader(sizeClass: string) {
  return `${sizeClass} mt-1 first:mt-0`
}
