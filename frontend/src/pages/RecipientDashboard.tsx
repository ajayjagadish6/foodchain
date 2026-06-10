import { useEffect, useState } from 'react'
import {
  Alert, Box, Button, Card, CardContent, CardHeader, Chip, Grid,
  MenuItem, Stack, TextField, Typography
} from '@mui/material'
import { api } from '../lib/api'
import { StatusChip } from '../components/StatusChip'
import { AddressAutocomplete } from '../components/AddressAutocomplete'

const CATEGORIES = [
  'BAKERY',
  'PRODUCE',
  'PREPARED_MEALS',
  'PANTRY',
  'DAIRY',
  'PROTEIN',
  'BEVERAGES',
  'OTHER',
]

type Me = {
  orgAddress?: string
  orgLat?: number
  orgLng?: number
}

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
  servingCount?: number
  dietaryNotes?: string
}

function makeEmptyForm(me: Me | null) {
  return {
    title: '',
    description: '',
    category: 'PREPARED_MEALS',
    quantity: '',
    dropoffAddress: me?.orgAddress ?? '',
    dropoffLat: me?.orgLat ?? 0,
    dropoffLng: me?.orgLng ?? 0,
    servingCount: '',
    dietaryNotes: '',
  }
}

export function RecipientDashboard() {
  const [me, setMe] = useState<Me | null>(null)
  const [mine, setMine] = useState<Request[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState(makeEmptyForm(null))
  const [submitting, setSubmitting] = useState(false)

  async function refresh() {
    try {
      const res = await api<Request[]>('/api/requests/mine')
      setMine(res)
    } catch (e: any) {
      setError(e.message)
    }
  }

  useEffect(() => {
    api<Me>('/api/users/me')
      .then(data => {
        setMe(data)
        setForm(makeEmptyForm(data))
      })
      .catch(() => {})
    refresh()
  }, [])

  async function submit() {
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.dropoffAddress.trim()) { setError('Drop-off address is required'); return }
    if (!form.quantity.trim()) { setError('Quantity needed is required'); return }
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      await api<Request>('/api/requests', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          servingCount: form.servingCount ? Number(form.servingCount) : null,
          dietaryNotes: form.dietaryNotes || null,
        }),
      })
      setForm(makeEmptyForm(me))
      setSuccess("Request posted! You'll be notified when food is matched.")
      await refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>Recipient Dashboard</Typography>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardHeader title="Request Food" subheader="We'll find the best available match near you" />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="Title *"
                  placeholder="e.g. Dinner for our shelter tonight"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />

                <TextField
                  select
                  label="Category *"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map(c => (
                    <MenuItem key={c} value={c}>{c.replace(/_/g, ' ')}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Quantity needed *"
                  placeholder="e.g. 25 servings, 3 trays"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                />

                <TextField
                  label="Number of people to serve"
                  type="number"
                  placeholder="e.g. 25"
                  value={form.servingCount}
                  onChange={e => setForm({ ...form, servingCount: e.target.value })}
                  helperText="How many people need to be fed"
                  inputProps={{ min: 1 }}
                />

                <AddressAutocomplete
                  label="Delivery address *"
                  value={form.dropoffAddress}
                  onChange={(address, lat, lng) =>
                    setForm({ ...form, dropoffAddress: address, dropoffLat: lat, dropoffLng: lng })
                  }
                />

                <TextField
                  label="Dietary requirements"
                  placeholder="e.g. vegetarian only, nut-free, halal"
                  value={form.dietaryNotes}
                  onChange={e => setForm({ ...form, dietaryNotes: e.target.value })}
                  helperText="We'll try to match donors who can meet these requirements"
                />

                <TextField
                  label="Additional notes (optional)"
                  multiline
                  rows={2}
                  placeholder="Any other details"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />

                <Button variant="contained" onClick={submit} disabled={submitting}>
                  {submitting ? 'Posting…' : 'Request food'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card>
            <CardHeader
              title="My Requests"
              subheader="Newest first"
              action={<Button onClick={refresh}>Refresh</Button>}
            />
            <CardContent>
              <Stack spacing={1}>
                {mine.length === 0 ? (
                  <Typography sx={{ opacity: 0.7 }}>No requests yet.</Typography>
                ) : mine.map(r => (
                  <Box key={r.id} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography sx={{ fontWeight: 700 }}>{r.title}</Typography>
                      <StatusChip status={r.status} />
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" mb={0.5}>
                      <Chip label={r.category.replace(/_/g, ' ')} size="small" />
                      <Chip label={r.quantity} size="small" variant="outlined" />
                      {r.servingCount != null && (
                        <Chip label={`${r.servingCount} people`} size="small" variant="outlined" color="primary" />
                      )}
                    </Stack>
                    <Typography variant="body2" sx={{ opacity: 0.75 }}>{r.dropoffAddress}</Typography>
                    {r.dietaryNotes && (
                      <Typography variant="body2" sx={{ opacity: 0.65 }}>
                        Dietary: {r.dietaryNotes}
                      </Typography>
                    )}
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
