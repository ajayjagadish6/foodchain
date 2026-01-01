import { ReactNode } from 'react'
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import { clearToken, getEmail, getRole } from '../lib/auth'
import { useNavigate } from 'react-router-dom'

export function AppShell({ children }: { children: ReactNode }) {
  const nav = useNavigate()
  const role = getRole()
  const email = getEmail()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            FoodChain
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, opacity: 0.9 }}>
            {role} · {email}
          </Typography>
          <Button
            color="inherit"
            onClick={() => {
              clearToken()
              nav('/login')
              window.location.reload()
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  )
}
