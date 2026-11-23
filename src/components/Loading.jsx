import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div className="loading-screen" role="status" aria-label="Loading page">
      <motion.span
        className="loading-orbit"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
      />
      <p>Putting the fun in functional…</p>
    </div>
  )
}
