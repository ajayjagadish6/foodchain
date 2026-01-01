import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { VerifyPhonePage } from './pages/VerifyPhonePage'
import { DonorDashboard } from './pages/DonorDashboard'
import { RecipientDashboard } from './pages/RecipientDashboard'
import { DriverDashboard } from './pages/DriverDashboard'
import { DeliveryDetail } from './pages/DeliveryDetail'
import { ProfilePage } from './pages/ProfilePage'
import { getRole, hasToken } from './lib/auth'

export default function App() {
  const authed = hasToken()
  if (!authed) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-phone" element={<VerifyPhonePage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  const role = getRole()

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            role === 'DONOR' ? <DonorDashboard /> :
            role === 'RECIPIENT' ? <RecipientDashboard /> :
            role === 'DRIVER' ? <DriverDashboard /> :
            <DonorDashboard />
          }
        />
        <Route path="/deliveries/:id" element={<DeliveryDetail />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  )
}
