import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const CATEGORY_LABELS: Record<string, string> = {
  methodology: 'Metodología',
  technique: 'Técnica',
  tactics: 'Táctica',
  boat_setup: 'Reglaje del Barco',
  physical_prep: 'Preparación Física',
  mental_prep: 'Preparación Mental',
}

export const CATEGORIES = Object.keys(CATEGORY_LABELS)

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  PENDING_REVIEW: 'Pendiente de Revisión',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
}

export const ORIGIN_LABELS: Record<string, string> = {
  UPLOAD: 'Documento',
  MANUAL: 'Manual',
  CORRECTION: 'Corrección',
}
