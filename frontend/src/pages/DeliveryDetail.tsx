import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, CardContent, CardHeader, Grid, Stack, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { StatusChip } from '../components/StatusChip'
import { MapCard } from '../components/MapCard'
import { getRole, getToken } from '../lib/auth'

type Delivery = {
  id: number
  status: string
  pickupAddress: string
  pickupLat: number
  pickupLng: number
  dropoffAddress: string
  dropoffLat: number
  dropoffLng: number
  donorName: string
  recipientName: string
  driverName?: string | null
}

type LocationEvent = { deliveryId: number, lat: number, lng: number }
type StatusEvent = { deliveryId: number, status: string }

export function DeliveryDetail() {
  const { id } = useParams()
  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [driverLoc, setDriverLoc] = useState<{ lat: number, lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const token = getToken()!
  const role = getRole()

  async function refresh() {
    try {
      const res = await api<Delivery>(`/api/deliveries/${id}`)
      setDelivery(res)
    } catch (e: any) {
      setError(e.message)
    }
  }

  useEffect(() => { refresh() }, [id])

  // Subscribe to delivery updates (status + location)
  useEffect(() => {
    const es = new EventSource(`/api/stream/deliveries/${id}?token=${encodeURIComponent(token)}`)
    es.addEventListener('status', (evt: MessageEvent) => {
      const payload = JSON.parse(evt.data) as StatusEvent
      setDelivery(prev => prev ? { ...prev, status: payload.status } : prev)
    })
    es.addEventListener('location', (evt: MessageEvent) => {
      const payload = JSON.parse(evt.data) as LocationEvent
      setDriverLoc({ lat: payload.lat, lng: payload.lng })
    })
    es.onerror = () => { /* ignore */ }
    return () => es.close()
  }, [id, token])

  // Driver-only: send location update every 30s while task active
  useEffect(() => {
    if (role !== 'DRIVER') return
    const interval = setInterval(async () => {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 })
        })
        await api(`/api/deliveries/${id}/location`, {
          method: 'POST',
          body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        })
      } catch {
        // ignore
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [id, role])

  if (!delivery) return <Typography sx={{ opacity: 0.7 }}>Loading…</Typography>

  const isDriver = role === 'DRIVER'

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Delivery #{delivery.id}</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <StatusChip status={delivery.status} />
          {isDriver && (
            <>
              <Button variant="outlined" onClick={async () => { await api(`/api/deliveries/${id}/pickup`, { method: 'POST' }); refresh() }}>
                Mark picked up
              </Button>
              <Button variant="contained" onClick={async () => { await api(`/api/deliveries/${id}/deliver`, { method: 'POST' }); refresh() }}>
                Mark delivered
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardHeader title="Details" />
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2"><b>Donor:</b> {delivery.donorName}</Typography>
                <Typography variant="body2"><b>Recipient:</b> {delivery.recipientName}</Typography>
                <Typography variant="body2"><b>Driver:</b> {delivery.driverName ?? 'Unassigned'}</Typography>
                <Typography variant="body2"><b>Pickup:</b> {delivery.pickupAddress}</Typography>
                <Typography variant="body2"><b>Drop-off:</b> {delivery.dropoffAddress}</Typography>
                {isDriver && (
                  <Typography variant="body2" sx={{ opacity: 0.75 }}>
                    Location is shared only during an active delivery (browser permission required).
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <MapCard
            deliveryStatus={delivery.status}
            pickup={{ lat: delivery.pickupLat, lng: delivery.pickupLng, address: delivery.pickupAddress }}
            dropoff={{ lat: delivery.dropoffLat, lng: delivery.dropoffLng, address: delivery.dropoffAddress }}
            driver={driverLoc}
          />
        </Grid>
      </Grid>
    </Stack>
  )
}
