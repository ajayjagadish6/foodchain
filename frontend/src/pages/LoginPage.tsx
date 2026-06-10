import { useState } from 'react'
import {
  Alert, Box, Button, Card, CardContent, Divider,
  Stack, TextField, Typography, Link
} from '@mui/material'
import { api } from '../lib/api'
import { setToken } from '../lib/auth'

const MISSION =
  'Perfectly good food gets wasted every day while people nearby go hungry. ' +
  'FoodChain connects surplus food donors — restaurants, cafeterias, grocers — ' +
  'directly to homeless shelters and community recipients, coordinated by volunteer drivers, ' +
  'all in real time.'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit() {
    setLoading(true)
    setError(null)
    try {
      const res = await api<{ token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setToken(res.token)
      window.location.href = '/'
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { md: '1fr 1fr' },
        minHeight: '100vh',
      }}
    >
      {/* Left panel — mission */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          px: 6,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.1, mb: 2 }}>
          FoodChain
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 400, mb: 3, opacity: 0.9 }}>
          A real-time nonprofit platform connecting surplus food donors,
          volunteers, and people in need.
        </Typography>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.3)', mb: 3 }} />
        <Typography variant="body1" sx={{ opacity: 0.85, lineHeight: 1.7 }}>
          {MISSION}
        </Typography>
        <Stack direction="row" spacing={4} mt={4}>
          {[
            { label: 'Donors', desc: 'Post surplus food' },
            { label: 'Recipients', desc: 'Request deliveries' },
            { label: 'Drivers', desc: 'Volunteer pickups' },
          ].map(r => (
            <Box key={r.label}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{r.label}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.75 }}>{r.desc}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Right panel — login form */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Card sx={{ width: 'min(440px, 100%)', boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2.5}>
              {/* Mobile-only title */}
              <Box sx={{ display: { md: 'none' } }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>FoodChain</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Connecting surplus food to people in need.
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700 }}>Sign in</Typography>

              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSubmit()}
                autoComplete="email"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSubmit()}
                autoComplete="current-password"
              />

              <Button variant="contained" size="large" onClick={onSubmit} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>

              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                <Link href="/forgot-password" underline="hover">Forgot your password?</Link>
              </Typography>

              <Divider />

              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                New here?{' '}
                <Link href="/register" underline="hover">Create an account</Link>
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                Need to verify your phone?{' '}
                <Link href={`/verify-phone?email=${encodeURIComponent(email)}`} underline="hover">
                  Verify phone
                </Link>
              </Typography>

              <Divider />

              <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                  Demo accounts (password: demo1234)
                </Typography>
                {[
                  ['donor@example.com', 'Donor'],
                  ['recipient@example.com', 'Recipient'],
                  ['driver@example.com', 'Driver'],
                  ['admin@example.com', 'Admin'],
                ].map(([addr, label]) => (
                  <Typography
                    key={addr}
                    variant="caption"
                    sx={{ display: 'block', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    onClick={() => { setEmail(addr); setPassword('demo1234') }}
                  >
                    {label}: {addr}
                  </Typography>
                ))}
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
