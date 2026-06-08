# 🎵 StereoDNA

A premium music analytics dashboard that connects to the Spotify API and visualizes your music habits in a beautiful, interactive, and animated way.

## Tech Stack

### Frontend

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Zustand
- Axios

### Backend

- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Spotify OAuth 2.0

## Features

- **Spotify OAuth Authentication** - Secure login with token refresh
- **Interactive Dashboard** - Top artists, tracks, recently played
- **Listening Heatmap** - GitHub-style activity visualization
- **Analytics & Charts** - Genre distribution, listening trends
- **AI Music Personality** - Fun personality archetypes
- **Music Taste Roast** - Humorous roasts about your habits
- **Profile System** - Avatar, display name, music identity
- **Responsive Design** - Mobile and desktop optimized
- **Dark Mode** - Cyberpunk-inspired glassmorphism UI

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Spotify Developer Account

### 1. Clone and Install

```bash
git clone <repo-url>
cd stereodna
```

### 2. Setup Backend

```bash
cd server
cp .env.example .env


npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 3. Setup Frontend

```bash
cd client
npm install
npm run dev
```

### 4. Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add `http://localhost:3001/api/auth/callback` to Redirect URIs
4. Copy Client ID and Secret to `.env`

## Deployment

### Frontend (Vercel)

```bash
cd client
vercel --prod
```

### Backend (Railway/Render)

```bash
cd server


```

## API Endpoints

| Method | Endpoint                     | Description             |
| ------ | ---------------------------- | ----------------------- |
| GET    | `/api/auth/spotify`          | Initiate OAuth          |
| GET    | `/api/auth/callback`         | OAuth callback          |
| POST   | `/api/auth/refresh`          | Refresh token           |
| POST   | `/api/auth/logout`           | Logout                  |
| GET    | `/api/users/me`              | Get current user        |
| GET    | `/api/dashboard`             | Get full dashboard      |
| GET    | `/api/tracks/top`            | Get top tracks          |
| GET    | `/api/tracks/recent`         | Get recently played     |
| GET    | `/api/artists/top`           | Get top artists         |
| GET    | `/api/analytics/stats`       | Get listening stats     |
| GET    | `/api/analytics/heatmap`     | Get heatmap data        |
| GET    | `/api/analytics/genres`      | Get genre distribution  |
| GET    | `/api/analytics/personality` | Get personality profile |
| GET    | `/api/analytics/roast`       | Get music roast         |
| GET    | `/api/analytics/trends`      | Get listening trends    |

## License

MIT
