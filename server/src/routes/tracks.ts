import express from 'express'
import axios from 'axios'
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = express.Router()
const SPOTIFY_API_URL = 'https://api.spotify.com/v1'

// Get top tracks
router.get('/top', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { time_range = 'medium_term', limit = '20' } = req.query
    const accessToken = req.user!.accessToken

    const response = await axios.get(
      `${SPOTIFY_API_URL}/me/top/tracks`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { time_range, limit: parseInt(limit as string) },
      }
    )

    const tracks = response.data.items.map((item: any) => ({
      spotifyTrackId: item.id,
      name: item.name,
      artist: item.artists.map((a: any) => a.name).join(', '),
      album: item.album.name,
      albumArt: item.album.images?.[0]?.url,
      duration: item.duration_ms,
      explicit: item.explicit,
      popularity: item.popularity,
      previewUrl: item.preview_url,
      spotifyUrl: item.external_urls.spotify,
    }))

    // Save tracks to database
    for (const track of tracks) {
      await prisma.track.upsert({
        where: { spotifyTrackId: track.spotifyTrackId },
        update: track,
        create: track,
      })
    }

    res.json(tracks)
  } catch (error) {
    console.error('Get top tracks error:', error)
    res.status(500).json({ error: 'Failed to get top tracks' })
  }
})

// Get recently played
router.get('/recent', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { limit = '50' } = req.query
    const accessToken = req.user!.accessToken

    const response = await axios.get(
      `${SPOTIFY_API_URL}/me/player/recently-played`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { limit: parseInt(limit as string) },
      }
    )

    const history = response.data.items.map((item: any) => ({
      track: {
        spotifyTrackId: item.track.id,
        name: item.track.name,
        artist: item.track.artists.map((a: any) => a.name).join(', '),
        album: item.track.album.name,
        albumArt: item.track.album.images?.[0]?.url,
        duration: item.track.duration_ms,
        explicit: item.track.explicit,
        popularity: item.track.popularity,
        previewUrl: item.track.preview_url,
        spotifyUrl: item.track.external_urls.spotify,
      },
      playedAt: item.played_at,
      context: item.context?.uri,
    }))

    // Save to listening history
    for (const item of history) {
      const track = await prisma.track.upsert({
        where: { spotifyTrackId: item.track.spotifyTrackId },
        update: item.track,
        create: item.track,
      })

      // Use createMany-style dedup: skip if this exact play already exists
      const exists = await prisma.listeningHistory.findFirst({
        where: {
          userId: req.user!.id,
          trackId: track.id,
          playedAt: new Date(item.playedAt),
        },
      })
      if (!exists) {
        await prisma.listeningHistory.create({
          data: {
            userId: req.user!.id,
            trackId: track.id,
            playedAt: new Date(item.playedAt),
            context: item.context,
          },
        })
      }
    }

    res.json(history)
  } catch (error) {
    console.error('Get recently played error:', error)
    res.status(500).json({ error: 'Failed to get recently played' })
  }
})

export default router