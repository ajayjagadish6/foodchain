import { useMemo, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, CardHeader, Link, Stack, TextField, Typography } from '@mui/material'
import { api } from '../lib/api'
import { useLocation, useNavigate } from 'react-router-dom'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

export function VerifyPhonePage() {
  const nav = useNavigate()
  const q = useQuery()
  const initialEmail = q.get('email') ?? ''
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onVerify() {
    setLoading(true)
    setError(null)
    setOk(null)
    try {
      await api('/api/auth/verify-phone', {
        method: 'POST',
        body: JSON.stringify({ email, code })
      })
      setOk('Phone verified. You can now sign in.')
      nav('/login')
    } catch (e: any) {
      setError(e?.message ?? 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  async function onResend() {
    setLoading(true)
    setError(null)
    setOk(null)
    try {
      await api('/api/auth/resend-phone', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
      setOk('Verification code sent.')
    } catch (e: any) {
      setError(e?.message ?? 'Resend failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '80vh' }}>
      <Card sx={{ width: 'min(560px, 92vw)' }}>
        <CardHeader title="Verify your mobile number" subheader="Enter the 6-digit code we texted you." />
        <CardContent>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {ok && <Alert severity="success">{ok}</Alert>}

            <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <TextField label="6-digit code" value={code} onChange={e => setCode(e.target.value)} />

            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={onVerify} disabled={loading}>
                {loading ? 'Verifying…' : 'Verify'}
              </Button>
              <Button variant="outlined" onClick={onResend} disabled={loading}>
                Resend
              </Button>
            </Stack>

            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Back to <Link href="/login" underline="hover">Sign in</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
