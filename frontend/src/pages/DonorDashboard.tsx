import { useEffect, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, CardHeader, Grid, Stack, TextField, Typography } from '@mui/material'
import { api } from '../lib/api'
import { StatusChip } from '../components/StatusChip'

type Donation = {
  id: number
  title: string
  description?: string
  category: string
  quantity: string
  pickupAddress: string
  pickupLat: number
  pickupLng: number
  status: string
}

export function DonorDashboard() {
  const [mine, setMine] = useState<Donation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: 'Fresh bread',
    description: 'Bagels and loaves',
    category: 'BAKERY',
    quantity: '10 boxes',
    pickupAddress: 'San Francisco, CA',
    pickupLat: 37.7749,
    pickupLng: -122.4194
  })

  async function refresh() {
    try {
      const res = await api<Donation[]>('/api/donations/mine')
      setMine(res)
    } catch (e: any) {
      setError(e.message)
    }
  }

  useEffect(() => { refresh() }, [])

  async function submit() {
    setError(null)
    try {
      await api<Donation>('/api/donations', { method: 'POST', body: JSON.stringify(form) })
      await refresh()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>Donor Dashboard</Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardHeader title="Post a Donation" subheader="Matching runs automatically after you post" />
            <CardContent>
              <Stack spacing={2}>
                <TextField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                <TextField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <TextField label="Category (e.g., BAKERY, PRODUCE)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                <TextField label="Quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                <TextField label="Pickup Address" value={form.pickupAddress} onChange={e => setForm({ ...form, pickupAddress: e.target.value })} />
                <TextField label="Pickup Lat" type="number" value={form.pickupLat} onChange={e => setForm({ ...form, pickupLat: Number(e.target.value) })} />
                <TextField label="Pickup Lng" type="number" value={form.pickupLng} onChange={e => setForm({ ...form, pickupLng: Number(e.target.value) })} />
                <Button variant="contained" onClick={submit}>Post donation</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card>
            <CardHeader title="My Donations" subheader="Newest first" action={<Button onClick={refresh}>Refresh</Button>} />
            <CardContent>
              <Stack spacing={1}>
                {mine.length === 0 ? (
                  <Typography sx={{ opacity: 0.7 }}>No donations yet.</Typography>
                ) : mine.map(d => (
                  <Box key={d.id} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontWeight: 700 }}>{d.title}</Typography>
                      <StatusChip status={d.status} />
                    </Stack>
                    <Typography variant="body2" sx={{ opacity: 0.75 }}>{d.category} · {d.quantity}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.75 }}>{d.pickupAddress}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}
