import { useEffect, useState } from 'react'
import {
  Alert, Button, Card, CardContent, CardHeader, Chip, Divider,
  Grid, Link, Stack, Typography
} from '@mui/material'
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
  donorPhone?: string
  recipientName: string
  recipientPhone?: string
  driverName?: string | null
  driverPhone?: string | null
  donationTitle?: string
  category?: string
  quantity?: string
  servingCount?: number
  dietaryNotes?: string
  pickupStart?: string
  pickupEnd?: string
}

type LocationEvent = { deliveryId: number, lat: number, lng: number }
type StatusEvent = { deliveryId: number, status: string }

function PhoneLink({ name, phone, label }: { name: string, phone?: string | null, label: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="body2"><b>{label}:</b> {name}</Typography>
      {phone && (
        <Stack direction="row" spacing={0.5}>
          <Link href={`tel:${phone}`} underline="hover" variant="body2">Call</Link>
          <Typography variant="body2" sx={{ opacity: 0.4 }}>·</Typography>
          <Link href={`sms:${phone}`} underline="hover" variant="body2">Text</Link>
        </Stack>
      )}
    </Stack>
  )
}

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
    es.onerror = () => { /* ignore; will retry */ }
    return () => es.close()
  }, [id, token])

  // Driver-only: send GPS location every 30s — but ONLY during CLAIMED or PICKED_UP.
  // Privacy constraint: location is not shared after delivery is complete.
  const activeDelivery = delivery?.status === 'CLAIMED' || delivery?.status === 'PICKED_UP'
  useEffect(() => {
    if (role !== 'DRIVER' || !activeDelivery) return
    const interval = setInterval(async () => {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 })
        )
        await api(`/api/deliveries/${id}/location`, {
          method: 'POST',
          body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        })
      } catch { /* ignore */ }
    }, 30000)
    return () => clearInterval(interval)
  }, [id, role, activeDelivery])

  if (!delivery) return <Typography sx={{ opacity: 0.7 }}>Loading…</Typography>

  const isDriver = role === 'DRIVER'

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Delivery #{delivery.id}</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <StatusChip status={delivery.status} />
          {isDriver && delivery.status === 'CLAIMED' && (
            <Button variant="outlined" onClick={async () => {
              await api(`/api/deliveries/${id}/pickup`, { method: 'POST' })
              refresh()
            }}>
              Mark picked up
            </Button>
          )}
          {isDriver && delivery.status === 'PICKED_UP' && (
            <Button variant="contained" onClick={async () => {
              await api(`/api/deliveries/${id}/deliver`, { method: 'POST' })
              refresh()
            }}>
              Mark delivered
            </Button>
          )}
        </Stack>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            {/* Food details card */}
            <Card>
              <CardHeader title="Food Details" />
              <CardContent>
                <Stack spacing={1}>
                  {delivery.donationTitle && (
                    <Typography variant="body2"><b>{delivery.donationTitle}</b></Typography>
                  )}
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {delivery.category && (
                      <Chip label={delivery.category.replace('_', ' ')} size="small" />
                    )}
                    {delivery.quantity && (
                      <Chip label={delivery.quantity} size="small" variant="outlined" />
                    )}
                    {delivery.servingCount != null && (
                      <Chip label={`Serves ${delivery.servingCount}`} size="small" variant="outlined" color="success" />
                    )}
                  </Stack>
                  {delivery.dietaryNotes && (
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      <b>Dietary:</b> {delivery.dietaryNotes}
                    </Typography>
                  )}
                  {(delivery.pickupStart || delivery.pickupEnd) && (
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      <b>Available:</b> {delivery.pickupStart ?? '?'} – {delivery.pickupEnd ?? '?'}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Contacts card */}
            <Card>
              <CardHeader title="Contacts" subheader="Tap Call or Text to reach a party" />
              <CardContent>
                <Stack spacing={1.5} divider={<Divider flexItem />}>
                  <PhoneLink label="Donor" name={delivery.donorName} phone={delivery.donorPhone} />
                  <PhoneLink label="Recipient" name={delivery.recipientName} phone={delivery.recipientPhone} />
                  <PhoneLink
                    label="Driver"
                    name={delivery.driverName ?? 'Unassigned'}
                    phone={delivery.driverPhone}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Addresses */}
            <Card>
              <CardHeader title="Addresses" />
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <b>Pickup:</b> {delivery.pickupAddress}
                  </Typography>
                  <Typography variant="body2">
                    <b>Drop-off:</b> {delivery.dropoffAddress}
                  </Typography>
                  {isDriver && (
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Your location is shared automatically every 30 s (browser permission required).
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
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
