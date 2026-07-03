import { Routes, Route, Outlet } from 'react-router'
import AuthLayout from './components/AuthLayout'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Dashboard from './pages/Dashboard'
import Organizations from './pages/Organizations'
import Nurseries from './pages/Nurseries'
import Plantations from './pages/Plantations'
import Monitoring from './pages/Monitoring'
import Satellite from './pages/Satellite'
import Verification from './pages/Verification'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'
import Notifications from './pages/Notifications'
import Tokens from './pages/Tokens'

function AuthWrapper() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AuthWrapper />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/organizations" element={<Organizations />} />
        <Route path="/nurseries" element={<Nurseries />} />
        <Route path="/plantations" element={<Plantations />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/satellite" element={<Satellite />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/tokens" element={<Tokens />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
