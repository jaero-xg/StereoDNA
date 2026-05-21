import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export function getHeatmapColor(intensity: number): string {
  const colors = [
    'bg-surface-light',
    'bg-primary/20',
    'bg-primary/40',
    'bg-primary/60',
    'bg-primary/80',
    'bg-primary',
  ]
  const index = Math.min(Math.floor(intensity * colors.length), colors.length - 1)
  return colors[index]
}

export function getGenreColor(genre: string): string {
  const colors: Record<string, string> = {
    pop: '#ec4899',
    rock: '#ef4444',
    hip: '#f59e0b',
    rap: '#f97316',
    electronic: '#06b6d4',
    indie: '#8b5cf6',
    jazz: '#eab308',
    classical: '#a855f7',
    rnb: '#d946ef',
    country: '#84cc16',
    metal: '#71717a',
    folk: '#22c55e',
    soul: '#f43f5e',
    blues: '#3b82f6',
    reggae: '#10b981',
    latin: '#fbbf24',
    kpop: '#e11d48',
    ambient: '#6366f1',
    punk: '#dc2626',
    house: '#0ea5e9',
    techno: '#0891b2',
    disco: '#c026d3',
    funk: '#ca8a04',
    gospel: '#7c3aed',
    alternative: '#475569',
    soundtrack: '#64748b',
  }

  const key = Object.keys(colors).find(k => genre.toLowerCase().includes(k))
  return key ? colors[key] : '#7c3aed'
}

export function generatePersonalityArchetype(
  topGenres: string[],
  peakHour: number,
  avgDailyMinutes: number,
  uniqueArtists: number
): { archetype: string; description: string; traits: string[] } {
  const isNightOwl = peakHour >= 22 || peakHour <= 4
  const isEarlyBird = peakHour >= 5 && peakHour <= 8
  const isHeavyListener = avgDailyMinutes > 180
  const isExplorer = uniqueArtists > 100
  const hasIndie = topGenres.some(g => g.toLowerCase().includes('indie'))
  const hasElectronic = topGenres.some(g => g.toLowerCase().includes('electronic') || g.toLowerCase().includes('house') || g.toLowerCase().includes('techno'))
  const hasHipHop = topGenres.some(g => g.toLowerCase().includes('hip') || g.toLowerCase().includes('rap'))
  const hasRock = topGenres.some(g => g.toLowerCase().includes('rock') || g.toLowerCase().includes('metal'))

  if (isNightOwl && hasIndie) {
    return {
      archetype: 'Late-Night Indie Addict',
      description: "You find your deepest connections with music in the quiet hours, when the world sleeps and your headphones become a portal to emotional landscapes.",
      traits: ['Introspective', 'Emotionally Deep', 'Night Owl', 'Curator'],
    }
  }

  if (isHeavyListener && isExplorer) {
    return {
      archetype: 'Chaotic Shuffle Goblin',
      description: "Your music library is a beautiful mess. You jump from genre to genre like a musical pinball, collecting sonic experiences like trophies.",
      traits: ['Eclectic', 'Adventurous', 'Unpredictable', 'Voracious'],
    }
  }

  if (hasElectronic && isNightOwl) {
    return {
      archetype: 'Synthwave Drifter',
      description: "You exist in a neon-lit digital dreamscape where analog warmth meets cybernetic precision. The night is your canvas, synthesizers your brush.",
      traits: ['Futuristic', 'Rhythmic', 'Nocturnal', 'Atmospheric'],
    }
  }

  if (hasHipHop && avgDailyMinutes > 120) {
    return {
      archetype: 'Bassline Prophet',
      description: "You feel the rhythm in your bones. Every beat drop is a spiritual experience, every verse a sermon you know by heart.",
      traits: ['Rhythmic', 'Lyrical', 'Confident', 'Vibey'],
    }
  }

  if (hasRock && uniqueArtists < 50) {
    return {
      archetype: 'Loyal Headbanger',
      description: "You do not just listen to music, you pledge allegiance to it. Your favorite bands are family, and you know every riff by heart.",
      traits: ['Loyal', 'Passionate', 'Nostalgic', 'Intense'],
    }
  }

  if (isEarlyBird) {
    return {
      archetype: 'Morning Melody Architect',
      description: "You build your day on a foundation of sound. The sunrise is just background music to your carefully curated morning soundtrack.",
      traits: ['Disciplined', 'Optimistic', 'Methodical', 'Energetic'],
    }
  }

  return {
    archetype: 'Sonic Wanderer',
    description: "You traverse the vast landscape of music with an open mind and curious spirit, finding beauty in unexpected places.",
    traits: ['Curious', 'Open-Minded', 'Balanced', 'Appreciative'],
  }
}

