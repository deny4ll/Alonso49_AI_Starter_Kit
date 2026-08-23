export function nivelBandClasses(nivel: number) {
  if (nivel >= 7.5) return { bar: 'bg-emerald-500', text: 'text-emerald-700' }
  if (nivel >= 4) return { bar: 'bg-amber-500', text: 'text-amber-700' }
  return { bar: 'bg-red-600', text: 'text-red-700' }
}

export function DeltaTag({ delta }: { delta: number | null }) {
  if (delta == null) return null
  if (delta > 0) return <span className="text-emerald-600 text-xs font-medium">▲{delta.toFixed(1)}</span>
  if (delta < 0) return <span className="text-red-600 text-xs font-medium">▼{Math.abs(delta).toFixed(1)}</span>
  return <span className="text-gray-400 text-xs font-medium">— 0.0</span>
}

export function NivelReadout({ nivel, delta }: { nivel: number | null; delta: number | null }) {
  if (nivel == null) {
    return <span className="text-xs text-gray-400">Sin datos aún</span>
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`text-sm font-semibold tabular-nums ${nivelBandClasses(nivel).text}`}>
        {nivel.toFixed(1)}
      </span>
      <DeltaTag delta={delta} />
    </span>
  )
}
