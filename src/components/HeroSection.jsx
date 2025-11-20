import { useEffect, useRef, useState } from 'react'
import './HeroSection.css'

const HeroSection = () => {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [rawProgress, setRawProgress] = useState(0)
  const [showSubtitle, setShowSubtitle] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const sectionRef = useRef(null)
  const animationRef = useRef(null)

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // More aggressive ease-out for dramatic ramp
  const easeOutQuart = (t) => {
    return 1 - Math.pow(1 - t, 4)
  }

  // Trigger subtitle animation after 0.3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSubtitle(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const animationDuration = window.innerHeight // Use viewport height as animation duration
      
      // Calculate raw progress based on scroll position (0 to 1)
      const raw = Math.max(0, Math.min(1, scrollY / animationDuration))
      
      // Apply easing function for more ramped effect
      const eased = easeOutQuart(raw)
      
      setRawProgress(raw)
      setScrollProgress(eased)
    }

    // Initial calculation
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Handle window resize
    const handleResize = () => {
      handleScroll()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Toggle to re-enable the oversized zoom effect if needed
  const HERO_ZOOM_ENABLED = false

  // Calculate font size and letter spacing based on eased scroll progress
  // Make it grow large enough to exit frame completely
  const baseFontSize = isMobile ? 3 : 7
  const fontSize = baseFontSize + (scrollProgress * 95) // Grows from base size
  const letterSpacing = 0.1 + (scrollProgress * 4) // Grows from 0.1rem to 4.1rem
  const zoomScale = HERO_ZOOM_ENABLED ? 1 + (scrollProgress * 7) : 1
  const translateY = scrollProgress * -300 // Move up as it grows
  
  // Smooth fade out as it exits frame (starts fading at 95% progress - let it fully exit first)
  const textOpacity = rawProgress < 0.95 ? 1 : Math.max(0, 1 - ((rawProgress - 0.95) / 0.05))
  
  // Smooth section transition - fade out gradually (after text has exited)
  const sectionOpacity = rawProgress < 0.98 ? 1 : Math.max(0, 1 - ((rawProgress - 0.98) / 0.02))
  const sectionZIndex = rawProgress >= 1 ? 0 : 10

  // Subtitle moves DOWN shorter distance and fades out faster
  const subtitleTranslateY = scrollProgress * 20 // Moves DOWN only 20px (shorter distance)
  const subtitleOpacity = rawProgress < 0.01 ? 1 : Math.max(0, 1 - ((rawProgress - 0.01) / 0.05)) // Fades out extremely quickly (by 6% scroll)

  // Load Lottie animation
  useEffect(() => {
    if (!animationRef.current) return

    const lottieLib = window?.lottie || window?.bodymovin
    if (!lottieLib) {
      console.warn('Lottie script not loaded yet')
      return
    }

    const animationInstance = lottieLib.loadAnimation({
      container: animationRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/button-press.json',
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet'
      }
    })

    return () => {
      animationInstance?.destroy()
    }
  }, [])

  return (
    <section 
      ref={sectionRef}
      className="hero-section"
      style={{
        opacity: sectionOpacity,
        zIndex: sectionZIndex,
        pointerEvents: rawProgress >= 1 ? 'none' : 'auto',
        transition: 'opacity 0.5s ease-out',
        background: 'transparent' // Background now handled by shared-background
      }}
    >
      <div className="hero-content">
        {/* Commented out - may bring back later
        <div 
          className="hero-text"
          style={{
            fontSize: `${fontSize}rem`,
            letterSpacing: `${letterSpacing}rem`,
            opacity: textOpacity,
            transform: `translateY(${translateY}px) scale(${zoomScale})`,
            transition: 'opacity 0.3s ease-out'
          }}
        >
          Vibeshift <span className="uk-text">UK</span>
        </div>
        */}
        <div
          ref={animationRef}
          className="hero-animation"
          style={{
            opacity: textOpacity,
            transform: `translateY(${translateY}px) scale(${zoomScale})`,
            transition: 'opacity 0.3s ease-out',
            pointerEvents: 'none'
          }}
        />
        <div 
          className={`hero-subtitle ${showSubtitle ? 'show' : ''}`}
          style={
            rawProgress > 0 ? {
              // Only apply scroll transforms after scrolling starts
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleTranslateY}px)`,
              transition: 'none'
            } : {}
          }
        >
          Politicians love to talk the UK down but it's time to reset the narrative,<br />
          UK AI and tech is moving at 100mph.<br />
          We're building a dashboard that tracks the UK AI story in realtime
        </div>
      </div>
    </section>
  )
}

export default HeroSection

