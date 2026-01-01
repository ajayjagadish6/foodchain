import { useEffect, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, CardHeader, Grid, Stack, TextField, Typography } from '@mui/material'
import { api } from '../lib/api'
import { StatusChip } from '../components/StatusChip'

type Request = {
  id: number
  title: string
  description?: string
  category: string
  quantity: string
  dropoffAddress: string
  dropoffLat: number
  dropoffLng: number
  status: string
}

export function RecipientDashboard() {
  const [mine, setMine] = useState<Request[]>([])
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: 'Need produce',
    description: 'Vegetables for dinner service',
    category: 'PRODUCE',
    quantity: '8 boxes',
    dropoffAddress: 'Oakland, CA',
    dropoffLat: 37.8044,
    dropoffLng: -122.2712
  })

  async function refresh() {
    try {
      const res = await api<Request[]>('/api/requests/mine')
      setMine(res)
    } catch (e: any) {
      setError(e.message)
    }
  }

  useEffect(() => { refresh() }, [])

  async function submit() {
    setError(null)
    try {
      await api<Request>('/api/requests', { method: 'POST', body: JSON.stringify(form) })
      await refresh()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>Recipient Dashboard</Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardHeader title="Post a Request" subheader="Matching runs automatically after you post" />
            <CardContent>
              <Stack spacing={2}>
                <TextField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                <TextField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <TextField label="Category (e.g., BAKERY, PRODUCE)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                <TextField label="Quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                <TextField label="Drop-off Address" value={form.dropoffAddress} onChange={e => setForm({ ...form, dropoffAddress: e.target.value })} />
                <TextField label="Drop-off Lat" type="number" value={form.dropoffLat} onChange={e => setForm({ ...form, dropoffLat: Number(e.target.value) })} />
                <TextField label="Drop-off Lng" type="number" value={form.dropoffLng} onChange={e => setForm({ ...form, dropoffLng: Number(e.target.value) })} />
                <Button variant="contained" onClick={submit}>Post request</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card>
            <CardHeader title="My Requests" subheader="Newest first" action={<Button onClick={refresh}>Refresh</Button>} />
            <CardContent>
              <Stack spacing={1}>
                {mine.length === 0 ? (
                  <Typography sx={{ opacity: 0.7 }}>No requests yet.</Typography>
                ) : mine.map(r => (
                  <Box key={r.id} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontWeight: 700 }}>{r.title}</Typography>
                      <StatusChip status={r.status} />
                    </Stack>
                    <Typography variant="body2" sx={{ opacity: 0.75 }}>{r.category} · {r.quantity}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.75 }}>{r.dropoffAddress}</Typography>
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
