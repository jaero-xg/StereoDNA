import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useAppStore } from '@/store'
import { api } from '@/lib/api'

// Pages
import LandingPage from '@/pages/LandingPage'
import DashboardPage from '@/pages/DashboardPage'
import ProfilePage from '@/pages/ProfilePage'
import CallbackPage from '@/pages/CallbackPage'

// Components
import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import LoadingScreen from '@/components/LoadingScreen'

function App() {
  const { setUser, setAuthenticated, setLoading, isLoading } = useAppStore()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          setLoading(false)
          return
        }

        const response = await api.get('/users/me')
        if (response.data) {
          setUser(response.data)
          setAuthenticated(true)
        }
      } catch (error) {
        console.error('Auth init failed:', error)
        localStorage.removeItem('access_token')
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [setUser, setAuthenticated, setLoading])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-text">
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/callback" element={<CallbackPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </div>
    </BrowserRouter>
  )
}

export default App
