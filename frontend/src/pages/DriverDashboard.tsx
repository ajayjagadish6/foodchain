import { useEffect, useState } from 'react'
import {
  Alert, Box, Button, Card, CardContent, CardHeader, Chip,
  Link, Stack, Typography
} from '@mui/material'
import { api } from '../lib/api'
import { StatusChip } from '../components/StatusChip'
import { Link as RouterLink } from 'react-router-dom'
import { getToken } from '../lib/auth'
import { enablePushNotifications } from '../lib/firebase'

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
  donationTitle?: string
  category?: string
  quantity?: string
  servingCount?: number
  dietaryNotes?: string
  pickupStart?: string
  pickupEnd?: string
}

export function DriverDashboard() {
  const [items, setItems] = useState<Delivery[]>([])
  const [error, setError] = useState<string | null>(null)
  const token = getToken()!
  const [notifMsg, setNotifMsg] = useState<string | null>(null)

  async function enableNotif() {
    try {
      const res = await enablePushNotifications()
      if (!res) {
        setNotifMsg('Notifications not enabled (missing config, unsupported browser, or permission denied).')
        return
      }
      setNotifMsg('Notifications enabled! You\'ll get alerts for new deliveries.')
    } catch (e: any) {
      setNotifMsg(e.message || 'Failed to enable notifications')
    }
  }

  async function refresh() {
    try {
      const res = await api<Delivery[]>('/api/deliveries/available')
      setItems(res)
    } catch (e: any) {
      setError(e.message)
    }
  }

  useEffect(() => { refresh() }, [])

  useEffect(() => {
    const es = new EventSource(`/api/stream/driver/tasks?token=${encodeURIComponent(token)}`)
    es.addEventListener('delivery_created', () => refresh())
    es.onerror = () => { /* ignore; will retry */ }
    return () => es.close()
  }, [token])

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>Driver Dashboard</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {notifMsg && <Alert severity="info" onClose={() => setNotifMsg(null)}>{notifMsg}</Alert>}

      <Card>
        <CardHeader
          title="Push Notifications"
          subheader="Get alerted instantly when new deliveries are available."
          action={<Button onClick={enableNotif}>Enable</Button>}
        />
      </Card>

      <Card>
        <CardHeader
          title="Available Tasks"
          subheader="Accept a task to claim it, then pick up and deliver."
          action={<Button onClick={refresh}>Refresh</Button>}
        />
        <CardContent>
          <Stack spacing={1.5}>
            {items.length === 0 ? (
              <Typography sx={{ opacity: 0.7 }}>No available tasks right now.</Typography>
            ) : items.map(d => (
              <Box
                key={d.id}
                sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} spacing={2}>
                  <Stack spacing={0.5} flex={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ fontWeight: 700 }}>Task #{d.id}</Typography>
                      <StatusChip status={d.status} />
                    </Stack>

                    {/* Food summary */}
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {d.category && <Chip label={d.category.replace('_', ' ')} size="small" />}
                      {d.quantity && <Chip label={d.quantity} size="small" variant="outlined" />}
                      {d.servingCount != null && (
                        <Chip label={`Serves ${d.servingCount}`} size="small" variant="outlined" color="success" />
                      )}
                    </Stack>

                    {d.dietaryNotes && (
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        Dietary: {d.dietaryNotes}
                      </Typography>
                    )}
                    {(d.pickupStart || d.pickupEnd) && (
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        Available: {d.pickupStart ?? '?'} – {d.pickupEnd ?? '?'}
                      </Typography>
                    )}

                    {/* Addresses */}
                    <Typography variant="body2">
                      <b>Pickup:</b> {d.pickupAddress}
                    </Typography>
                    <Typography variant="body2">
                      <b>Drop-off:</b> {d.dropoffAddress}
                    </Typography>

                    {/* Contacts */}
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Donor: {d.donorName}
                        {d.donorPhone && (
                          <> · <Link href={`tel:${d.donorPhone}`} underline="hover">Call</Link></>
                        )}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Recipient: {d.recipientName}
                        {d.recipientPhone && (
                          <> · <Link href={`tel:${d.recipientPhone}`} underline="hover">Call</Link></>
                        )}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
                    <Button variant="outlined" size="small" onClick={async () => {
                      try {
                        await api(`/api/deliveries/${d.id}/accept`, { method: 'POST' })
                        refresh()
                      } catch (e: any) {
                        setError(e.message)
                      }
                    }}>
                      Accept
                    </Button>
                    <Button component={RouterLink as any} to={`/deliveries/${d.id}`} variant="contained" size="small">
                      Open
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
