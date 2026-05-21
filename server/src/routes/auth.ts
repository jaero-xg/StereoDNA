import express from 'express'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const router = express.Router()

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_URL = 'https://api.spotify.com/v1'

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3001/api/auth/callback'
const JWT_SECRET = process.env.JWT_SECRET || 'stereodna-secret-key'

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
  'user-read-playback-state',
  'user-read-currently-playing',
].join(' ')

// Generate random state string
function generateState(): string {
  return Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join('')
}

// Initiate Spotify OAuth
router.get('/spotify', (req, res) => {
  const state = generateState()

  // Store state in cookie for validation
  res.cookie('spotify_auth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000, // 10 minutes
  })

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
    show_dialog: 'false',
  })

  res.redirect(`${SPOTIFY_AUTH_URL}?${params.toString()}`)
})

// Spotify OAuth callback
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query
  const storedState = req.cookies.spotify_auth_state

  // Clear state cookie
  res.clearCookie('spotify_auth_state')

  if (error) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=${error}`)
  }

  if (!state || state !== storedState) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=state_mismatch`)
  }

  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=no_code`)
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post(
      SPOTIFY_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
      }
    )

    const { access_token, refresh_token, expires_in } = tokenResponse.data

    // Get user profile from Spotify
    const userResponse = await axios.get(`${SPOTIFY_API_URL}/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    const spotifyUser = userResponse.data

    // Calculate token expiry
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000)

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { spotifyId: spotifyUser.id },
      update: {
        displayName: spotifyUser.display_name || spotifyUser.id,
        email: spotifyUser.email,
        avatar: spotifyUser.images?.[0]?.url || null,
        country: spotifyUser.country,
        product: spotifyUser.product,
        followers: spotifyUser.followers?.total || 0,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt,
      },
      create: {
        spotifyId: spotifyUser.id,
        displayName: spotifyUser.display_name || spotifyUser.id,
        email: spotifyUser.email,
        avatar: spotifyUser.images?.[0]?.url || null,
        country: spotifyUser.country,
        product: spotifyUser.product,
        followers: spotifyUser.followers?.total || 0,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt,
      },
    })

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, spotifyId: user.spotifyId },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Set JWT cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Redirect to frontend with access token
    res.redirect(`${process.env.CLIENT_URL}/callback?token=${access_token}`)
  } catch (error) {
    console.error('Spotify auth error:', error)
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`)
  }
})

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const jwtToken = req.cookies.jwt
    if (!jwtToken) {
      return res.status(401).json({ error: 'No JWT token' })
    }

    const decoded = jwt.verify(jwtToken, JWT_SECRET) as { userId: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || !user.refreshToken) {
      return res.status(401).json({ error: 'User not found or no refresh token' })
    }

    const refreshResponse = await axios.post(
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

    const { access_token, expires_in } = refreshResponse.data
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        accessToken: access_token,
        tokenExpiresAt,
      },
    })

    res.json({ accessToken: access_token })
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(401).json({ error: 'Failed to refresh token' })
  }
})

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('jwt')
  res.clearCookie('spotify_auth_state')
  res.json({ success: true })
})

export default router
