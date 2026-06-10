import { useEffect, useState } from 'react'
import {
  Alert, Box, Button, Card, CardContent, CardHeader, Chip,
  Grid, Stack, Typography
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { api } from '../lib/api'
import { StatusChip } from '../components/StatusChip'

type Stats = {
  totalDonations: number
  openDonations: number
  totalRequests: number
  openRequests: number
  totalDeliveries: number
  deliveredCount: number
  inProgressCount: number
  totalUsers: number
}

type Delivery = {
  id: number
  status: string
  donorName: string
  recipientName: string
  driverName?: string | null
  pickupAddress: string
  dropoffAddress: string
  category?: string
  servingCount?: number
  dietaryNotes?: string
}

function StatCard({ label, value, sub }: { label: string, value: number, sub?: string }) {
  return (
    <Card sx={{ textAlign: 'center', p: 1 }}>
      <CardContent>
        <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>{value}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>{label}</Typography>
        {sub && <Typography variant="body2" sx={{ opacity: 0.65 }}>{sub}</Typography>}
      </CardContent>
    </Card>
  )
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    try {
      const [s, d] = await Promise.all([
        api<Stats>('/api/admin/stats'),
        api<Delivery[]>('/api/admin/deliveries'),
      ])
      setStats(s)
      setDeliveries(d)
    } catch (e: any) {
      setError(e.message)
    }
  }

  useEffect(() => { refresh() }, [])

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Admin Dashboard</Typography>
        <Button onClick={refresh}>Refresh</Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {stats && (
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <StatCard label="Donations" value={stats.totalDonations} sub={`${stats.openDonations} open`} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Requests" value={stats.totalRequests} sub={`${stats.openRequests} open`} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Deliveries" value={stats.totalDeliveries} sub={`${stats.deliveredCount} completed`} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Users" value={stats.totalUsers} sub={`${stats.inProgressCount} in-progress`} />
          </Grid>
        </Grid>
      )}

      <Card>
        <CardHeader title="All Deliveries" subheader="Most recent first" />
        <CardContent>
          <Stack spacing={1}>
            {deliveries.length === 0 ? (
              <Typography sx={{ opacity: 0.7 }}>No deliveries yet.</Typography>
            ) : deliveries.map(d => (
              <Box key={d.id} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
                  <Stack spacing={0.3} flex={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ fontWeight: 700 }}>#{d.id}</Typography>
                      <StatusChip status={d.status} />
                      {d.category && <Chip label={d.category.replace('_', ' ')} size="small" />}
                      {d.servingCount != null && (
                        <Chip label={`${d.servingCount} served`} size="small" variant="outlined" color="success" />
                      )}
                    </Stack>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {d.donorName} → {d.recipientName}
                      {d.driverName ? ` (Driver: ${d.driverName})` : ' (no driver yet)'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.65 }}>
                      {d.pickupAddress} → {d.dropoffAddress}
                    </Typography>
                    {d.dietaryNotes && (
                      <Typography variant="body2" sx={{ opacity: 0.6 }}>Dietary: {d.dietaryNotes}</Typography>
                    )}
                  </Stack>
                  <Button
                    component={RouterLink as any}
                    to={`/deliveries/${d.id}`}
                    variant="outlined"
                    size="small"
                    sx={{ flexShrink: 0 }}
                  >
                    View
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
