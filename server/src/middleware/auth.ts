import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'stereodna-secret-key'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    spotifyId: string
    accessToken: string
  }
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1] || req.cookies.jwt

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        spotifyId: true,
        accessToken: true,
        refreshToken: true,
        tokenExpiresAt: true,
      },
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    req.user = {
      id: user.id,
      spotifyId: user.spotifyId,
      accessToken: user.accessToken || '',
    }

    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' })
  }
}