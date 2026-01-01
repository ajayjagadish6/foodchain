import { useEffect, useState } from 'react'
import { Alert, Button, Card, CardContent, CardHeader, Stack, TextField, Typography } from '@mui/material'
import { api } from '../lib/api'
import { getEmail } from '../lib/auth'

type Me = {
  id: number
  email: string
  role: string
  displayName: string
  phoneNumber: string
  phoneVerified: boolean
}

export function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function load() {
    const data = await api<Me>('/api/users/me')
    setMe(data)
    setDisplayName(data.displayName)
    setPhoneNumber(data.phoneNumber)
  }

  useEffect(() => { load().catch(() => {}) }, [])

  async function onSave() {
    setLoading(true)
    setMsg(null)
    try {
      await api('/api/users/me', { method: 'PUT', body: JSON.stringify({ displayName, phoneNumber }) })
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
        body: JSON.stringify({ email: getEmail(), code })
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

  if (!me) return <Typography sx={{ opacity: 0.7 }}>Loading…</Typography>

  return (
    <Card>
      <CardHeader title="Profile" subheader={`Role: ${me.role}`} />
      <CardContent>
        <Stack spacing={2}>
          {msg && <Alert severity={msg.type}>{msg.text}</Alert>}

          <TextField label="Email" value={me.email} disabled />
          <TextField label="Display name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          <TextField
            label="Mobile number (E.164)"
            helperText="Example: +14155552671"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
          />

          <Button variant="contained" onClick={onSave} disabled={loading}>
            {loading ? 'Saving…' : 'Save'}
          </Button>

          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Phone verification
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  Status: {me.phoneVerified ? 'Verified ✅' : 'Not verified ❗'}
                </Typography>

                {!me.phoneVerified && (
                  <>
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" onClick={onResend} disabled={loading}>
                        Send / Resend code
                      </Button>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField label="6-digit code" value={code} onChange={e => setCode(e.target.value)} />
                      <Button variant="contained" onClick={onVerify} disabled={loading}>
                        Verify
                      </Button>
                    </Stack>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </CardContent>
    </Card>
  )
}
