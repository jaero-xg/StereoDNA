export interface User {
  id: string;
  spotifyId: string;
  displayName: string;
  email: string;
  avatar: string | null;
  country: string;
  product: string;
  followers: number;
  createdAt: string;
  updatedAt: string;
}

export interface Track {
  id: string;
  spotifyTrackId: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string | null;
  duration: number;
  explicit: boolean;
  popularity: number;
  previewUrl: string | null;
  spotifyUrl: string;
  genres: string[];
  playedAt?: string;
}

export interface Artist {
  id: string;
  spotifyArtistId: string;
  name: string;
  image: string | null;
  genres: string[];
  popularity: number;
  followers: number;
  spotifyUrl: string;
}

export interface ListeningHistory {
  id: string;
  userId: string;
  trackId: string;
  track: Track;
  playedAt: string;
  context: string | null;
  progressMs: number;
}

export interface ListeningStats {
  totalTracks: number;
  totalMinutes: number;
  uniqueArtists: number;
  uniqueGenres: number;
  avgDailyMinutes: number;
  peakHour: number;
  streakDays: number;
  topGenre: string;
}

export interface HeatmapData {
  date: string;
  hour: number;
  count: number;
  intensity: number;
}

export interface GenreDistribution {
  name: string;
  value: number;
  color: string;
}

export interface ArtistRanking {
  artist: Artist;
  playCount: number;
  totalMinutes: number;
}

export interface TrackRanking {
  track: Track;
  playCount: number;
  lastPlayed: string;
}

export interface PersonalityProfile {
  archetype: string;
  description: string;
  traits: string[];
  score: number;
  dominantMood: string;
  listeningStyle: string;
  timeOfDay: string;
  energyLevel: number;
  uniqueness: number;
}

export interface RoastResult {
  roast: string;
  severity: 'mild' | 'medium' | 'savage';
  categories: string[];
}

export interface DashboardData {
  user: User;
  stats: ListeningStats;
  topArtists: ArtistRanking[];
  topTracks: TrackRanking[];
  recentlyPlayed: ListeningHistory[];
  heatmap: HeatmapData[];
  genres: GenreDistribution[];
  personality: PersonalityProfile;
  roast: RoastResult;
  listeningTrends: { date: string; minutes: number; tracks: number }[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';
