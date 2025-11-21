import { useState, useEffect } from 'react'
import HeroSection from './components/HeroSection'
import ShiftNarrativeSection from './components/ShiftNarrativeSection'
import StatsSection from './components/StatsSection'
import UnicornsSection from './components/UnicornsSection'
import GraphSection from './components/GraphSection'
import './App.css'

function App() {
  const [bgColor, setBgColor] = useState('#012169')
  const [logoScale, setLogoScale] = useState(1)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 1300 : false)

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1300)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      
      // On mobile, keep background blue throughout
      if (isMobile) {
        setBgColor('#012169')
        // Still handle logo animation on mobile - shorter scroll distance
        const heroScrollEnd = windowHeight * 0.3 // Very short animation for 60vh hero
        if (scrollY <= heroScrollEnd) {
          const scaleProgress = scrollY / heroScrollEnd
          const scale = 1.8 - (scaleProgress * 0.8)
          setLogoScale(scale)
        } else {
          setLogoScale(1)
        }
        return
      }
      
      // Desktop: color transitions and logo animation
      // Hero section: 150vh - BLUE
      // ShiftNarrative section: 150vh to 250vh (100vh tall) - BLUE
      // Stats section Red Box: starts at 250vh - GREY
      // Stats section Blue Circle (unicorns comparison): around 350vh - BLUE
      // Unicorns section: starts at 550vh, ends at 700vh (150vh) - GREY
      // Graph section: starts at 700vh - BLUE
      
      // Transition 1: Blue to Grey - entering Stats Red Box section
      const statsSectionStart = windowHeight * 2.5 // 250vh
      const blueToGreyStart = statsSectionStart - (windowHeight * 0.2)
      const blueToGreyEnd = statsSectionStart + (windowHeight * 0.1)
      
      // Transition 2: Grey to Blue - within Stats section (for blue circle)
      const blueCircleStart = statsSectionStart + (windowHeight * 0.8)
      const greyToBlue1Start = blueCircleStart - (windowHeight * 0.2)
      const greyToBlue1End = blueCircleStart
      
      // Transition 3: Blue to Grey - entering Unicorns section
      const unicornsSectionStart = windowHeight * 5.5
      const blueToGrey2Start = unicornsSectionStart - (windowHeight * 0.3)
      const blueToGrey2End = unicornsSectionStart
      
      // Transition 4: Grey to Blue - entering Graph section
      const graphSectionStart = windowHeight * 7.0
      const greyToBlue2Start = graphSectionStart - (windowHeight * 0.5)
      const greyToBlue2End = graphSectionStart

      if (scrollY < blueToGreyStart) {
        // Hero and Shift Narrative sections - blue
        setBgColor('#012169')
      } else if (scrollY >= blueToGreyEnd && scrollY < greyToBlue1Start) {
        // Stats Red Box section - grey
        setBgColor('#1E1E1E')
      } else if (scrollY >= greyToBlue1End && scrollY < blueToGrey2Start) {
        // Stats Blue Circle section - blue
        setBgColor('#012169')
      } else if (scrollY >= blueToGrey2End && scrollY < greyToBlue2Start) {
        // Unicorns section - grey
        setBgColor('#1E1E1E')
      } else if (scrollY >= greyToBlue2End) {
        // Graph section - blue
        setBgColor('#012169')
      } else if (scrollY >= blueToGreyStart && scrollY < blueToGreyEnd) {
        // Transition 1: Blue to Grey (entering Stats Red Box)
        const progress = (scrollY - blueToGreyStart) / (blueToGreyEnd - blueToGreyStart)
        
        const startR = 1, startG = 33, startB = 105 // #012169
        const endR = 30, endG = 30, endB = 30 // #1E1E1E
        
        const r = Math.round(startR + (endR - startR) * progress)
        const g = Math.round(startG + (endG - startG) * progress)
        const b = Math.round(startB + (endB - startB) * progress)
        
        setBgColor(`rgb(${r}, ${g}, ${b})`)
      } else if (scrollY >= greyToBlue1Start && scrollY < greyToBlue1End) {
        // Transition 2: Grey to Blue (Stats Blue Circle)
        const progress = (scrollY - greyToBlue1Start) / (greyToBlue1End - greyToBlue1Start)
        
        const startR = 30, startG = 30, startB = 30 // #1E1E1E
        const endR = 1, endG = 33, endB = 105 // #012169
        
        const r = Math.round(startR + (endR - startR) * progress)
        const g = Math.round(startG + (endG - startG) * progress)
        const b = Math.round(startB + (endB - startB) * progress)
        
        setBgColor(`rgb(${r}, ${g}, ${b})`)
      } else if (scrollY >= blueToGrey2Start && scrollY < blueToGrey2End) {
        // Transition 3: Blue to Grey (entering Unicorns)
        const progress = (scrollY - blueToGrey2Start) / (blueToGrey2End - blueToGrey2Start)
        
        const startR = 1, startG = 33, startB = 105 // #012169
        const endR = 30, endG = 30, endB = 30 // #1E1E1E
        
        const r = Math.round(startR + (endR - startR) * progress)
        const g = Math.round(startG + (endG - startG) * progress)
        const b = Math.round(startB + (endB - startB) * progress)
        
        setBgColor(`rgb(${r}, ${g}, ${b})`)
      } else if (scrollY >= greyToBlue2Start && scrollY < greyToBlue2End) {
        // Transition 4: Grey to Blue (entering Graph)
        const progress = (scrollY - greyToBlue2Start) / (greyToBlue2End - greyToBlue2Start)
        
        const startR = 30, startG = 30, startB = 30 // #1E1E1E
        const endR = 1, endG = 33, endB = 105 // #012169
        
        const r = Math.round(startR + (endR - startR) * progress)
        const g = Math.round(startG + (endG - startG) * progress)
        const b = Math.round(startB + (endB - startB) * progress)
        
        setBgColor(`rgb(${r}, ${g}, ${b})`)
      }

      // Logo scale animation - shrinks during hero section scroll
      const heroScrollEnd = windowHeight * 0.8 // Shrink completes by 80% through hero section
      if (scrollY <= heroScrollEnd) {
        // Scale from 1.8 (large) to 1 (normal)
        const scaleProgress = scrollY / heroScrollEnd
        const scale = 1.8 - (scaleProgress * 0.8) // 1.8 -> 1
        setLogoScale(scale)
      } else {
        setLogoScale(1)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMobile])

  return (
    <div className="app" style={{ backgroundColor: bgColor }}>
      {/* Fixed logo across entire site */}
      <div 
        className="app-logo"
        style={{
          transform: `scale(${logoScale})`,
          transformOrigin: 'top left',
          transition: 'transform 0.1s ease-out'
        }}
      >
        Shift <span className="app-logo-uk">UK</span>
      </div>
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
      <ShiftNarrativeSection />
      <StatsSection />
      <UnicornsSection />
      <GraphSection />
    </div>
  )
}

export default App

