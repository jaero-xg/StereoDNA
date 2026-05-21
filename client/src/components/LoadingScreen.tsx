import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 rounded-full border-4 border-accent/20 border-b-accent"
          />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold gradient-text font-display">StereoDNA</h2>
          <p className="text-text-muted text-sm animate-pulse">Analyzing your sonic identity...</p>
        </div>
      </motion.div>
    </div>
  )
}
