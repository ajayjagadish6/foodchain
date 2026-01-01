import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, CardContent, CardHeader, Stack, Typography } from '@mui/material'
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
  recipientName: string
  driverName?: string | null
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
      setNotifMsg('Notifications enabled! You will get alerts for new deliveries and status updates.')
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

  // SSE for "delivery_created" to refresh list quickly
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
      {notifMsg && <Alert severity="info">{notifMsg}</Alert>}

      <Card>
        <CardHeader title="Notifications" subheader="Optional: enable web push notifications (FCM)." action={<Button onClick={enableNotif}>Enable</Button>} />
        <CardContent>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            If configured, you will receive push notifications when new deliveries are created.
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Available Deliveries" subheader="Accept a task, then update status and send location every ~30s" action={<Button onClick={refresh}>Refresh</Button>} />
        <CardContent>
          <Stack spacing={1}>
            {items.length === 0 ? (
              <Typography sx={{ opacity: 0.7 }}>No available tasks right now.</Typography>
            ) : items.map(d => (
              <Stack key={d.id} direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between"
                sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={0.3}>
                  <Typography sx={{ fontWeight: 700 }}>Task #{d.id}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.75 }}>
                    <b>Pickup:</b> {d.pickupAddress}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.75 }}>
                    <b>Drop-off:</b> {d.dropoffAddress}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.75 }}>
                    {d.donorName} → {d.recipientName}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <StatusChip status={d.status} />
                  <Button variant="outlined" onClick={async () => {
                    try {
                      await api(`/api/deliveries/${d.id}/accept`, { method: 'POST' })
                      refresh()
                    } catch (e: any) {
                      setError(e.message)
                    }
                  }}>
                    Accept
                  </Button>
                  <Button component={RouterLink as any} to={`/deliveries/${d.id}`} variant="contained">
                    Open
                  </Button>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
