import { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, Box, Button, Typography } from '@mui/material'

type Props = { children: ReactNode }
type State = { error: Error | null }

/**
 * Catches unhandled React render errors so the whole app doesn't go blank.
 * Design criterion: "at least 95% of test deliveries complete with no app crashes."
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[FoodChain] Unhandled render error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh', p: 3 }}>
          <Box sx={{ maxWidth: 480, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Something went wrong
            </Typography>
            <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
              {this.state.error.message}
            </Alert>
            <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
              Please try refreshing the page. If the problem persists, contact the administrator.
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                this.setState({ error: null })
                window.location.reload()
              }}
            >
              Reload page
            </Button>
          </Box>
        </Box>
      )
    }
    return this.props.children
  }
}
