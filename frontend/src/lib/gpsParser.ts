export interface ParsedTrackPoint {
  lat: number
  lng: number
  timestamp: string
  speed?: number
}

/** Parsea un archivo GPX (estándar) o CSV (lat,lng,timestamp[,speed]) subido por el usuario. */
export function parseTrackFile(filename: string, text: string): ParsedTrackPoint[] {
  if (filename.toLowerCase().endsWith('.gpx')) {
    return parseGpx(text)
  }
  return parseCsv(text)
}

function parseGpx(text: string): ParsedTrackPoint[] {
  const points: ParsedTrackPoint[] = []
  const trkptRegex = /<trkpt[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"[^>]*>([\s\S]*?)<\/trkpt>/g
  let match: RegExpExecArray | null

  while ((match = trkptRegex.exec(text))) {
    const lat = parseFloat(match[1])
    const lng = parseFloat(match[2])
    const body = match[3]
    const timeMatch = body.match(/<time>([^<]+)<\/time>/)
    const speedMatch = body.match(/<speed>([^<]+)<\/speed>/)
    if (!isNaN(lat) && !isNaN(lng)) {
      points.push({
        lat,
        lng,
        timestamp: timeMatch ? timeMatch[1] : new Date().toISOString(),
        speed: speedMatch ? parseFloat(speedMatch[1]) : undefined,
      })
    }
  }
  return points
}

function parseCsv(text: string): ParsedTrackPoint[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length === 0) return []

  const header = lines[0].toLowerCase().split(',').map((h) => h.trim())
  const hasHeader = header.some((h) => ['lat', 'latitude', 'lng', 'lon', 'longitude'].includes(h))

  const latIdx = hasHeader ? header.findIndex((h) => h === 'lat' || h === 'latitude') : 0
  const lngIdx = hasHeader ? header.findIndex((h) => h === 'lng' || h === 'lon' || h === 'longitude') : 1
  const timeIdx = hasHeader ? header.findIndex((h) => h.includes('time')) : 2
  const speedIdx = hasHeader ? header.indexOf('speed') : 3

  const dataLines = hasHeader ? lines.slice(1) : lines

  return dataLines
    .filter(Boolean)
    .map((line) => {
      const cols = line.split(',')
      return {
        lat: parseFloat(cols[latIdx]),
        lng: parseFloat(cols[lngIdx]),
        timestamp: timeIdx >= 0 && cols[timeIdx] ? cols[timeIdx].trim() : new Date().toISOString(),
        speed: speedIdx >= 0 && cols[speedIdx] !== undefined ? parseFloat(cols[speedIdx]) : undefined,
      }
    })
    .filter((p) => !isNaN(p.lat) && !isNaN(p.lng))
}
