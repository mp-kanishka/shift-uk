import { useState, useEffect } from 'react'
import HeroSection from './components/HeroSection'
import StatsSection from './components/StatsSection'
import GraphSection from './components/GraphSection'
import './App.css'

function App() {
  const [bgColor, setBgColor] = useState('#012169')

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      
      // Start transition when approaching section 2 (stats section)
      // Transition starts at 80% of viewport height and completes by 150%
      const startTransition = windowHeight * 0.8
      const endTransition = windowHeight * 1.5
      
      if (scrollY <= startTransition) {
        setBgColor('#012169')
      } else if (scrollY >= endTransition) {
        setBgColor('#1E1E1E')
      } else {
        // Interpolate colors
        const progress = (scrollY - startTransition) / (endTransition - startTransition)
        
        // RGB values for #012169
        const startR = 1, startG = 33, startB = 105
        // RGB values for #1E1E1E
        const endR = 30, endG = 30, endB = 30
        
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
      <GraphSection />
    </div>
  )
}

export default App

