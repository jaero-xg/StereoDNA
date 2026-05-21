import { motion } from 'framer-motion'
import { useMemo } from 'react'

const sampleAlbums = [
  'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
]

export default function FloatingAlbums() {
  const albums = useMemo(() => {
    return sampleAlbums.map((url, i) => ({
      url,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 80 + 60,
      delay: i * 0.5,
      duration: Math.random() * 10 + 15,
    }))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {albums.map((album, i) => (
        <motion.div
          key={i}
          className="absolute rounded-2xl overflow-hidden opacity-20"
          style={{
            left: `${album.x}%`,
            top: `${album.y}%`,
            width: album.size,
            height: album.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: album.duration,
            repeat: Infinity,
            delay: album.delay,
            ease: 'easeInOut',
          }}
        >
          <img
            src={album.url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
        </motion.div>
      ))}
    </div>
  )
}
