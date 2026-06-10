import { useEffect, useRef, useState } from 'react'
import {
  Alert, Box, Button, Card, CardContent, CardHeader, Chip, Grid,
  MenuItem, Stack, TextField, Typography
} from '@mui/material'
import { api } from '../lib/api'
import { getToken } from '../lib/auth'
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
  servingCount?: number
  pickupStart?: string
  pickupEnd?: string
  dietaryNotes?: string
  photoUrl?: string
}

function makeEmptyForm(me: Me | null) {
  return {
    title: '',
    description: '',
    category: 'PREPARED_MEALS',
    quantity: '',
    pickupAddress: me?.orgAddress ?? '',
    pickupLat: me?.orgLat ?? 0,
    pickupLng: me?.orgLng ?? 0,
    servingCount: '',
    pickupStart: '',
    pickupEnd: '',
    dietaryNotes: '',
    photoUrl: '',
  }
}

export function DonorDashboard() {
  const [me, setMe] = useState<Me | null>(null)
  const [mine, setMine] = useState<Donation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState(makeEmptyForm(null))
  const [submitting, setSubmitting] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  async function refresh() {
    try {
      const res = await api<Donation[]>('/api/donations/mine')
      setMine(res)
    } catch (e: any) {
      setError(e.message)
    }
  }

  useEffect(() => {
    // Load user's org address to pre-fill
    api<Me>('/api/users/me')
      .then(data => {
        setMe(data)
        setForm(makeEmptyForm(data))
      })
      .catch(() => {})
    refresh()
  }, [])

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const token = getToken()
      const res = await fetch('/api/uploads/donation-photo', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })
      if (!res.ok) {
        const t = await res.text().catch(() => '')
        throw new Error(t || 'Upload failed')
      }
      const json = await res.json() as { url: string }
      setForm(f => ({ ...f, photoUrl: json.url }))
    } catch (e: any) {
      setError(e?.message ?? 'Photo upload failed')
    } finally {
      setPhotoUploading(false)
      if (photoInputRef.current) photoInputRef.current.value = ''
    }
  }

  async function submit() {
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.pickupAddress.trim()) { setError('Pickup address is required'); return }
    if (!form.quantity.trim()) { setError('Quantity is required'); return }
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      await api<Donation>('/api/donations', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          servingCount: form.servingCount ? Number(form.servingCount) : null,
          pickupStart: form.pickupStart || null,
          pickupEnd: form.pickupEnd || null,
          dietaryNotes: form.dietaryNotes || null,
          photoUrl: form.photoUrl || null,
        }),
      })
      setForm(makeEmptyForm(me))
      setSuccess("Donation posted! We'll notify you when it's matched.")
      await refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>Donor Dashboard</Typography>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardHeader title="Post a Donation" subheader="Matching runs automatically after you post" />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="Title *"
                  placeholder="e.g. Fresh sandwiches from today's service"
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
                  label="Quantity *"
                  placeholder="e.g. 30 servings, 5 trays, 2 bags"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                />

                <TextField
                  label="Number of people served"
                  type="number"
                  placeholder="e.g. 20"
                  value={form.servingCount}
                  onChange={e => setForm({ ...form, servingCount: e.target.value })}
                  helperText="Approximate number of people this food serves"
                  inputProps={{ min: 1 }}
                />

                <AddressAutocomplete
                  label="Pickup address *"
                  value={form.pickupAddress}
                  onChange={(address, lat, lng) =>
                    setForm({ ...form, pickupAddress: address, pickupLat: lat, pickupLng: lng })
                  }
                />

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Available from"
                    type="time"
                    value={form.pickupStart}
                    onChange={e => setForm({ ...form, pickupStart: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    label="Available until"
                    type="time"
                    value={form.pickupEnd}
                    onChange={e => setForm({ ...form, pickupEnd: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Stack>

                <TextField
                  label="Dietary notes"
                  placeholder="e.g. vegetarian, contains nuts, halal"
                  value={form.dietaryNotes}
                  onChange={e => setForm({ ...form, dietaryNotes: e.target.value })}
                />

                <TextField
                  label="Description (optional)"
                  multiline
                  rows={2}
                  placeholder="Any extra details about the food"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />

                {/* Photo upload */}
                <Box>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    style={{ display: 'none' }}
                    onChange={onPhotoChange}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={photoUploading}
                  >
                    {photoUploading ? 'Uploading photo…' : form.photoUrl ? 'Change photo' : 'Add food photo (optional)'}
                  </Button>
                  {form.photoUrl && (
                    <Box mt={1}>
                      <img
                        src={form.photoUrl}
                        alt="Food preview"
                        style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8, objectFit: 'cover' }}
                      />
                    </Box>
                  )}
                </Box>

                <Button variant="contained" onClick={submit} disabled={submitting || photoUploading}>
                  {submitting ? 'Posting…' : 'Post donation'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card>
            <CardHeader
              title="My Donations"
              subheader="Newest first"
              action={<Button onClick={refresh}>Refresh</Button>}
            />
            <CardContent>
              <Stack spacing={1}>
                {mine.length === 0 ? (
                  <Typography sx={{ opacity: 0.7 }}>No donations yet.</Typography>
                ) : mine.map(d => (
                  <Box key={d.id} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        {d.photoUrl && (
                          <img
                            src={d.photoUrl}
                            alt={d.title}
                            style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                          />
                        )}
                        <Typography sx={{ fontWeight: 700 }}>{d.title}</Typography>
                      </Stack>
                      <StatusChip status={d.status} />
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" mb={0.5}>
                      <Chip label={d.category.replace(/_/g, ' ')} size="small" />
                      <Chip label={d.quantity} size="small" variant="outlined" />
                      {d.servingCount != null && (
                        <Chip label={`Serves ${d.servingCount}`} size="small" variant="outlined" color="success" />
                      )}
                    </Stack>
                    <Typography variant="body2" sx={{ opacity: 0.75 }}>{d.pickupAddress}</Typography>
                    {(d.pickupStart || d.pickupEnd) && (
                      <Typography variant="body2" sx={{ opacity: 0.65 }}>
                        Available: {d.pickupStart ?? '?'} – {d.pickupEnd ?? '?'}
                      </Typography>
                    )}
                    {d.dietaryNotes && (
                      <Typography variant="body2" sx={{ opacity: 0.65 }}>
                        Notes: {d.dietaryNotes}
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
