import { useRef, useEffect } from 'react'
import './UnicornsSection.css'

const UnicornsSection = () => {
  const sectionRef = useRef(null)

  // Scroll snapping logic to make it feel properly sticky
  useEffect(() => {
    let isScrolling;
    
    const handleScrollSnap = () => {
      window.clearTimeout(isScrolling);

      // Set a timeout to run after scrolling ends
      isScrolling = setTimeout(() => {
        if (!sectionRef.current) return;
        
        const scrollY = window.scrollY;
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate snap point: when section top reaches viewport top (sticky position)
        // If section is above viewport: snapPoint = scrollY + rect.top
        // If section is sticky (rect.top ≈ 0): snapPoint = scrollY (current position)
        // If section is below viewport: we're past it, don't snap
        
        let snapPoint = null;
        const isInStickyRange = rect.top >= -50 && rect.top <= 50;
        
        if (isInStickyRange) {
          // Section is in sticky range - calculate exact snap point
          if (rect.top > 0) {
            // Section is above sticky position, snap point is when it reaches top
            snapPoint = scrollY + rect.top;
          } else {
            // Section is sticky or slightly past, snap to current position
            snapPoint = scrollY;
          }
        }
        
        if (snapPoint !== null && isInStickyRange) {
          // Check if we're close enough to snap
          const dist = Math.abs(scrollY - snapPoint);
          const snapThreshold = 300;
          
          if (dist < snapThreshold) {
            window.scrollTo({ top: snapPoint, behavior: 'smooth' });
          }
        }
      }, 100); // Wait 100ms after scroll stops
    };

    window.addEventListener('scroll', handleScrollSnap, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScrollSnap);
      window.clearTimeout(isScrolling);
    };
  }, []);

  return (
    <section ref={sectionRef} className="unicorns-section">
      <div className="unicorns-sticky-container">
        <div className="unicorns-content">
          <div className="uk-visual-container">
            <div className="number-overlay">
              <span className="uk-masked-text">160+</span>
            </div>
            <img 
              src="/uk.svg" 
              alt="United Kingdom" 
              className="uk-icon"
              loading="lazy"
            />
          </div>
          <p className="unicorns-text">
            Over 160 unicorns took their first steps in the United Kingdom
          </p>
        </div>
      </div>
    </section>
  )
}

export default UnicornsSection

