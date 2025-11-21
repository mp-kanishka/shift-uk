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
      
      // Section starts at 150vh (after hero)
      // Section is 100vh tall, so it ends at 250vh
      const sectionStart = windowHeight * 1.5
      const sectionEnd = windowHeight * 2.5
      
      // Fade in: from 120vh to 140vh (start earlier, 20vh fade in)
      const fadeInStart = windowHeight * 1.2
      const fadeInEnd = windowHeight * 1.4
      
      // Fade out: from 235vh to 250vh (15vh fade out, later)
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
