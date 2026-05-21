import axios from 'axios'
import { prisma } from '../lib/prisma'

const SPOTIFY_API_URL = 'https://api.spotify.com/v1'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!

// Rate limiter: max 10 requests per second per user
const rateLimiters = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const limiter = rateLimiters.get(userId)

  if (!limiter || now > limiter.resetTime) {
    rateLimiters.set(userId, { count: 1, resetTime: now + 1000 })
    return true
  }

  if (limiter.count >= 10) {
    return false
  }

  limiter.count++
  return true
}

// Refresh access token
export async function refreshAccessToken(userId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { refreshToken: true },
    })

    if (!user?.refreshToken) {
      return null
    }

    const response = await axios.post(
      SPOTIFY_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: user.refreshToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
      }
    )

    const { access_token, expires_in } = response.data
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000)

    await prisma.user.update({
      where: { id: userId },
      data: { accessToken: access_token, tokenExpiresAt },
    })

    return access_token
  } catch (error) {
    console.error('Failed to refresh token:', error)
    return null
  }
}

// Make authenticated Spotify API request with auto-refresh
export async function spotifyRequest(
  userId: string,
  endpoint: string,
  params?: Record<string, any>
) {
  if (!checkRateLimit(userId)) {
    throw new Error('Rate limit exceeded. Please try again in a moment.')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { accessToken: true, tokenExpiresAt: true },
  })

  if (!user?.accessToken) {
    throw new Error('No access token available')
  }

  let accessToken = user.accessToken

  // Check if token is expired or about to expire (within 5 minutes)
  if (user.tokenExpiresAt && new Date(Date.now() + 5 * 60 * 1000) > user.tokenExpiresAt) {
    const refreshed = await refreshAccessToken(userId)
    if (refreshed) {
      accessToken = refreshed
    }
  }

  try {
    const response = await axios.get(`${SPOTIFY_API_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    })

    return response.data
  } catch (error: any) {
    // Handle 429 rate limit from Spotify
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after']
      throw new Error(`Spotify rate limit hit. Retry after ${retryAfter || 'a few'} seconds.`)
    }

    // Handle 401 unauthorized - try refresh once more
    if (error.response?.status === 401) {
      const refreshed = await refreshAccessToken(userId)
      if (refreshed) {
        const retryResponse = await axios.get(`${SPOTIFY_API_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${refreshed}` },
          params,
        })
        return retryResponse.data
      }
    }

    throw error
  }
}

// Batch fetch multiple tracks
export async function fetchMultipleTracks(userId: string, trackIds: string[]) {
  if (trackIds.length === 0) return []

  // Spotify allows up to 50 IDs per request
  const batches = []
  for (let i = 0; i < trackIds.length; i += 50) {
    batches.push(trackIds.slice(i, i + 50))
  }

  const results = []
  for (const batch of batches) {
    const data = await spotifyRequest(
      userId,
      `/tracks`,
      { ids: batch.join(',') }
    )
    results.push(...(data.tracks || []))
  }

  return results
}
