# StereoDNA Deployment Guide

## Prerequisites

- Spotify Developer Account
- Vercel Account (Frontend)
- Railway/Render Account (Backend)
- PostgreSQL Database (Railway/Supabase/Neon)

## Step 1: Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add these Redirect URIs:
   - `http://localhost:3001/api/auth/callback` (development)
   - `https://your-backend-url.com/api/auth/callback` (production)
4. Note down your Client ID and Client Secret

## Step 2: Database Setup

### Option A: Railway PostgreSQL

1. In Railway dashboard, create a new PostgreSQL database
2. Copy the connection string

### Option B: Supabase

1. Create a new project
2. Go to Database → Connection String
3. Copy the URI

### Option C: Neon

1. Create a new project
2. Copy the connection string

## Step 3: Backend Deployment (Railway/Render)

### Railway

1. Connect your GitHub repo to Railway
2. Set root directory to `/server`
3. Add environment variables:
   ```
   DATABASE_URL=postgresql://...
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   SPOTIFY_REDIRECT_URI=https://your-backend-url.com/api/auth/callback
   JWT_SECRET=your_random_secret
   CLIENT_URL=https://your-frontend-url.vercel.app
   NODE_ENV=production
   ```
4. Add build command: `npm install && npx prisma migrate deploy && npm run build`
5. Start command: `npm start`

### Render

1. Create a new Web Service
2. Connect your repo
3. Set root directory to `server`
4. Add the same environment variables
5. Build Command: `npm install && npx prisma migrate deploy && npm run build`
6. Start Command: `npm start`

## Step 4: Frontend Deployment (Vercel)

1. Connect your GitHub repo to Vercel
2. Set root directory to `/client`
3. Add environment variables:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```
4. Framework Preset: Vite
5. Build Command: `npm run build`
6. Output Directory: `dist`

## Step 5: Update Spotify Redirect URI

After deployment, update your Spotify app settings with the production redirect URI.

## Environment Variables Reference

### Backend (.env)

```
DATABASE_URL="postgresql://user:password@host:port/db?schema=public"
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://api.yourapp.com/api/auth/callback
JWT_SECRET=random_string_at_least_32_chars
CLIENT_URL=https://yourapp.vercel.app
NODE_ENV=production
PORT=3001
```

### Frontend (.env)

```
VITE_API_URL=https://api.yourapp.com
```

## Post-Deployment

1. Run Prisma migrations: `npx prisma migrate deploy`
2. Test authentication flow
3. Verify API endpoints
4. Check CORS settings

## Troubleshooting

### CORS Issues

Ensure your backend CORS settings include your frontend URL:

```javascript
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
```

### Database Connection

- Check DATABASE_URL format
- Ensure SSL is enabled for production PostgreSQL
- Verify network access rules

### Authentication Failures

- Verify SPOTIFY_REDIRECT_URI matches exactly
- Check JWT_SECRET is set and consistent
- Ensure cookies are properly configured for cross-domain
