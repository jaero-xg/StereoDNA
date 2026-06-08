# StereoDNA - Project Summary

## Project Overview

StereoDNA is a full-stack music analytics dashboard that connects to the Spotify API and visualizes user listening habits with, interactive, and animated UI.

## Architecture

```
stereodna/
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/         # Reusable UI components
│   │   │   ├── charts/     # Recharts visualizations
│   │   │   ├── heatmap/    # GitHub-style heatmap
│   │   │   └── animations/ # Framer Motion animations
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── CallbackPage.tsx
│   │   ├── lib/
│   │   │   ├── api.ts      # Axios API client
│   │   │   └── utils.ts    # Utility functions
│   │   ├── store/
│   │   │   └── index.ts    # Zustand state management
│   │   ├── types/
│   │   │   └── index.ts    # TypeScript interfaces
│   │   └── styles/
│   │       └── globals.css  # Tailwind + custom styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── server/                 # Node.js + Express Backend
    ├── src/
    │   ├── routes/
    │   │   ├── auth.ts     # Spotify OAuth flow
    │   │   ├── users.ts    # User endpoints
    │   │   ├── tracks.ts   # Track endpoints
    │   │   ├── artists.ts  # Artist endpoints
    │   │   ├── analytics.ts # Analytics endpoints
    │   │   └── dashboard.ts # Dashboard aggregation
    │   ├── services/
    │   │   └── spotify.ts  # Spotify API service
    │   ├── middleware/
    │   │   ├── auth.ts     # JWT authentication
    │   │   └── errorHandler.ts
    │   ├── lib/
    │   │   └── prisma.ts   # Prisma client
    │   └── index.ts        # Express server
    ├── prisma/
    │   └── schema.prisma   # Database schema
    └── package.json
```

## Key Features Implemented

### Authentication

- Spotify OAuth 2.0 Authorization Code flow
- JWT token management
- Automatic access token refresh
- Secure cookie handling
- Logout functionality

### Dashboard

- Overview stats (total minutes, tracks, artists, streak)
- Top Artists with play counts
- Top Tracks with play counts
- Recently Played list
- Time range selector (4 weeks, 6 months, all time)

### Visualizations

- Genre Distribution Pie Chart (Recharts)
- Top Artists Bar Chart
- Listening Trends Area Chart
- GitHub-style Listening Heatmap

### AI Features

- Music Personality Archetypes (7 types)
- Personality scoring (energy, uniqueness)
- Music Taste Roast (3 severity levels)
- Trait badges and mood analysis

### Profile

- User identity card
- Shareable summary card
- Export functionality
- Listening patterns display

### UI/UX

- Dark mode cyberpunk aesthetic
- Minimal
- Analytics first

### Backend

- PostgreSQL database with Prisma ORM
- Rate limiting (10 req/sec per user)
- Spotify API rate limit handling
- Token auto-refresh on expiry
- Error handling for 401/429
- Data caching in database
- REST API architecture

## Tech Stack

| Layer      | Technology                   |
| ---------- | ---------------------------- |
| Frontend   | React 18, TypeScript, Vite   |
| Styling    | Tailwind CSS, Custom CSS     |
| Animations | Framer Motion                |
| Charts     | Recharts                     |
| State      | Zustand                      |
| Backend    | Node.js, Express, TypeScript |
| Database   | PostgreSQL                   |
| ORM        | Prisma                       |
| Auth       | Spotify OAuth 2.0, JWT       |
| HTTP       | Axios                        |

## API Endpoints

| Method | Endpoint                   | Description         |
| ------ | -------------------------- | ------------------- |
| GET    | /api/auth/spotify          | Initiate OAuth      |
| GET    | /api/auth/callback         | OAuth callback      |
| POST   | /api/auth/refresh          | Refresh token       |
| POST   | /api/auth/logout           | Logout              |
| GET    | /api/users/me              | Get current user    |
| GET    | /api/dashboard             | Full dashboard data |
| GET    | /api/tracks/top            | Top tracks          |
| GET    | /api/tracks/recent         | Recently played     |
| GET    | /api/artists/top           | Top artists         |
| GET    | /api/analytics/stats       | Listening stats     |
| GET    | /api/analytics/heatmap     | Heatmap data        |
| GET    | /api/analytics/genres      | Genre distribution  |
| GET    | /api/analytics/personality | Personality profile |
| GET    | /api/analytics/roast       | Music roast         |
| GET    | /api/analytics/trends      | Listening trends    |

## Database Schema

### Users

- id, spotifyId, displayName, email, avatar
- accessToken, refreshToken, tokenExpiresAt
- country, product, followers

### Tracks

- id, spotifyTrackId, name, artist, album
- albumArt, duration, explicit, popularity
- genres, previewUrl, spotifyUrl

### Artists

- id, spotifyArtistId, name, image
- genres, popularity, followers, spotifyUrl

### ListeningHistory

- id, userId, trackId, playedAt
- context, progressMs

### TopArtist / TopTrack

- id, userId, artistId/trackId
- timeRange, rank, playCount

## Next Steps to Run

1. **Setup Environment:**

   ```bash
   cd server && cp .env.example .env
   # Fill in Spotify credentials and database URL
   ```

2. **Install Dependencies:**

   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

3. **Setup Database:**

   ```bash
   cd server
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Run Development:**

   ```bash
   # Terminal 1
   cd server && npm run dev

   # Terminal 2
   cd client && npm run dev
   ```

5. **Open Browser:**
   Navigate to http://localhost:5173

## Deployment

- **Frontend:** Vercel (connect repo, set root to /client)
- **Backend:** Railway/Render (connect repo, set root to /server)
- **Database:** Railway PostgreSQL / Supabase / Neon

## Security Considerations

- WT tokens stored in httpOnly cookies
- Spotify tokens encrypted in database
- Rate limiting on API endpoints
- CORS properly configured
- Helmet for security headers
- Input validation via Prisma
- No sensitive data exposed in frontend

## Total Code Statistics

- **Total Files:** 52
- **Total Lines:** ~4,300
- **Frontend:** React + TypeScript (~2,500 lines)
- **Backend:** Node.js + Express (~1,800 lines)
- **Database:** Prisma schema (~150 lines)
