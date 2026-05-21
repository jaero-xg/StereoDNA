import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store'
import { spotifyApi } from '@/lib/api'
import { formatDuration, formatNumber, formatRelativeTime, getPersonalityEmoji, getMoodColor } from '@/lib/utils'
import PageTransition from '@/components/animations/PageTransition'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import GenrePieChart from '@/components/charts/GenrePieChart'
import TrendsChart from '@/components/charts/TrendsChart'
import ArtistsBarChart from '@/components/charts/ArtistsBarChart'
import ListeningHeatmap from '@/components/heatmap/ListeningHeatmap'
import type { DashboardData, TimeRange } from '@/types'
import {
  Clock, Music, Users, Disc, TrendingUp, Flame,
  Brain, Sparkles, Zap, Calendar, Headphones,
  ChevronRight, Play, ExternalLink, Share2
} from 'lucide-react'
import toast from 'react-hot-toast'

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: 'short_term', label: 'Last 4 Weeks' },
  { value: 'medium_term', label: 'Last 6 Months' },
  { value: 'long_term', label: 'All Time' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function DashboardPage() {
  const { timeRange, setTimeRange } = useAppStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const response = await spotifyApi.getDashboard(timeRange)
        setData(response.data)
      } catch (error) {
        console.error('Failed to load dashboard:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [timeRange])

  if (loading) {
    return (
      <PageTransition>
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </PageTransition>
    )
  }

  if (!data) {
    return (
      <PageTransition>
        <div className="pt-24 pb-12 px-4 text-center">
          <p className="text-text-muted">Failed to load dashboard data</p>
        </div>
      </PageTransition>
    )
  }

  const { user, stats, topArtists, topTracks, recentlyPlayed, heatmap, genres, personality, roast, listeningTrends } = data

  return (
    <PageTransition>
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {user.avatar && (
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-14 h-14 rounded-full ring-2 ring-primary/30"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-white font-display">
                  Welcome back, <span className="gradient-text">{user.displayName}</span>
                </h1>
                <p className="text-text-muted text-sm">
                  Here's what's happening with your music DNA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-surface-light/60 rounded-xl p-1">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range.value
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Headphones, label: 'Total Minutes', value: formatNumber(stats.totalMinutes), color: 'text-primary-light', bg: 'bg-primary/10' },
              { icon: Music, label: 'Tracks Played', value: formatNumber(stats.totalTracks), color: 'text-accent', bg: 'bg-accent/10' },
              { icon: Users, label: 'Unique Artists', value: formatNumber(stats.uniqueArtists), color: 'text-accent-pink', bg: 'bg-accent-pink/10' },
              { icon: Flame, label: 'Day Streak', value: `${stats.streakDays} days`, color: 'text-accent-orange', bg: 'bg-accent-orange/10' },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={itemVariants}>
                <Card className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-text-muted">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Artists */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Top Artists</CardTitle>
                  <Badge variant="primary">{timeRange.replace('_', ' ')}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topArtists.slice(0, 5).map((artist, i) => (
                      <motion.div
                        key={artist.artist.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                      >
                        <span className="w-8 text-center text-lg font-bold text-text-dim">
                          {i + 1}
                        </span>
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                          {artist.artist.image ? (
                            <img src={artist.artist.image} alt={artist.artist.name} className="w-full h-full object-cover" />
                          ) : (
                            <Music className="w-6 h-6 text-text-muted" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{artist.artist.name}</p>
                          <p className="text-sm text-text-muted">{artist.playCount} plays</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-text-muted">{artist.totalMinutes} min</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Personality Card */}
            <motion.div variants={itemVariants}>
              <Card className="h-full glow-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary-light" />
                    Music Personality
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    {getPersonalityEmoji(personality.archetype)}
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">{personality.archetype}</h3>
                  <p className="text-sm text-text-muted mb-4">{personality.description}</p>
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {personality.traits.map(trait => (
                      <Badge key={trait} variant="primary">{trait}</Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-surface-light/60 rounded-lg p-2">
                      <p className="text-text-dim">Style</p>
                      <p className="text-white font-medium">{personality.listeningStyle}</p>
                    </div>
                    <div className="bg-surface-light/60 rounded-lg p-2">
                      <p className="text-text-dim">Time</p>
                      <p className="text-white font-medium">{personality.timeOfDay}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">Energy Level</span>
                      <div className="w-24 h-2 bg-surface-light rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${personality.energyLevel}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">Uniqueness</span>
                      <div className="w-24 h-2 bg-surface-light rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${personality.uniqueness}%` }}
                          transition={{ duration: 1, delay: 0.7 }}
                          className="h-full bg-gradient-to-r from-accent-pink to-primary rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Roast Section */}
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-pink/10 via-transparent to-accent-orange/10" />
              <CardContent className="relative p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-pink to-accent-orange flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">Music Taste Roast</h3>
                      <Badge variant={roast.severity === 'savage' ? 'warning' : roast.severity === 'medium' ? 'accent' : 'default'}>
                        {roast.severity}
                      </Badge>
                    </div>
                    <p className="text-text-muted italic">"{roast.roast}"</p>
                    <div className="flex gap-2 mt-3">
                      {roast.categories.map(cat => (
                        <span key={cat} className="text-xs text-text-dim bg-surface-light px-2 py-1 rounded-full">
                          #{cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <GenrePieChart data={genres} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <ArtistsBarChart data={topArtists} />
            </motion.div>
          </div>

          {/* Heatmap & Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <ListeningHeatmap data={heatmap} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <TrendsChart data={listeningTrends} />
            </motion.div>
          </div>

          {/* Top Tracks */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Disc className="w-5 h-5 text-primary-light" />
                  Top Tracks
                </CardTitle>
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {topTracks.slice(0, 6).map((track, i) => (
                    <motion.div
                      key={track.track.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-surface-light to-surface-hover flex items-center justify-center overflow-hidden flex-shrink-0">
                        {track.track.albumArt ? (
                          <img src={track.track.albumArt} alt={track.track.name} className="w-full h-full object-cover" />
                        ) : (
                          <Music className="w-5 h-5 text-text-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{track.track.name}</p>
                        <p className="text-xs text-text-muted truncate">{track.track.artist}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-text-muted">{track.playCount}x</p>
                        {track.track.previewUrl && (
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-4 h-4 text-primary-light" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recently Played */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Recently Played
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentlyPlayed.slice(0, 10).map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.track.albumArt ? (
                          <img src={item.track.albumArt} alt={item.track.name} className="w-full h-full object-cover" />
                        ) : (
                          <Music className="w-4 h-4 text-text-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{item.track.name}</p>
                        <p className="text-xs text-text-muted truncate">{item.track.artist}</p>
                      </div>
                      <span className="text-xs text-text-dim flex-shrink-0">
                        {formatRelativeTime(item.playedAt)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
