import express from 'express'
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth'

const router = express.Router()

router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { prisma } = await import('../lib/prisma')

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
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

    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

export default router
