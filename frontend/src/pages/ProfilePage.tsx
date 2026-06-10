import { useEffect, useRef, useState } from 'react'
import {
  Alert, Avatar, Box, Button, Card, CardContent, CardHeader,
  Stack, TextField, Typography
} from '@mui/material'
import { api } from '../lib/api'
import { getEmail, getToken } from '../lib/auth'
import { AddressAutocomplete } from '../components/AddressAutocomplete'

type Me = {
  id: number
  email: string
  role: string
  displayName: string
  phoneNumber: string
  phoneVerified: boolean
  orgName?: string
  orgAddress?: string
  orgLat?: number
  orgLng?: number
  orgLogoUrl?: string
}

export function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [code, setCode] = useState('')

  // Org fields
  const [orgName, setOrgName] = useState('')
  const [orgAddress, setOrgAddress] = useState('')
  const [orgLat, setOrgLat] = useState(0)
  const [orgLng, setOrgLng] = useState(0)
  const [orgLogoUrl, setOrgLogoUrl] = useState('')

  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  async function load() {
    const data = await api<Me>('/api/users/me')
    setMe(data)
    setDisplayName(data.displayName ?? '')
    setPhoneNumber(data.phoneNumber ?? '')
    setOrgName(data.orgName ?? '')
    setOrgAddress(data.orgAddress ?? '')
    setOrgLat(data.orgLat ?? 0)
    setOrgLng(data.orgLng ?? 0)
    setOrgLogoUrl(data.orgLogoUrl ?? '')
  }

  useEffect(() => { load().catch(() => {}) }, [])

  async function onSave() {
    setLoading(true)
    setMsg(null)
    try {
      await api('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          displayName,
          phoneNumber,
          orgName: orgName || null,
          orgAddress: orgAddress || null,
          orgLat: orgLat || null,
          orgLng: orgLng || null,
          orgLogoUrl: orgLogoUrl || null,
        }),
      })
      setMsg({ type: 'success', text: 'Profile updated.' })
      await load()
    } catch (e: any) {
      setMsg({ type: 'error', text: e?.message ?? 'Update failed' })
    } finally {
      setLoading(false)
    }
  }

  async function onResend() {
    setLoading(true)
    setMsg(null)
    try {
      await api('/api/users/me/resend-phone', { method: 'POST' })
      setMsg({ type: 'success', text: 'Verification code sent.' })
    } catch (e: any) {
      setMsg({ type: 'error', text: e?.message ?? 'Resend failed' })
    } finally {
      setLoading(false)
    }
  }

  async function onVerify() {
    setLoading(true)
    setMsg(null)
    try {
      await api('/api/auth/verify-phone', {
        method: 'POST',
        body: JSON.stringify({ email: getEmail(), code }),
      })
      setMsg({ type: 'success', text: 'Phone verified.' })
      setCode('')
      await load()
    } catch (e: any) {
      setMsg({ type: 'error', text: e?.message ?? 'Verification failed' })
    } finally {
      setLoading(false)
    }
  }

  async function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    setMsg(null)
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
      setOrgLogoUrl(json.url)
      setMsg({ type: 'success', text: 'Logo uploaded — click Save to apply.' })
    } catch (e: any) {
      setMsg({ type: 'error', text: e?.message ?? 'Logo upload failed' })
    } finally {
      setLogoUploading(false)
      // Reset input so the same file can be re-selected
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  if (!me) return <Typography sx={{ opacity: 0.7 }}>Loading…</Typography>

  const showOrgSection = me.role === 'DONOR' || me.role === 'RECIPIENT'

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>Profile</Typography>

      {/* ── Account details ──────────────────────────────────────────── */}
      <Card>
        <CardHeader title="Account" subheader={`Role: ${me.role}`} />
        <CardContent>
          <Stack spacing={2}>
            {msg && <Alert severity={msg.type} onClose={() => setMsg(null)}>{msg.text}</Alert>}

            <TextField label="Email" value={me.email} disabled />
            <TextField
              label="Display name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
            <TextField
              label="Mobile number (E.164)"
              helperText="Example: +14155552671"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
            />

            <Button variant="contained" onClick={onSave} disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ── Phone verification ───────────────────────────────────────── */}
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Phone verification
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Status: {me.phoneVerified ? 'Verified ✅' : 'Not verified ❗'}
            </Typography>

            {!me.phoneVerified && (
              <>
                <Button variant="outlined" onClick={onResend} disabled={loading} sx={{ alignSelf: 'flex-start' }}>
                  Send / Resend code
                </Button>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    label="6-digit code"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    size="small"
                  />
                  <Button variant="contained" onClick={onVerify} disabled={loading}>
                    Verify
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* ── Organization details (Donor / Recipient only) ────────────── */}
      {showOrgSection && (
        <Card>
          <CardHeader
            title="Organization details"
            subheader="Used to pre-fill addresses and shown on your public profile"
          />
          <CardContent>
            <Stack spacing={2}>
              {/* Logo upload */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={orgLogoUrl || undefined}
                  sx={{ width: 72, height: 72, bgcolor: 'action.selected', fontSize: '2rem' }}
                >
                  {!orgLogoUrl && (orgName?.[0]?.toUpperCase() ?? '?')}
                </Avatar>
                <Box>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    style={{ display: 'none' }}
                    onChange={onLogoChange}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoUploading}
                  >
                    {logoUploading ? 'Uploading…' : 'Upload logo'}
                  </Button>
                  <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.6 }}>
                    JPEG, PNG, WebP — max 8 MB
                  </Typography>
                </Box>
              </Stack>

              <TextField
                label="Organization name"
                placeholder="e.g. Green Street Bakery"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
              />

              <AddressAutocomplete
                label="Organization address"
                value={orgAddress}
                onChange={(addr, lat, lng) => {
                  setOrgAddress(addr)
                  setOrgLat(lat)
                  setOrgLng(lng)
                }}
              />

              <Button variant="contained" onClick={onSave} disabled={loading}>
                {loading ? 'Saving…' : 'Save organization details'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}
