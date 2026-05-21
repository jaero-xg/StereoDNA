import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store'
import { spotifyApi } from '@/lib/api'
import { formatNumber, getPersonalityEmoji, getMoodColor } from '@/lib/utils'
import PageTransition from '@/components/animations/PageTransition'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import type { DashboardData } from '@/types'
import {
  Music, Users, Clock, Globe, Calendar, Share2,
  Download, TrendingUp, Award, Star, Zap, Target
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user } = useAppStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await spotifyApi.getDashboard('long_term')
        setData(response.data)
      } catch (error) {
        toast.error('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <PageTransition>
        <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </PageTransition>
    )
  }

  if (!data || !user) {
    return (
      <PageTransition>
        <div className="pt-24 pb-12 px-4 text-center">
          <p className="text-text-muted">Failed to load profile</p>
        </div>
      </PageTransition>
    )
  }

  const { stats, personality, topArtists, topTracks, genres } = data

  const handleShare = () => {
    const text = `I'm a ${personality.archetype} on StereoDNA! ${getPersonalityEmoji(personality.archetype)}

Top Genre: ${stats.topGenre}
Unique Artists: ${stats.uniqueArtists}
Total Minutes: ${formatNumber(stats.totalMinutes)}`

    if (navigator.share) {
      navigator.share({ title: 'My StereoDNA Profile', text })
    } else {
      navigator.clipboard.writeText(text)
      toast.success('Profile copied to clipboard!')
    }
  }

  return (
    <PageTransition>
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent rounded-3xl -z-10" />
          <div className="p-8 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative inline-block"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-28 h-28 rounded-full ring-4 ring-primary/30 shadow-2xl shadow-primary/20"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center ring-4 ring-primary/30">
                  <Music className="w-12 h-12 text-white" />
                </div>
              )}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-3 rounded-full border-2 border-dashed border-primary/20"
              />
            </motion.div>

            <h1 className="text-3xl font-bold text-white mt-4 font-display">{user.displayName}</h1>
            <p className="text-text-muted">{user.email}</p>

            <div className="flex items-center justify-center gap-4 mt-4">
              {user.country && (
                <Badge variant="default">
                  <Globe className="w-3 h-3 mr-1" />
                  {user.country}
                </Badge>
              )}
              <Badge variant="primary">
                <Users className="w-3 h-3 mr-1" />
                {formatNumber(user.followers)} followers
              </Badge>
              <Badge variant="accent">
                <Calendar className="w-3 h-3 mr-1" />
                Since {new Date(user.createdAt).getFullYear()}
              </Badge>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share Profile
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-light hover:bg-surface-hover text-text font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Card
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Music Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <CardContent className="relative p-8">
              <div className="text-center mb-6">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-7xl mb-4"
                >
                  {getPersonalityEmoji(personality.archetype)}
                </motion.div>
                <h2 className="text-2xl font-bold gradient-text font-display">
                  {personality.archetype}
                </h2>
                <p className="text-text-muted mt-2 max-w-md mx-auto">
                  {personality.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: Target, label: 'Archetype Score', value: `${personality.score}/100` },
                  { icon: Zap, label: 'Energy', value: `${personality.energyLevel}%` },
                  { icon: Star, label: 'Uniqueness', value: `${personality.uniqueness}%` },
                  { icon: Award, label: 'Dominant Mood', value: personality.dominantMood },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-4 rounded-xl bg-surface-light/40">
                    <stat.icon className="w-5 h-5 text-primary-light mx-auto mb-2" />
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {personality.traits.map(trait => (
                  <motion.span
                    key={trait}
                    whileHover={{ scale: 1.1 }}
                    className="px-4 py-2 rounded-full bg-primary/10 text-primary-light text-sm font-medium border border-primary/20"
                  >
                    {trait}
                  </motion.span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { icon: Clock, label: 'Total Minutes', value: formatNumber(stats.totalMinutes), color: 'text-primary-light' },
            { icon: Music, label: 'Tracks Played', value: formatNumber(stats.totalTracks), color: 'text-accent' },
            { icon: Users, label: 'Artists', value: formatNumber(stats.uniqueArtists), color: 'text-accent-pink' },
            { icon: TrendingUp, label: 'Genres', value: stats.uniqueGenres, color: 'text-accent-green' },
            { icon: Target, label: 'Peak Hour', value: `${stats.peakHour}:00`, color: 'text-accent-orange' },
            { icon: Calendar, label: 'Streak', value: `${stats.streakDays} days`, color: 'text-primary-light' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <Card className="p-4 text-center">
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-text-muted">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Top Genres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Genres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {genres.slice(0, 5).map((genre, i) => (
                  <div key={genre.name} className="flex items-center gap-3">
                    <span className="text-sm text-text-dim w-6">{i + 1}</span>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: genre.color }} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white capitalize">{genre.name}</span>
                        <span className="text-xs text-text-muted">{genre.value} plays</span>
                      </div>
                      <div className="h-2 bg-surface-light rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(genre.value / genres[0].value) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: genre.color }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Shareable Card Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Shareable Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-surface-light via-surface to-background border border-white/10 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />

                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-3">{getPersonalityEmoji(personality.archetype)}</div>
                  <h3 className="text-xl font-bold text-white font-display">{user.displayName}</h3>
                  <p className="text-primary-light font-medium">{personality.archetype}</p>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div>
                      <p className="text-lg font-bold text-white">{formatNumber(stats.totalMinutes)}</p>
                      <p className="text-xs text-text-muted">Minutes</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{stats.uniqueArtists}</p>
                      <p className="text-xs text-text-muted">Artists</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{stats.streakDays}</p>
                      <p className="text-xs text-text-muted">Day Streak</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-text-dim">stereodna.app</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  )
}
