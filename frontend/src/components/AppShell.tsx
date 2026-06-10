import { ReactNode } from 'react'
import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material'
import { clearToken, getEmail, getRole } from '../lib/auth'
import { useNavigate, Link as RouterLink } from 'react-router-dom'

const ROLE_LABELS: Record<string, string> = {
  DONOR: 'Donor',
  RECIPIENT: 'Recipient',
  DRIVER: 'Driver',
  ADMIN: 'Admin',
}

export function AppShell({ children }: { children: ReactNode }) {
  const nav = useNavigate()
  const role = getRole() ?? ''
  const email = getEmail()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink as any}
            to="/dashboard"
            sx={{ flexGrow: 1, fontWeight: 800, textDecoration: 'none', color: 'inherit' }}
          >
            FoodChain
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ opacity: 0.85, display: { xs: 'none', sm: 'block' } }}>
              {ROLE_LABELS[role] ?? role} · {email}
            </Typography>

            {/* Schedule link — only shown to drivers */}
            {role === 'DRIVER' && (
              <Button color="inherit" component={RouterLink as any} to="/schedule" size="small">
                Schedule
              </Button>
            )}

            <Button color="inherit" component={RouterLink as any} to="/profile" size="small">
              Profile
            </Button>
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                clearToken()
                nav('/login')
                window.location.reload()
              }}
            >
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  )
}
