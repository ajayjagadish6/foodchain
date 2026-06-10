import { useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Link, Stack, TextField, Typography } from '@mui/material'
import { api } from '../lib/api'

export function ResetPasswordPage() {
  // Token comes from the email link: /reset-password?token=xxxxx
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit() {
    if (!token) { setError('Reset token is missing. Please use the link from your email.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    setError(null)
    try {
      await api('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: password }),
      })
      setDone(true)
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
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Choose a new password</Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Must be at least 8 characters.
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {done ? (
              <>
                <Alert severity="success">
                  Password updated successfully.
                </Alert>
                <Typography variant="body2">
                  <Link href="/login" underline="hover">Sign in with your new password →</Link>
                </Typography>
              </>
            ) : (
              <>
                {!token && (
                  <Alert severity="warning">
                    No reset token found. Please use the link from your password-reset email.
                  </Alert>
                )}
                <TextField
                  label="New password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoFocus
                  autoComplete="new-password"
                />
                <TextField
                  label="Confirm new password"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onSubmit()}
                  autoComplete="new-password"
                />
                <Button
                  variant="contained"
                  size="large"
                  onClick={onSubmit}
                  disabled={loading || !token}
                >
                  {loading ? 'Saving…' : 'Set new password'}
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
