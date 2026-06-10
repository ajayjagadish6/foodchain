import { useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography, Link } from '@mui/material'
import { api } from '../lib/api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit() {
    if (!email.trim()) { setError('Email is required'); return }
    setLoading(true)
    setError(null)
    try {
      await api('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh', p: 2 }}>
      <Card sx={{ width: 'min(440px, 100%)', boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Reset your password</Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Enter your account email and we'll send you a reset link.
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {sent ? (
              <Alert severity="success">
                If that email is registered, a reset link has been sent. Check your inbox
                (and spam folder). The link expires in 2 hours.
              </Alert>
            ) : (
              <>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onSubmit()}
                  autoFocus
                />
                <Button variant="contained" size="large" onClick={onSubmit} disabled={loading}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </Button>
              </>
            )}

            <Typography variant="body2">
              <Link href="/login" underline="hover">← Back to sign in</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
