import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, Link, Stack, Typography } from '@mui/material'
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api'

type LatLng = { lat: number, lng: number }

type RouteMode = 'driver_to_pickup' | 'pickup_to_dropoff'

type RouteCacheEntry = {
  createdAt: number
  mode: RouteMode
  origin: LatLng
  destination: LatLng
  distanceText?: string
  durationText?: string
  // encoded polyline overview, so we can re-render without re-calling DirectionsService
  polyline?: string
}

const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

function cacheKey(mode: RouteMode, origin: LatLng, destination: LatLng) {
  return `fc_route:${mode}:${origin.lat.toFixed(5)},${origin.lng.toFixed(5)}:${destination.lat.toFixed(5)},${destination.lng.toFixed(5)}`
}

export function MapCard(props: {
  pickup: { lat: number, lng: number, address: string }
  dropoff: { lat: number, lng: number, address: string }
  driver?: { lat: number, lng: number } | null
  deliveryStatus: string
}) {
  const { pickup, dropoff, driver, deliveryStatus } = props

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
  const hasKey = !!apiKey

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey ?? '',
    libraries: ['geometry']
  })

  const [eta, setEta] = useState<string | null>(null)
  const [distance, setDistance] = useState<string | null>(null)
  const [path, setPath] = useState<LatLng[] | null>(null)
  const [routeLabel, setRouteLabel] = useState<string>('Pickup → Dropoff')

  const containerStyle = useMemo(() => ({ width: '100%', height: '360px', borderRadius: 12, overflow: 'hidden' }), [])

  const mode: RouteMode = useMemo(() => {
    if (deliveryStatus === 'PICKED_UP' || deliveryStatus === 'DELIVERED') return 'pickup_to_dropoff'
    if (driver) return 'driver_to_pickup'
    return 'pickup_to_dropoff'
  }, [deliveryStatus, !!driver])

  const origin: LatLng = useMemo(() => {
    if (mode === 'driver_to_pickup' && driver) return { lat: driver.lat, lng: driver.lng }
    return { lat: pickup.lat, lng: pickup.lng }
  }, [mode, driver?.lat, driver?.lng, pickup.lat, pickup.lng])

  const destination: LatLng = useMemo(() => {
    if (mode === 'driver_to_pickup') return { lat: pickup.lat, lng: pickup.lng }
    return { lat: dropoff.lat, lng: dropoff.lng }
  }, [mode, pickup.lat, pickup.lng, dropoff.lat, dropoff.lng])

  useEffect(() => {
    setRouteLabel(mode === 'driver_to_pickup' ? 'Driver → Pickup' : 'Pickup → Dropoff')
  }, [mode])

  useEffect(() => {
    if (!hasKey || !isLoaded) return

    const key = cacheKey(mode, origin, destination)
    const cachedRaw = sessionStorage.getItem(key)
    if (cachedRaw) {
      try {
        const cached = JSON.parse(cachedRaw) as RouteCacheEntry
        if (Date.now() - cached.createdAt < CACHE_TTL_MS && cached.polyline) {
          setDistance(cached.distanceText ?? null)
          setEta(cached.durationText ?? null)
          const decoded = google.maps.geometry.encoding.decodePath(cached.polyline)
          setPath(decoded.map(p => ({ lat: p.lat(), lng: p.lng() })))
          return
        }
      } catch {
        // ignore cache parse errors
      }
    }

    const svc = new google.maps.DirectionsService()
    svc.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK' && result) {
          const leg = result.routes?.[0]?.legs?.[0]
          const distanceText = leg?.distance?.text
          const durationText = leg?.duration?.text
          const polyline = (result.routes?.[0] as any)?.overview_polyline?.points as string | undefined

          setDistance(distanceText ?? null)
          setEta(durationText ?? null)

          // Prefer overview_path if available; otherwise decode polyline
          const overviewPath = result.routes?.[0]?.overview_path
          if (overviewPath && overviewPath.length > 0) {
            setPath(overviewPath.map(p => ({ lat: p.lat(), lng: p.lng() })))
          } else if (polyline) {
            const decoded = google.maps.geometry.encoding.decodePath(polyline)
            setPath(decoded.map(p => ({ lat: p.lat(), lng: p.lng() })))
          } else {
            setPath(null)
          }

          const entry: RouteCacheEntry = {
            createdAt: Date.now(),
            mode,
            origin,
            destination,
            distanceText,
            durationText,
            polyline
          }
          try {
            sessionStorage.setItem(key, JSON.stringify(entry))
          } catch {
            // ignore quota
          }
        } else {
          setPath(null)
          setEta(null)
          setDistance(null)
        }
      }
    )
  }, [hasKey, isLoaded, mode, origin.lat, origin.lng, destination.lat, destination.lng])

  // Map URLs (fallback + directions)
  const mapUrl = useMemo(() => {
    const center = `${pickup.lat},${pickup.lng}`
    return `https://www.google.com/maps?q=${center}&z=13&output=embed`
  }, [pickup.lat, pickup.lng])

  const directionsUrl = useMemo(() => {
    const originStr = `${origin.lat},${origin.lng}`
    const destStr = `${destination.lat},${destination.lng}`
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destStr)}&travelmode=driving`
  }, [origin.lat, origin.lng, destination.lat, destination.lng])

  const center = useMemo(() => {
    // Center map near pickup by default
    return { lat: pickup.lat, lng: pickup.lng }
  }, [pickup.lat, pickup.lng])

  return (
    <Card>
      <CardHeader
        title="Map & Route"
        subheader={distance || eta ? `${routeLabel} • ${distance ?? ''}${distance && eta ? ' • ' : ''}${eta ?? ''}` : routeLabel}
      />
      <CardContent>
        <Stack spacing={1.2}>
          <Typography variant="body2">
            <Link href={directionsUrl} target="_blank" rel="noreferrer">Open turn-by-turn directions</Link>
          </Typography>

          {hasKey && isLoaded ? (
            <div style={containerStyle}>
              <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={center} zoom={13}>
                <Marker position={pickup} label="P" />
                <Marker position={dropoff} label="D" />
                {driver ? <Marker position={driver} label="🚗" /> : null}
                {path ? <Polyline path={path} options={{ clickable: false }} /> : null}
              </GoogleMap>
            </div>
          ) : (
            <>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Using lightweight embed (no API key). Add VITE_GOOGLE_MAPS_API_KEY to enable route polyline + ETA.
              </Typography>
              <div style={containerStyle}>
                <iframe title="map" src={mapUrl} style={{ width: '100%', height: '100%', border: 0 }} loading="lazy" />
              </div>
            </>
          )}

          {driver ? (
            <Typography variant="body2">
              Driver: {driver.lat.toFixed(5)}, {driver.lng.toFixed(5)}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Driver location not yet reported.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
