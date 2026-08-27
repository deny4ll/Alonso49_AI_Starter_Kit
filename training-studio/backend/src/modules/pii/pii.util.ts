// Guardrail de PII / información sensible: escaneo por expresiones
// regulares, sin dependencias externas ni llamadas a servicios de terceros.
// Se ejecuta de forma síncrona sobre TODO contenido antes de que se
// convierta en buscable (chunking/embeddings) o exportable (sync), sobre
// los tres métodos de acción por igual: documentos subidos, texto escrito a
// mano, y respuestas de la IA (originales y corregidas) en el chat de
// prueba.

export type PiiFindingType =
  | 'email'
  | 'phone'
  | 'national_id'
  | 'credit_card'
  | 'iban'
  | 'address';

export interface PiiFinding {
  type: PiiFindingType;
  snippet: string;
  confidence: 'high' | 'low';
}

export interface PiiScanResult {
  status: 'CLEAN' | 'FLAGGED';
  findings: PiiFinding[];
  redactedContent: string;
}

const EMAIL_RE = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g;

// Candidatos de teléfono: al menos 7 y como máximo 15 dígitos, permitiendo
// separadores comunes, para no confundir con rangos numéricos sueltos
// (ej. "12-18 nudos").
const PHONE_CANDIDATE_RE = /(?:\+?\d[\d\s().-]{6,}\d)/g;

// DNI español: 8 dígitos + letra de control (algoritmo mod 23).
const DNI_RE = /\b(\d{8})([A-Za-z])\b/g;
const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

// NIE español: X/Y/Z + 7 dígitos + letra de control.
const NIE_RE = /\b([XYZxyz])(\d{7})([A-Za-z])\b/g;
const NIE_PREFIX: Record<string, string> = { X: '0', Y: '1', Z: '2' };

// Pasaporte genérico (heurística de baja confianza): 1-2 letras + 6-9 dígitos.
const PASSPORT_RE = /\b[A-Z]{1,2}\d{6,9}\b/g;

// Tarjetas de crédito: 13-19 dígitos con separadores opcionales.
const CARD_CANDIDATE_RE = /\b(?:\d[ -]?){13,19}\b/g;

// IBAN: 2 letras de país + 2 dígitos de control + hasta 30 alfanuméricos.
const IBAN_RE = /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g;

const ADDRESS_RE =
  /\b(calle|avenida|av\.|paseo|carrer|street|st\.|rue)\s+[a-zA-ZÀ-ÿ0-9\s.]{3,40}\d+/gi;

function luhnCheck(digits: string): boolean {
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function ibanCheck(iban: string): boolean {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged
    .split('')
    .map((c) => (/[0-9]/.test(c) ? c : String(c.toUpperCase().charCodeAt(0) - 55)))
    .join('');
  // mod-97 sobre un número potencialmente muy largo, por bloques.
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    remainder = parseInt(remainder + numeric.substring(i, i + 7), 10) % 97;
  }
  return remainder === 1;
}

function dniLetterValid(digits: string, letter: string): boolean {
  const index = parseInt(digits, 10) % 23;
  return DNI_LETTERS[index] === letter.toUpperCase();
}

function redact(text: string, matches: string[]): string {
  let redacted = text;
  for (const match of matches) {
    if (!match) continue;
    redacted = redacted.split(match).join('█'.repeat(Math.min(match.length, 12)));
  }
  return redacted;
}

export function scanForPii(text: string): PiiScanResult {
  if (!text) {
    return { status: 'CLEAN', findings: [], redactedContent: text };
  }

  const findings: PiiFinding[] = [];
  const matchedSnippets: string[] = [];

  for (const match of text.match(EMAIL_RE) || []) {
    findings.push({ type: 'email', snippet: match, confidence: 'high' });
    matchedSnippets.push(match);
  }

  for (const match of text.match(PHONE_CANDIDATE_RE) || []) {
    const digitCount = match.replace(/\D/g, '').length;
    if (digitCount >= 7 && digitCount <= 15) {
      findings.push({ type: 'phone', snippet: match, confidence: 'high' });
      matchedSnippets.push(match);
    }
  }

  for (const m of text.matchAll(DNI_RE)) {
    if (dniLetterValid(m[1], m[2])) {
      findings.push({ type: 'national_id', snippet: m[0], confidence: 'high' });
      matchedSnippets.push(m[0]);
    }
  }

  for (const m of text.matchAll(NIE_RE)) {
    const numeric = NIE_PREFIX[m[1].toUpperCase()] + m[2];
    if (dniLetterValid(numeric, m[3])) {
      findings.push({ type: 'national_id', snippet: m[0], confidence: 'high' });
      matchedSnippets.push(m[0]);
    }
  }

  for (const match of text.match(PASSPORT_RE) || []) {
    findings.push({ type: 'national_id', snippet: match, confidence: 'low' });
    matchedSnippets.push(match);
  }

  for (const match of text.match(CARD_CANDIDATE_RE) || []) {
    const digits = match.replace(/[ -]/g, '');
    if (digits.length >= 13 && digits.length <= 19 && luhnCheck(digits)) {
      findings.push({ type: 'credit_card', snippet: match, confidence: 'high' });
      matchedSnippets.push(match);
    }
  }

  for (const match of text.match(IBAN_RE) || []) {
    if (ibanCheck(match.toUpperCase())) {
      findings.push({ type: 'iban', snippet: match, confidence: 'high' });
      matchedSnippets.push(match);
    }
  }

  for (const match of text.match(ADDRESS_RE) || []) {
    findings.push({ type: 'address', snippet: match, confidence: 'low' });
    matchedSnippets.push(match);
  }

  return {
    status: findings.length > 0 ? 'FLAGGED' : 'CLEAN',
    findings,
    redactedContent: redact(text, matchedSnippets),
  };
}
