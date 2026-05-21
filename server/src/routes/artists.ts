import express from 'express'
import axios from 'axios'
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = express.Router()
const SPOTIFY_API_URL = 'https://api.spotify.com/v1'

// Get top artists
router.get('/top', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { time_range = 'medium_term', limit = '20' } = req.query
    const accessToken = req.user!.accessToken

    const response = await axios.get(
      `${SPOTIFY_API_URL}/me/top/artists`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { time_range, limit: parseInt(limit as string) },
      }
    )

    const artists = response.data.items.map((item: any) => ({
      spotifyArtistId: item.id,
      name: item.name,
      image: item.images?.[0]?.url,
      genres: item.genres,
      popularity: item.popularity,
      followers: item.followers?.total || 0,
      spotifyUrl: item.external_urls.spotify,
    }))

    // Save artists to database
    for (const artist of artists) {
      await prisma.artist.upsert({
        where: { spotifyArtistId: artist.spotifyArtistId },
        update: artist,
        create: artist,
      })
    }

    res.json(artists)
  } catch (error) {
    console.error('Get top artists error:', error)
    res.status(500).json({ error: 'Failed to get top artists' })
  }
})

export default router
