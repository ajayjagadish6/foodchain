import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { VerifyPhonePage } from './pages/VerifyPhonePage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { DonorDashboard } from './pages/DonorDashboard'
import { RecipientDashboard } from './pages/RecipientDashboard'
import { DriverDashboard } from './pages/DriverDashboard'
import { DriverSchedulePage } from './pages/DriverSchedulePage'
import { AdminDashboard } from './pages/AdminDashboard'
import { DeliveryDetail } from './pages/DeliveryDetail'
import { ProfilePage } from './pages/ProfilePage'
import { getRole, hasToken } from './lib/auth'

function RoleDashboard() {
  const role = getRole()
  if (role === 'DONOR')     return <DonorDashboard />
  if (role === 'RECIPIENT') return <RecipientDashboard />
  if (role === 'DRIVER')    return <DriverDashboard />
  if (role === 'ADMIN')     return <AdminDashboard />
  return <DonorDashboard />
}

export default function App() {
  const authed = hasToken()

  // Public routes (also accessible when not logged in)
  const publicRoutes = (
    <>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-phone" element={<VerifyPhonePage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </>
  )

  if (!authed) {
    return (
      <Routes>
        {publicRoutes}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <AppShell>
      <Routes>
        {/* Public pages stay accessible when logged in too */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/register" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<RoleDashboard />} />
        <Route path="/deliveries/:id" element={<DeliveryDetail />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/schedule" element={<DriverSchedulePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  )
}
