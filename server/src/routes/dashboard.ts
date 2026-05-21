import express from 'express'
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = express.Router()

// Get full dashboard data
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id
    const { timeRange = 'medium_term' } = req.query

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        spotifyId: true,
        displayName: true,
        email: true,
        avatar: true,
        country: true,
        product: true,
        followers: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get stats
    const [totalTracks, allHistory, recentHistory] = await Promise.all([
      prisma.listeningHistory.count({ where: { userId } }),
      prisma.listeningHistory.findMany({
        where: { userId },
        include: { track: true },
      }),
      prisma.listeningHistory.findMany({
        where: { userId },
        include: { track: true },
        orderBy: { playedAt: 'desc' },
        take: 50,
      }),
    ])

    const totalMs = allHistory.reduce((sum, h) => sum + h.track.duration, 0)
    const totalMinutes = Math.floor(totalMs / 60000)
    const uniqueArtists = new Set(allHistory.map(h => h.track.artist)).size

    const hourCounts = new Array(24).fill(0)
    recentHistory.forEach(h => {
      hourCounts[new Date(h.playedAt).getHours()]++
    })
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts))

    const genreCounts: Record<string, number> = {}
    allHistory.forEach(h => {
      h.track.genres.forEach(g => {
        genreCounts[g] = (genreCounts[g] || 0) + 1
      })
    })
    const uniqueGenres = Object.keys(genreCounts).length
    const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'

    const dates = allHistory.map(h => new Date(h.playedAt).toISOString().split('T')[0])
    const uniqueDates = [...new Set(dates)].sort()
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const date = new Date(uniqueDates[i])
      const expected = new Date(today)
      expected.setDate(expected.getDate() - streak)
      if (date.toISOString().split('T')[0] === expected.toISOString().split('T')[0]) {
        streak++
      } else {
        break
      }
    }

    const daysSinceFirst = uniqueDates.length > 0
      ? Math.max(1, Math.floor((new Date(today).getTime() - new Date(uniqueDates[0]).getTime()) / 86400000))
      : 1

    // Get top artists with counts
    const artistCounts: Record<string, { name: string; image: string | null; count: number; minutes: number }> = {}
    allHistory.forEach(h => {
      const artist = h.track.artist
      if (!artistCounts[artist]) {
        artistCounts[artist] = { name: artist, image: null, count: 0, minutes: 0 }
      }
      artistCounts[artist].count++
      artistCounts[artist].minutes += h.track.duration / 60000
    })

    const topArtists = Object.values(artistCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((a, i) => ({
        artist: {
          id: `artist-${i}`,
          spotifyArtistId: '',
          name: a.name,
          image: a.image,
          genres: [],
          popularity: 0,
          followers: 0,
          spotifyUrl: '',
        },
        playCount: a.count,
        totalMinutes: Math.floor(a.minutes),
      }))

    // Get top tracks with counts
    const trackCounts: Record<string, { 
      name: string; 
      artist: string; 
      album: string; 
      albumArt: string | null;
      count: number;
      lastPlayed: string;
    }> = {}

    allHistory.forEach(h => {
      const key = h.track.spotifyTrackId || h.track.name
      if (!trackCounts[key]) {
        trackCounts[key] = {
          name: h.track.name,
          artist: h.track.artist,
          album: h.track.album,
          albumArt: h.track.albumArt,
          count: 0,
          lastPlayed: h.playedAt.toISOString(),
        }
      }
      trackCounts[key].count++
    })

    const topTracks = Object.values(trackCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((t, i) => ({
        track: {
          id: `track-${i}`,
          spotifyTrackId: '',
          name: t.name,
          artist: t.artist,
          album: t.album,
          albumArt: t.albumArt,
          duration: 0,
          explicit: false,
          popularity: 0,
          previewUrl: null,
          spotifyUrl: '',
          genres: [],
        },
        playCount: t.count,
        lastPlayed: t.lastPlayed,
      }))

    // Get recently played
    const recentlyPlayed = recentHistory.slice(0, 20).map(h => ({
      id: h.id,
      userId: h.userId,
      trackId: h.trackId,
      track: {
        id: h.track.id,
        spotifyTrackId: h.track.spotifyTrackId,
        name: h.track.name,
        artist: h.track.artist,
        album: h.track.album,
        albumArt: h.track.albumArt,
        duration: h.track.duration,
        explicit: h.track.explicit,
        popularity: h.track.popularity,
        previewUrl: h.track.previewUrl,
        spotifyUrl: h.track.spotifyUrl,
        genres: h.track.genres,
      },
      playedAt: h.playedAt.toISOString(),
      context: h.context,
    }))

    // Get heatmap
    const heatmapHistory = await prisma.listeningHistory.findMany({
      where: {
        userId,
        playedAt: {
          gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        },
      },
      include: { track: true },
    })

    const heatmapData: Record<string, { count: number; minutes: number }> = {}
    heatmapHistory.forEach(h => {
      const date = new Date(h.playedAt)
      const key = `${date.toISOString().split('T')[0]}_${date.getHours()}`
      if (!heatmapData[key]) {
        heatmapData[key] = { count: 0, minutes: 0 }
      }
      heatmapData[key].count++
      heatmapData[key].minutes += h.track.duration / 60000
    })

    const maxCount = Math.max(...Object.values(heatmapData).map(d => d.count), 1)
    const heatmap = Object.entries(heatmapData).map(([key, data]) => {
      const [date, hour] = key.split('_')
      return {
        date,
        hour: parseInt(hour),
        count: data.count,
        minutes: Math.floor(data.minutes),
        intensity: data.count / maxCount,
      }
    })

    // Get genres
    const colors = ['#7c3aed', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#6366f1']
    const genres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }))

    // Get trends
    const trendsHistory = await prisma.listeningHistory.findMany({
      where: {
        userId,
        playedAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
      include: { track: true },
    })

    const dailyData: Record<string, { minutes: number; tracks: number }> = {}
    trendsHistory.forEach(h => {
      const date = new Date(h.playedAt).toISOString().split('T')[0]
      if (!dailyData[date]) {
        dailyData[date] = { minutes: 0, tracks: 0 }
      }
      dailyData[date].minutes += h.track.duration / 60000
      dailyData[date].tracks++
    })

    const listeningTrends = Object.entries(dailyData).map(([date, data]) => ({
      date,
      minutes: Math.floor(data.minutes),
      tracks: data.tracks,
    }))

    // Personality (simplified)
    const isNightOwl = peakHour >= 22 || peakHour <= 4
    const isExplorer = uniqueArtists > 50
    const isHeavy = avgDailyMinutes > 180
    const avgDailyMinutes = Math.floor(totalMinutes / daysSinceFirst)

    let archetype = 'Sonic Wanderer'
    let description = 'You traverse the vast landscape of music with an open mind.'
    let traits = ['Curious', 'Open-Minded', 'Balanced']
    let dominantMood = 'Balanced'
    let listeningStyle = 'Explorer'
    let timeOfDay = 'All Day'
    let energyLevel = 50
    let uniqueness = 50

    if (isNightOwl) {
      archetype = 'Late-Night Indie Addict'
      description = 'You find your deepest connections with music in the quiet hours.'
      traits = ['Introspective', 'Emotionally Deep', 'Night Owl']
      dominantMood = 'Melancholic'
      listeningStyle = 'Deep Diver'
      timeOfDay = 'Night'
      energyLevel = 30
      uniqueness = 75
    } else if (isHeavy && isExplorer) {
      archetype = 'Chaotic Shuffle Goblin'
      description = 'Your music library is a beautiful mess of sonic exploration.'
      traits = ['Eclectic', 'Adventurous', 'Unpredictable']
      dominantMood = 'Energetic'
      listeningStyle = 'Shuffle Master'
      timeOfDay = 'All Day'
      energyLevel = 85
      uniqueness = 90
    }

    // Roast
    const roasts: { text: string; severity: 'mild' | 'medium' | 'savage'; categories: string[] } = []

    if (topTracks[0]?.playCount > 30) {
      roasts.push({
        text: `You've played "${topTracks[0].track.name}" ${topTracks[0].playCount} times. That's not a favorite song, that's a hostage situation.`,
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
    if (roasts.length === 0) {
      roasts.push({
        text: 'Your music taste is so perfectly balanced that even the roast generator is struggling. Suspicious.',
        severity: 'mild',
        categories: ['suspiciously perfect'],
      })
    }

    const selectedRoast = roasts[Math.floor(Math.random() * roasts.length)]

    res.json({
      user,
      stats: {
        totalTracks,
        totalMinutes,
        uniqueArtists,
        uniqueGenres,
        avgDailyMinutes,
        peakHour,
        streakDays: streak,
        topGenre,
      },
      topArtists,
      topTracks,
      recentlyPlayed,
      heatmap,
      genres,
      personality: {
        archetype,
        description,
        traits,
        score: Math.min(100, Math.floor((uniqueArtists / 100) * 100 + (totalMinutes / 100))),
        dominantMood,
        listeningStyle,
        timeOfDay,
        energyLevel,
        uniqueness,
      },
      roast: {
        roast: selectedRoast.text,
        severity: selectedRoast.severity,
        categories: selectedRoast.categories,
      },
      listeningTrends,
    })
  } catch (error) {
    console.error('Get dashboard error:', error)
    res.status(500).json({ error: 'Failed to get dashboard data' })
  }
})

export default router
