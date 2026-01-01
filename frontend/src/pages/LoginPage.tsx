import { useState } from 'react'
import { Alert, Box, Button, Card, CardContent, CardHeader, Stack, TextField, Typography, Link } from '@mui/material'
import { api } from '../lib/api'
import { setToken } from '../lib/auth'

export function LoginPage() {
  const [email, setEmail] = useState('donor@example.com')
  const [password, setPassword] = useState('demo1234')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit() {
    setLoading(true)
    setError(null)
    try {
      const res = await api<{ token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
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
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh', p: 2 }}>
      <Card sx={{ width: 'min(520px, 100%)' }}>
        <CardHeader title="FoodChain Login" subheader="Use demo users to explore dashboards" />
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Demo users: donor@example.com, recipient@example.com, driver@example.com, admin@example.com (password: demo1234)
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <Button variant="contained" onClick={onSubmit} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              New here? <Link href="/register" underline="hover">Create an account</Link>
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Need to verify your phone? <Link href={`/verify-phone?email=${encodeURIComponent(email)}`} underline="hover">Verify phone</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
