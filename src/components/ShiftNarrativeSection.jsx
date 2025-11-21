import { useEffect, useState, useRef } from 'react'
import './ShiftNarrativeSection.css'

const ShiftNarrativeSection = () => {
  const [opacity, setOpacity] = useState(0)
  const sectionRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      
      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const scrollY = window.scrollY
      
      // Check if mobile
      const isMobile = window.innerWidth <= 1300
      
      // Desktop: Section starts at 150vh (after hero), ends at 250vh
      // Mobile: Section starts at 60vh (after shorter hero), ends at 160vh
      const sectionStart = isMobile ? windowHeight * 0.6 : windowHeight * 1.5
      const sectionEnd = isMobile ? windowHeight * 1.6 : windowHeight * 2.5
      
      // Fade in: start early on both mobile and desktop
      const fadeInStart = isMobile ? windowHeight * 0.2 : windowHeight * 0.8
      const fadeInEnd = isMobile ? windowHeight * 0.35 : windowHeight * 1.0
      
      // Fade out: proportional to section end
      const fadeOutStart = sectionEnd - (windowHeight * 0.15)
      const fadeOutEnd = sectionEnd
      
      if (scrollY < fadeInStart) {
        setOpacity(0)
      } else if (scrollY >= fadeInStart && scrollY < fadeInEnd) {
        // Fade in
        const progress = (scrollY - fadeInStart) / (fadeInEnd - fadeInStart)
        setOpacity(progress)
      } else if (scrollY >= fadeInEnd && scrollY < fadeOutStart) {
        // Fully visible
        setOpacity(1)
      } else if (scrollY >= fadeOutStart && scrollY < fadeOutEnd) {
        // Fade out
        const progress = (scrollY - fadeOutStart) / (fadeOutEnd - fadeOutStart)
        setOpacity(1 - progress)
      } else {
        setOpacity(0)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section ref={sectionRef} className="shift-narrative-section">
      <div 
        className="shift-narrative-content"
        style={{ opacity }}
      >
        <p className="shift-narrative-text">
          Politicians love to talk the UK down, but UK AI & Tech is moving at 100mph.
        </p>
        <p className="shift-narrative-text shift-narrative-text-secondary">
          It's time to <strong>shift</strong> the narrative, so we're building a dashboard that tracks the UK AI story in realtime...
        </p>
      </div>
    </section>
  )
}

export default ShiftNarrativeSection
