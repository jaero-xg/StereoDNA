import express from 'express'
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = express.Router()

// Get listening stats
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id

    const [
      totalTracks,
      totalMinutes,
      uniqueArtists,
      uniqueGenres,
      recentHistory,
    ] = await Promise.all([
      prisma.listeningHistory.count({ where: { userId } }),
      prisma.listeningHistory.findMany({
        where: { userId },
        include: { track: true },
      }),
      prisma.listeningHistory.groupBy({
        by: ['trackId'],
        where: { userId },
        _count: true,
      }),
      prisma.track.findMany({
        where: {
          listeningHistory: { some: { userId } },
        },
        select: { genres: true },
      }),
      prisma.listeningHistory.findMany({
        where: { userId },
        orderBy: { playedAt: 'desc' },
        take: 100,
        include: { track: true },
      }),
    ])

    const totalMs = totalMinutes.reduce((sum, h) => sum + h.track.duration, 0)
    const totalMinutesCalc = Math.floor(totalMs / 60000)

    // Calculate peak hour
    const hourCounts = new Array(24).fill(0)
    recentHistory.forEach(h => {
      const hour = new Date(h.playedAt).getHours()
      hourCounts[hour]++
    })
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts))

    // Calculate streak
    const dates = recentHistory.map(h => 
      new Date(h.playedAt).toISOString().split('T')[0]
    )
    const uniqueDates = [...new Set(dates)].sort()
    let streak = 0
    const today = new Date().toISOString().split('T')[0]

    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const date = new Date(uniqueDates[i])
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - streak)

      if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++
      } else {
        break
      }
    }

    // Get top genre
    const genreCounts: Record<string, number> = {}
    uniqueGenres.forEach(t => {
      t.genres.forEach(g => {
        genreCounts[g] = (genreCounts[g] || 0) + 1
      })
    })
    const topGenre = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'

    const daysSinceFirst = uniqueDates.length > 0
      ? Math.max(1, Math.floor((new Date(today).getTime() - new Date(uniqueDates[0]).getTime()) / 86400000))
      : 1

    res.json({
      totalTracks,
      totalMinutes: totalMinutesCalc,
      uniqueArtists: uniqueArtists.length,
      uniqueGenres: Object.keys(genreCounts).length,
      avgDailyMinutes: Math.floor(totalMinutesCalc / daysSinceFirst),
      peakHour,
      streakDays: streak,
      topGenre,
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ error: 'Failed to get stats' })
  }
})

// Get heatmap data
router.get('/heatmap', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id
    const history = await prisma.listeningHistory.findMany({
      where: {
        userId,
        playedAt: {
          gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
        },
      },
      include: { track: true },
      orderBy: { playedAt: 'asc' },
    })

    // Group by date and hour
    const heatmapData: Record<string, { count: number; minutes: number }> = {}

    history.forEach(h => {
      const date = new Date(h.playedAt)
      const key = `${date.toISOString().split('T')[0]}_${date.getHours()}`

      if (!heatmapData[key]) {
        heatmapData[key] = { count: 0, minutes: 0 }
      }
      heatmapData[key].count++
      heatmapData[key].minutes += h.track.duration / 60000
    })

    const maxCount = Math.max(...Object.values(heatmapData).map(d => d.count), 1)

    const result = Object.entries(heatmapData).map(([key, data]) => {
      const [date, hour] = key.split('_')
      return {
        date,
        hour: parseInt(hour),
        count: data.count,
        minutes: Math.floor(data.minutes),
        intensity: data.count / maxCount,
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Get heatmap error:', error)
    res.status(500).json({ error: 'Failed to get heatmap' })
  }
})

// Get genre distribution
router.get('/genres', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id
    const history = await prisma.listeningHistory.findMany({
      where: { userId },
      include: { track: true },
    })

    const genreCounts: Record<string, number> = {}
    history.forEach(h => {
      h.track.genres.forEach(g => {
        genreCounts[g] = (genreCounts[g] || 0) + 1
      })
    })

    const colors = [
      '#7c3aed', '#06b6d4', '#ec4899', '#f59e0b', '#10b981',
      '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#6366f1',
    ]

    const result = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value], i) => ({
        name,
        value,
        color: colors[i % colors.length],
      }))

    res.json(result)
  } catch (error) {
    console.error('Get genres error:', error)
    res.status(500).json({ error: 'Failed to get genres' })
  }
})

