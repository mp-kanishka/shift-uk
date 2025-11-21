import { useRef, useState, useEffect } from 'react'
import { useInView, motion, useScroll, useTransform } from 'framer-motion'
import './StatsSection.css'

const StatsSection = () => {
  const sectionRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  
  // Use Framer Motion's useScroll for smoother parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1300)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      
      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Calculate progress within the section
      // We want the animation to happen when the section is fixed/sticky
      // The section should be tall enough to allow for scrolling
      
      // Simple calculation: how far has the top of the section moved up?
      // We start counting when the section hits the top of the viewport (or slightly before)
      const start = 0
      const end = -windowHeight * 1.5 // Scroll distance of 1.5 viewport heights
      
      const rawProgress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)))
      setScrollProgress(rawProgress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll snapping logic
  useEffect(() => {
    let isScrolling;
    
    const handleScrollSnap = () => {
      // Disable snap on mobile
      if (window.innerWidth <= 1300) return;

      window.clearTimeout(isScrolling);

      // Set a timeout to run after scrolling ends
      isScrolling = setTimeout(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Calculate current progress again (same logic as above)
        // Note: We need to get the section position again
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        
        // Section geometry
        // The section is 300vh tall (from CSS)
        // It becomes sticky when it hits top (rect.top <= 0)
        // It stops being sticky when the bottom hits bottom (rect.bottom <= windowHeight)
        
        // We define snap points based on scroll depth into the section
        // Start of section (Hero fade out done): roughly 150vh from top of page
        // We want to snap to:
        // 1. The Red Box (start of stats scroll)
        // 2. The Blue Circle (further down stats scroll)
        
        // Let's define snap points relative to the document
        // The section starts after the hero wrapper (150vh) and shift narrative (100vh) = 250vh
        const sectionStart = windowHeight * 2.5; 
        
        // Snap point 1: Red Box (approx 200vh + some buffer)
        const snapPoint1 = sectionStart + windowHeight * 0.2;
        
        // Snap point 2: Blue Circle (further down, approx 200vh + 1.2vh)
        const snapPoint2 = sectionStart + windowHeight * 1.2;
        
        // Check distance to snap points
        const dist1 = Math.abs(scrollY - snapPoint1);
        const dist2 = Math.abs(scrollY - snapPoint2);
        
        // Only snap if close enough (within 300px)
        const snapThreshold = 300;
        
        if (dist1 < snapThreshold && dist1 < dist2) {
          window.scrollTo({ top: snapPoint1, behavior: 'smooth' });
        } else if (dist2 < snapThreshold && dist2 < dist1) {
          window.scrollTo({ top: snapPoint2, behavior: 'smooth' });
        }
        
      }, 100); // Wait 100ms after scroll stops
    };

    window.addEventListener('scroll', handleScrollSnap, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScrollSnap);
      window.clearTimeout(isScrolling);
    };
  }, []);

  // Calculate horizontal scroll with entry + exit buffers
  // Start: wait ~20% before moving so the red box settles
  // End: finish movement by ~70% so blue circle stays static while reader finishes
  const startScroll = 0.2
  const endScroll = 0.7
  let horizontalP = 0
  if (scrollProgress > startScroll) {
    horizontalP = Math.min((scrollProgress - startScroll) / (endScroll - startScroll), 1)
  }
  const shiftAmount = horizontalP * 100 // Shift 100vw left
  
  // Mobile version - simple bullet points
  if (isMobile) {
    return (
      <section ref={sectionRef} className="stats-section stats-section-mobile">
        <div className="stats-mobile-container">
          <div className="stat-bullet">
            <span className="bullet-icon">🇬🇧</span>
            <p>We have the largest tech economy in Europe, and third largest in the world</p>
          </div>

          <div className="stat-bullet">
            <span className="bullet-icon">🦄</span>
            <p>We've produced more unicorns than France and Germany combined</p>
          </div>

          <div className="stat-bullet">
            <span className="bullet-icon">🚀</span>
            <p>Over 160 unicorns took their first steps in the United Kingdom</p>
          </div>
        </div>
      </section>
    )
  }

  // Desktop version - horizontal scroll
  return (
    <section ref={sectionRef} className="stats-section">
      <div className="stats-sticky-container">
        <div className="horizontal-scroll-track" style={{ transform: `translateX(-${shiftAmount}vw)` }}>
          
          {/* Red Box - "We have the largest tech economy..." */}
          <div className="stat-item red-box-group">
            <div className="red-box">
              <div className="stat-content">
                We have the largest tech economy in Europe, and third largest in the world
              </div>
            </div>
            <img 
              src="/europe.svg" 
              alt="Stylised map of Europe highlighting the United Kingdom" 
              className="europe-map"
              loading="lazy"
            />
          </div>

          {/* Blue Circle - "We've produced more unicorns..." */}
          <div className="stat-item blue-circle-container">
            <img src="/france.svg" alt="France" className="flag-circle flag-france" />
            <img src="/germany.svg" alt="Germany" className="flag-circle flag-germany" />
            <img src="/uk-blur.svg" alt="United Kingdom" className="flag-circle flag-uk" />
            <div className="unicorns-stat-text">
              We've produced more unicorns than France and Germany combined
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default StatsSection