export function generateRoast(
  topArtists: { artist: { name: string }; playCount: number }[],
  topTracks: { track: { name: string }; playCount: number }[],
  stats: { totalMinutes: number; uniqueArtists: number; avgDailyMinutes: number }
): { roast: string; severity: 'mild' | 'medium' | 'savage'; categories: string[] } {
  const roasts: { text: string; severity: 'mild' | 'medium' | 'savage'; categories: string[] }[] = []

  if (topTracks[0] && topTracks[0].playCount > 50) {
    roasts.push({
      text: `You have played "${topTracks[0].track.name}" ${topTracks[0].playCount} times. That is not a favorite song, that is a hostage situation.`,
      severity: 'medium',
      categories: ['repeat offender'],
    })
  }

  if (stats.uniqueArtists < 20) {
    roasts.push({
      text: `Only ${stats.uniqueArtists} unique artists? Your music taste has fewer options than a vending machine in a hospital.`,
      severity: 'savage',
      categories: ['lack of diversity'],
    })
  }

  if (stats.avgDailyMinutes > 300) {
    roasts.push({
      text: `${Math.floor(stats.avgDailyMinutes / 60)} hours a day? Your ears are going to file for emancipation.`,
      severity: 'medium',
      categories: ['excessive listening'],
    })
  }

  const mainstreamArtists = ['Taylor Swift', 'Drake', 'Ed Sheeran', 'The Weeknd', 'Bad Bunny']
  const hasMainstream = topArtists.some(a => 
    mainstreamArtists.some(ma => a.artist.name.toLowerCase().includes(ma.toLowerCase()))
  )
  if (hasMainstream) {
    roasts.push({
      text: "Your top artists are so mainstream, Spotify uses your playlist to train their recommendation algorithm for people who say they listen to everything.",
      severity: 'mild',
      categories: ['mainstream'],
    })
  }

  if (topArtists.length > 0 && topArtists[0].playCount < 10) {
    roasts.push({
      text: `Your top artist only has ${topArtists[0].playCount} plays? That is not a music taste, that is a passing acquaintance.`,
      severity: 'medium',
      categories: ['casual listener'],
    })
  }

  if (roasts.length === 0) {
    roasts.push({
      text: "Your music taste is so perfectly balanced that even the roast generator is struggling to find something wrong. Suspicious.",
      severity: 'mild',
      categories: ['suspiciously perfect'],
    })
  }

  const savageRoasts = roasts.filter(r => r.severity === 'savage')
  const mediumRoasts = roasts.filter(r => r.severity === 'medium')

  const selected = savageRoasts.length > 0 
    ? savageRoasts[Math.floor(Math.random() * savageRoasts.length)]
    : mediumRoasts.length > 0
    ? mediumRoasts[Math.floor(Math.random() * mediumRoasts.length)]
    : roasts[Math.floor(Math.random() * roasts.length)]

  return {
    roast: selected.text,
    severity: selected.severity,
    categories: selected.categories,
  }
}

export function getPersonalityEmoji(archetype: string): string {
  const emojis: Record<string, string> = {
    'Late-Night Indie Addict': '🌙',
    'Chaotic Shuffle Goblin': '🎲',
    'Synthwave Drifter': '🌆',
    'Bassline Prophet': '🎤',
    'Loyal Headbanger': '🤘',
    'Morning Melody Architect': '🌅',
    'Sonic Wanderer': '🧭',
  }
  return emojis[archetype] || '🎵'
}

export function getMoodColor(mood: string): string {
  const colors: Record<string, string> = {
    'Energetic': '#f59e0b',
    'Chill': '#06b6d4',
    'Melancholic': '#6366f1',
    'Happy': '#10b981',
    'Intense': '#ef4444',
    'Dreamy': '#a855f7',
    'Focused': '#3b82f6',
    'Party': '#ec4899',
  }
  return colors[mood] || '#7c3aed'
}
