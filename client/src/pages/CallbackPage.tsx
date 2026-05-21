import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export default function CallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser, setAuthenticated } = useAppStore()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      toast.error('Authentication failed. Please try again.')
      navigate('/')
      return
    }

    if (token) {
      localStorage.setItem('access_token', token)

      // Fetch user data
      api.get('/users/me')
        .then(response => {
          setUser(response.data)
          setAuthenticated(true)
          toast.success('Welcome to StereoDNA!')
          navigate('/dashboard')
        })
        .catch(err => {
          console.error('Failed to fetch user:', err)
          toast.error('Failed to load user data')
          localStorage.removeItem('access_token')
          navigate('/')
        })
    } else {
      navigate('/')
    }
  }, [searchParams, navigate, setUser, setAuthenticated])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="relative w-20 h-20 mx-auto mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 rounded-full border-4 border-accent/20 border-b-accent"
          />
        </div>
        <h2 className="text-xl font-bold gradient-text font-display">Connecting...</h2>
        <p className="text-text-muted mt-2">Syncing your Spotify data</p>
      </motion.div>
    </div>
  )
}
