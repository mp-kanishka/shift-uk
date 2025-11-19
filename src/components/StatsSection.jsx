import { useRef, useState, useEffect } from 'react'
import { useInView, motion } from 'framer-motion'
import './StatsSection.css'

const stats = [
  { value: '2', label: 'New Ivy Plants', suffix: '' },
  { value: '£1bn', label: 'for the UK economy', suffix: '' },
  { value: '10', label: 'slices of cake', suffix: '' },
]

const StatsSection = () => {
  const sectionRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const isInView = useInView(sectionRef, { amount: 0.2, once: false })

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      // Stats section starts appearing when hero starts fading (around 80% of first viewport)
      const fadeStart = windowHeight * 0.8
      const fadeEnd = windowHeight * 1.2
      const progress = Math.max(0, Math.min(1, (scrollY - fadeStart) / (fadeEnd - fadeStart)))
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculate section opacity based on scroll progress
  const sectionOpacity = Math.max(0, Math.min(1, scrollProgress))

  return (
    <section 
      ref={sectionRef} 
      className="stats-section"
      style={{
        opacity: sectionOpacity,
        pointerEvents: sectionOpacity > 0.1 ? 'auto' : 'none'
      }}
    >
      <div className="stats-container">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="stat-card"
            initial={{ opacity: 0, y: 100, scale: 0.8, rotateX: -15 }}
            animate={isInView ? { 
              opacity: 1, 
              y: 0, 
              scale: 1,
              rotateX: 0
            } : { 
              opacity: 0, 
              y: 100, 
              scale: 0.8,
              rotateX: -15
            }}
            transition={{
              duration: 0.8,
              delay: index * 0.15,
              ease: [0.16, 1, 0.3, 1],
              type: 'spring',
              stiffness: 100,
              damping: 15
            }}
            whileHover={{ 
              scale: 1.08, 
              y: -10,
              rotateY: 5,
              transition: { duration: 0.3 }
            }}
            style={{ perspective: 1000 }}
          >
            <motion.div
              className="stat-value"
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={isInView ? { 
                scale: 1, 
                rotate: 0,
                opacity: 1
              } : { 
                scale: 0, 
                rotate: -180,
                opacity: 0
              }}
              transition={{
                duration: 1,
                delay: index * 0.15 + 0.4,
                type: 'spring',
                stiffness: 150,
                damping: 12
              }}
            >
              {stat.value}
            </motion.div>
            <motion.div
              className="stat-label"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { 
                opacity: 1, 
                y: 0
              } : { 
                opacity: 0, 
                y: 20
              }}
              transition={{
                duration: 0.6,
                delay: index * 0.15 + 0.8,
                ease: 'easeOut'
              }}
            >
              {stat.label}
            </motion.div>
            <motion.div
              className="stat-glow"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { 
                opacity: 1, 
                scale: 1
              } : { 
                opacity: 0, 
                scale: 0.5
              }}
              transition={{
                duration: 1.2,
                delay: index * 0.15 + 0.5,
                ease: 'easeOut'
              }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default StatsSection

