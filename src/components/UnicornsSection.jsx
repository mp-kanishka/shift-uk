import { useRef } from 'react'
import { useInView, motion } from 'framer-motion'
import './UnicornsSection.css'

const UnicornsSection = () => {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { amount: 0.3, once: false })

  return (
    <section ref={sectionRef} className="unicorns-section">
      <motion.div
        className="unicorns-content"
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <img 
          src="/uk.svg" 
          alt="United Kingdom" 
          className="uk-icon"
          loading="lazy"
        />
        <p className="unicorns-text">
          Over 160 + unicorns took their first steps in the United Kingdom
        </p>
      </motion.div>
    </section>
  )
}

export default UnicornsSection