// Get personality profile
router.get('/personality', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id

    const [history, stats] = await Promise.all([
      prisma.listeningHistory.findMany({
        where: { userId },
        include: { track: true },
        orderBy: { playedAt: 'desc' },
        take: 100,
      }),
      prisma.listeningHistory.findMany({
        where: { userId },
        include: { track: true },
      }),
    ])

    const genres: string[] = []
    const hourCounts = new Array(24).fill(0)
    const totalMs = stats.reduce((sum, h) => sum + h.track.duration, 0)
    const totalMinutes = Math.floor(totalMs / 60000)

    history.forEach(h => {
      genres.push(...h.track.genres)
      hourCounts[new Date(h.playedAt).getHours()]++
    })

    const peakHour = hourCounts.indexOf(Math.max(...hourCounts))
    const isNightOwl = peakHour >= 22 || peakHour <= 4
    const isEarlyBird = peakHour >= 5 && peakHour <= 8
    const isHeavy = totalMinutes > 300 * 7

    const uniqueArtists = new Set(stats.map(h => h.track.artist)).size
    const isExplorer = uniqueArtists > 50

    const genreCounts: Record<string, number> = {}
    genres.forEach(g => {
      genreCounts[g] = (genreCounts[g] || 0) + 1
    })
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([g]) => g)

    // Determine archetype
    let archetype = 'Sonic Wanderer'
    let description = 'You traverse the vast landscape of music with an open mind and curious spirit.'
    let traits = ['Curious', 'Open-Minded', 'Balanced', 'Appreciative']
    let dominantMood = 'Balanced'
    let listeningStyle = 'Explorer'
    let timeOfDay = 'All Day'
    let energyLevel = 50
    let uniqueness = 50

    if (isNightOwl && topGenres.some(g => g.includes('indie'))) {
      archetype = 'Late-Night Indie Addict'
      description = 'You find your deepest connections with music in the quiet hours, when the world sleeps.'
      traits = ['Introspective', 'Emotionally Deep', 'Night Owl', 'Curator']
      dominantMood = 'Melancholic'
      listeningStyle = 'Deep Diver'
      timeOfDay = 'Night'
      energyLevel = 30
      uniqueness = 75
    } else if (isHeavy && isExplorer) {
      archetype = 'Chaotic Shuffle Goblin'
      description = 'Your music library is a beautiful mess. You jump from genre to genre like a musical pinball.'
      traits = ['Eclectic', 'Adventurous', 'Unpredictable', 'Voracious']
      dominantMood = 'Energetic'
      listeningStyle = 'Shuffle Master'
      timeOfDay = 'All Day'
      energyLevel = 85
      uniqueness = 90
    } else if (topGenres.some(g => g.includes('electronic') || g.includes('house'))) {
      archetype = 'Synthwave Drifter'
      description = 'You exist in a neon-lit digital dreamscape where analog warmth meets cybernetic precision.'
      traits = ['Futuristic', 'Rhythmic', 'Nocturnal', 'Atmospheric']
      dominantMood = 'Focused'
      listeningStyle = 'Flow State'
      timeOfDay = 'Night'
      energyLevel = 70
      uniqueness = 80
    } else if (isEarlyBird) {
      archetype = 'Morning Melody Architect'
      description = 'You build your day on a foundation of sound. The sunrise is just background music.'
      traits = ['Disciplined', 'Optimistic', 'Methodical', 'Energetic']
      dominantMood = 'Happy'
      listeningStyle = 'Routine Builder'
      timeOfDay = 'Morning'
      energyLevel = 65
      uniqueness = 45
    }

    res.json({
      archetype,
      description,
      traits,
      score: Math.min(100, Math.floor((uniqueArtists / 100) * 100 + (totalMinutes / 100))),
      dominantMood,
      listeningStyle,
      timeOfDay,
      energyLevel,
      uniqueness,
    })
  } catch (error) {
    console.error('Get personality error:', error)
    res.status(500).json({ error: 'Failed to get personality' })
  }
})

