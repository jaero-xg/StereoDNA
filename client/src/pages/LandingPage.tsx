import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import AnimatedBackground from '@/components/animations/AnimatedBackground'
import FloatingAlbums from '@/components/animations/FloatingAlbums'
import {
  Music, BarChart3, Flame, Brain, Sparkles, Zap,
  TrendingUp, Clock, Users, Radio, Headphones, Heart
} from 'lucide-react'
import { useEffect } from 'react'

const features = [
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description: 'Visualize your listening habits with beautiful, interactive charts and insights.',
    color: 'from-primary to-primary-light',
  },
  {
    icon: Flame,
    title: 'Listening Heatmap',
    description: 'See when you listen most with a GitHub-style activity visualization.',
    color: 'from-accent-orange to-accent-pink',
  },
  {
    icon: Brain,
    title: 'AI Personality',
    description: 'Discover your music archetype with fun personality analysis.',
    color: 'from-accent to-accent-green',
  },
  {
    icon: Sparkles,
    title: 'Music Roast',
    description: 'Get humorously roasted about your questionable music choices.',
    color: 'from-accent-pink to-primary',
  },
  {
    icon: TrendingUp,
    title: 'Trend Tracking',
    description: 'Watch your music taste evolve over time with detailed trends.',
    color: 'from-accent-green to-accent',
  },
  {
    icon: Clock,
    title: 'Real-time Stats',
    description: 'Track your listening streaks, peak hours, and daily averages.',
    color: 'from-primary-light to-accent',
  },
]

const stats = [
  { icon: Headphones, value: '50M+', label: 'Tracks Analyzed' },
  { icon: Users, value: '100K+', label: 'Active Users' },
  { icon: Radio, value: '24/7', label: 'Real-time Updates' },
  { icon: Heart, value: '99%', label: 'User Satisfaction' },
]

export default function LandingPage() {
  const { isAuthenticated } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleConnect = () => {
    window.location.href = 'http://localhost:3001/api/auth/spotify'
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <FloatingAlbums />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Zap className="w-4 h-4 text-primary-light" />
              <span className="text-sm text-primary-light font-medium">
                Powered by Spotify
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold font-display mb-6">
              <span className="gradient-text">Decode Your</span>
              <br />
              <span className="text-white">Music DNA</span>
            </h1>

            <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              Discover the patterns hidden in your playlists. Visualize your listening habits,
              uncover your musical personality, and get roasted for your guilty pleasures.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={handleConnect}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent text-white shadow-xl shadow-primary/25"
              >
                <Music className="w-5 h-5" />
                Connect with Spotify
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
                Explore Demo
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-6 h-6 text-primary-light mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-text-muted">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">
              Everything You Need to <span className="gradient-text">Know</span>
            </h2>
            <p className="text-text-muted max-w-xl mx-auto">
              A complete analytics suite for the modern music lover
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card glow className="h-full p-6 group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Cards */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">
              Preview Your <span className="gradient-text">Dashboard</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stat Card Preview */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Headphones className="w-5 h-5 text-primary-light" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Total Listening</p>
                    <p className="text-2xl font-bold text-white">2,847 min</p>
                  </div>
                </div>
                <div className="h-2 bg-surface-light rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '75%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  />
                </div>
              </Card>
            </motion.div>

            {/* Artist Preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6">
                <h3 className="text-sm text-text-muted mb-4">Top Artist</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-pink to-primary flex items-center justify-center">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">The Weeknd</p>
                    <p className="text-sm text-text-muted">342 plays this month</p>
                    <div className="flex gap-1 mt-2">
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary-light text-xs">R&B</span>
                      <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs">Pop</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Personality Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6">
                <h3 className="text-sm text-text-muted mb-4">Music Personality</h3>
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-4xl mb-2"
                  >
                    🌙
                  </motion.div>
                  <p className="font-semibold text-white">Late-Night Indie Addict</p>
                  <p className="text-xs text-text-muted mt-1">Peak listening: 2:00 AM</p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-surface to-accent/20 p-12 border border-white/10"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">
                Ready to Decode Your <span className="gradient-text">Music DNA?</span>
              </h2>
              <p className="text-text-muted mb-8 max-w-lg mx-auto">
                Connect your Spotify account and unlock a world of insights about your listening habits.
              </p>
              <Button
                size="lg"
                onClick={handleConnect}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent text-white shadow-xl shadow-primary/25"
              >
                <Music className="w-5 h-5" />
                Get Started Free
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Music className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">StereoDNA</span>
          </div>
          <p className="text-sm text-text-muted">
            Not affiliated with Spotify. Built for music lovers.
          </p>
        </div>
      </footer>
    </div>
  )
}
