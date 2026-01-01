import { useState } from 'react'
import { Alert, Box, Button, Card, CardContent, CardHeader, MenuItem, Stack, TextField, Typography, Link } from '@mui/material'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export function RegisterPage() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('') // E.164
  const [role, setRole] = useState<'DONOR' | 'RECIPIENT' | 'DRIVER'>('DONOR')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit() {
    setLoading(true)
    setError(null)
    setOk(null)
    try {
      await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, displayName, role, phoneNumber })
      })
      setOk('Registered. Verification code sent via SMS.')
      nav(`/verify-phone?email=${encodeURIComponent(email)}`)
    } catch (e: any) {
      setError(e?.message ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '80vh' }}>
      <Card sx={{ width: 'min(560px, 92vw)' }}>
        <CardHeader title="Create your FoodChain account" subheader="Mobile number is required and must be verified." />
        <CardContent>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {ok && <Alert severity="success">{ok}</Alert>}

            <TextField label="Display name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <TextField
              label="Mobile number (E.164)"
              helperText="Example: +14155552671"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
            />
            <TextField select label="Role" value={role} onChange={e => setRole(e.target.value as any)}>
              <MenuItem value="DONOR">Donor</MenuItem>
              <MenuItem value="RECIPIENT">Recipient</MenuItem>
              <MenuItem value="DRIVER">Driver</MenuItem>
            </TextField>
            <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />

            <Button variant="contained" onClick={onSubmit} disabled={loading}>
              {loading ? 'Creating…' : 'Create account'}
            </Button>

            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Already have an account?{' '}
              <Link href="/login" underline="hover">Sign in</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
