import { useState, useEffect } from 'react'
import HeroSection from './components/HeroSection'
import StatsSection from './components/StatsSection'
import UnicornsSection from './components/UnicornsSection'
import GraphSection from './components/GraphSection'
import './App.css'

function App() {
  const [bgColor, setBgColor] = useState('#012169')

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      
      // Hero section: 150vh (1.5 * windowHeight)
      // Stats section: starts at 150vh, ends at 450vh (150vh + 300vh)
      
      // Transition 1: Blue (#012169) to Grey (#1E1E1E) - from hero to stats
      const heroToStatsStart = windowHeight * 0.6
      const heroToStatsEnd = windowHeight * 1.2
      
      // Transition 2: Grey (#1E1E1E) to Blue (#012169) - within stats section
      // Stats section starts at 150vh, transition happens during horizontal scroll
      const statsSectionStart = windowHeight * 1.5 // 150vh
      const greyToBlueStart = statsSectionStart + (windowHeight * 0.2) // Start when red box is visible
      const greyToBlueEnd = statsSectionStart + (windowHeight * 1.0) // Complete when blue circle is centered
      
      if (scrollY <= heroToStatsStart) {
        // Still in hero section - blue
        setBgColor('#012169')
      } else if (scrollY >= heroToStatsEnd && scrollY < greyToBlueStart) {
        // In stats section, before grey-to-blue transition - grey
        setBgColor('#1E1E1E')
      } else if (scrollY >= greyToBlueEnd) {
        // Past stats section transition - blue
        setBgColor('#012169')
      } else if (scrollY >= heroToStatsStart && scrollY < heroToStatsEnd) {
        // Transition 1: Blue to Grey
        const progress = (scrollY - heroToStatsStart) / (heroToStatsEnd - heroToStatsStart)
        
        const startR = 1, startG = 33, startB = 105 // #012169
        const endR = 30, endG = 30, endB = 30 // #1E1E1E
        
        const r = Math.round(startR + (endR - startR) * progress)
        const g = Math.round(startG + (endG - startG) * progress)
        const b = Math.round(startB + (endB - startB) * progress)
        
        setBgColor(`rgb(${r}, ${g}, ${b})`)
      } else if (scrollY >= greyToBlueStart && scrollY < greyToBlueEnd) {
        // Transition 2: Grey to Blue
        const progress = (scrollY - greyToBlueStart) / (greyToBlueEnd - greyToBlueStart)
        
        const startR = 30, startG = 30, startB = 30 // #1E1E1E
        const endR = 1, endG = 33, endB = 105 // #012169
        
        const r = Math.round(startR + (endR - startR) * progress)
        const g = Math.round(startG + (endG - startG) * progress)
        const b = Math.round(startB + (endB - startB) * progress)
        
        setBgColor(`rgb(${r}, ${g}, ${b})`)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="app" style={{ backgroundColor: bgColor }}>
      {/* Shared fixed background for hero, stats, and graph sections */}
      <div className="shared-background" style={{ backgroundColor: bgColor }}>
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-pattern"></div>
        <div className="particles">
          {Array.from({ length: 50 }).map((_, i) => (
            <div 
              key={i} 
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>
      <div className="hero-wrapper">
        <HeroSection />
      </div>
      <StatsSection />
      <UnicornsSection />
      <GraphSection />
    </div>
  )
}

export default App

