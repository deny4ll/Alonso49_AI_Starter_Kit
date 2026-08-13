'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet'

interface Point {
  lat: number
  lng: number
}

function FitBounds({ points }: { points: Point[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(
        points.map((p) => [p.lat, p.lng]) as [number, number][],
        { padding: [30, 30] },
      )
    }
  }, [points, map])
  return null
}

export default function TrackMap({ points }: { points: Point[] }) {
  if (points.length === 0) return null
  const positions = points.map((p) => [p.lat, p.lng]) as [number, number][]

  return (
    <MapContainer center={positions[0]} zoom={14} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={positions} pathOptions={{ color: '#2563eb', weight: 4 }} />
      <CircleMarker
        center={positions[0]}
        radius={6}
        pathOptions={{ color: '#16a34a', fillColor: '#16a34a', fillOpacity: 1 }}
      />
      <CircleMarker
        center={positions[positions.length - 1]}
        radius={6}
        pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 1 }}
      />
      <FitBounds points={points} />
    </MapContainer>
  )
}