// Get roast
router.get('/roast', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id

    const [topArtists, topTracks, stats] = await Promise.all([
      prisma.listeningHistory.findMany({
        where: { userId },
        include: { track: true },
        orderBy: { playedAt: 'desc' },
        take: 50,
      }),
      prisma.listeningHistory.findMany({
        where: { userId },
        include: { track: true },
        orderBy: { playedAt: 'desc' },
        take: 50,
      }),
      prisma.listeningHistory.findMany({
        where: { userId },
        include: { track: true },
      }),
    ])

    // Count artist plays
    const artistCounts: Record<string, { name: string; count: number }> = {}
    topArtists.forEach(h => {
      const artist = h.track.artist
      if (!artistCounts[artist]) {
        artistCounts[artist] = { name: artist, count: 0 }
      }
      artistCounts[artist].count++
    })

    // Count track plays
    const trackCounts: Record<string, { name: string; count: number }> = {}
    topTracks.forEach(h => {
      const track = h.track.name
      if (!trackCounts[track]) {
        trackCounts[track] = { name: track, count: 0 }
      }
      trackCounts[track].count++
    })

    const sortedArtists = Object.values(artistCounts).sort((a, b) => b.count - a.count)
    const sortedTracks = Object.values(trackCounts).sort((a, b) => b.count - a.count)

    const totalMs = stats.reduce((sum, h) => sum + h.track.duration, 0)
    const totalMinutes = Math.floor(totalMs / 60000)
    const uniqueArtists = Object.keys(artistCounts).length
    const daysSinceFirst = stats.length > 0
      ? Math.max(1, Math.floor((Date.now() - new Date(stats[0].playedAt).getTime()) / 86400000))
      : 1
    const avgDaily = Math.floor(totalMinutes / daysSinceFirst)

    const roasts: { text: string; severity: 'mild' | 'medium' | 'savage'; categories: string[] }[] = []

    if (sortedTracks[0]?.count > 30) {
      roasts.push({
        text: `You've played "${sortedTracks[0].name}" ${sortedTracks[0].count} times. That's not a favorite song, that's a hostage situation.`,
        severity: 'medium',
        categories: ['repeat offender'],
      })
    }

    if (uniqueArtists < 15) {
      roasts.push({
        text: `Only ${uniqueArtists} unique artists? Your music taste has fewer options than a vending machine in a hospital.`,
        severity: 'savage',
        categories: ['lack of diversity'],
      })
    }

    if (avgDaily > 300) {
      roasts.push({
        text: `${Math.floor(avgDaily / 60)} hours a day? Your ears are going to file for emancipation.`,
        severity: 'medium',
        categories: ['excessive listening'],
      })
    }

    const mainstream = ['Taylor Swift', 'Drake', 'Ed Sheeran', 'The Weeknd', 'Bad Bunny', 'Ariana Grande']
    if (sortedArtists.some(a => mainstream.some(m => a.name.toLowerCase().includes(m.toLowerCase())))) {
      roasts.push({
        text: 'Your top artists are so mainstream, Spotify uses your playlist to train their algorithm for people who say "I listen to everything".',
        severity: 'mild',
        categories: ['mainstream'],
      })
    }

    if (roasts.length === 0) {
      roasts.push({
        text: 'Your music taste is so perfectly balanced that even the roast generator is struggling. Suspicious.',
        severity: 'mild',
        categories: ['suspiciously perfect'],
      })
    }

    const savage = roasts.filter(r => r.severity === 'savage')
    const medium = roasts.filter(r => r.severity === 'medium')
    const selected = savage.length > 0 
      ? savage[Math.floor(Math.random() * savage.length)]
      : medium.length > 0
      ? medium[Math.floor(Math.random() * medium.length)]
      : roasts[Math.floor(Math.random() * roasts.length)]

    res.json({
      roast: selected.text,
      severity: selected.severity,
      categories: selected.categories,
    })
  } catch (error) {
    console.error('Get roast error:', error)
    res.status(500).json({ error: 'Failed to get roast' })
  }
})

// Get listening trends
router.get('/trends', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id
    const history = await prisma.listeningHistory.findMany({
      where: {
        userId,
        playedAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      },
      include: { track: true },
      orderBy: { playedAt: 'asc' },
    })

    // Group by date
    const dailyData: Record<string, { minutes: number; tracks: number }> = {}

    history.forEach(h => {
      const date = new Date(h.playedAt).toISOString().split('T')[0]
      if (!dailyData[date]) {
        dailyData[date] = { minutes: 0, tracks: 0 }
      }
      dailyData[date].minutes += h.track.duration / 60000
      dailyData[date].tracks++
    })

    const result = Object.entries(dailyData).map(([date, data]) => ({
      date,
      minutes: Math.floor(data.minutes),
      tracks: data.tracks,
    }))

    res.json(result)
  } catch (error) {
    console.error('Get trends error:', error)
    res.status(500).json({ error: 'Failed to get trends' })
  }
})

export default router
