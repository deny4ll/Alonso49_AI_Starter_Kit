/** Formatea un rango de viento (nudos) para mostrar en prompts/UI: "10-13" o "12" si min = max. */
export function formatWindRange(min?: number | null, max?: number | null): string {
  if (min == null && max == null) return 'Not recorded';
  if (min == null) return `${max}`;
  if (max == null) return `${min}`;
  if (min === max) return `${min}`;
  return `${min}-${max}`;
}
