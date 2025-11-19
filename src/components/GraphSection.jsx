import { useEffect, useRef, useState, useMemo } from 'react'
import { useInView, motion } from 'framer-motion'
import ForceGraph2D from 'react-force-graph-2d'
import Papa from 'papaparse'
import * as d3 from 'd3-force'
import './GraphSection.css'

const GraphSection = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [selectedNode, setSelectedNode] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [highlightedNode, setHighlightedNode] = useState(null)
  const sectionRef = useRef(null)
  const graphRef = useRef(null)
  const isInView = useInView(sectionRef, { amount: 0.2 })

  // Colour mapping for categories
  const categoryColors = {
    Research: '#6B7FD7',
    Industry: '#4A90E2',
    Healthcare: '#E74C3C',
    Education: '#F39C12',
    Infrastructure: '#9B59B6',
    Startup: '#1ABC9C',
    Defence: '#E67E22',
    Energy: '#16A085',
    Creative: '#E91E63',
    Legal: '#3498DB',
    Entertainment: '#9C27B0'
  }

  useEffect(() => {
    // Load CSV data
    fetch('/investments.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const nodes = []
            const links = []
            const categoryGroups = {}

            // Add central "UK AI" node first
            const centralNode = {
              id: 'central-uk-ai',
              name: 'UK AI',
              description: 'Central hub for UK AI investments',
              category: 'Central',
              type: 'central',
              size: 28, // Much larger than other nodes (reduced from 35)
              fx: 0, // Fixed x position at center
              fy: 0  // Fixed y position at center
            }
            nodes.push(centralNode)

            // Create investment nodes and link each to central node
            results.data.forEach((row, index) => {
              const category = row.Category || 'General'
              
              // Create investment node
              const node = {
                id: `investment-${index}`,
                name: row.Title || row.Name || 'Investment',
                description: row.Description || '',
                category: category,
                type: 'investment',
                size: 8 + Math.random() * 5 // Random size variation 8-13px (reduced from 10-18px)
              }
              
              nodes.push(node)
              
              // Link EVERY investment node to central node
              links.push({
                source: 'central-uk-ai',
                target: node.id,
                value: 1 // Standard link strength
              })
            })

            setGraphData({ nodes, links })
          }
        })
      })
      .catch(error => {
        console.error('Error loading CSV:', error)
      })
  }, [])

          // Random highlight effect - changes every 10 seconds
          useEffect(() => {
            if (graphData.nodes.length === 0) return

            // Apply forces when graph data is loaded
            if (graphRef.current) {
              // Remove radial force to allow non-circular shape
              graphRef.current.d3Force('radial', null)
              
              // Strong vertical compression for oval shape
              graphRef.current.d3Force('y-compression', d3.forceY().strength(0.2))
              
              // Weak horizontal compression to fill width
              graphRef.current.d3Force('x-compression', d3.forceX().strength(0.05))
              
              // Collision force to prevent overlaps
              graphRef.current.d3Force('collision', d3.forceCollide()
                .radius(node => {
                  let size = node.size || 10
                  // Central node needs much larger collision radius
                  if (node.type === 'central') return size + 40
                  if (node === highlightedNode) size *= 1.5
                  if (node === hoveredNode) size *= 1.2
                  return size + 10 // Moderate buffer (back to 10)
                })
                .strength(0.6) // Strength back to 0.6
                .iterations(2) // Reduced iterations (from 3)
              )
              
              // Re-heat simulation to apply new forces
              graphRef.current.d3ReheatSimulation()
              
              // Zoom to fit shortly after render to avoid delay
              setTimeout(() => {
                if (graphRef.current) {
                  graphRef.current.zoomToFit(1000, 50)
                }
              }, 200)
            }

            const changeHighlight = () => {
      const investmentNodes = graphData.nodes.filter(n => n.type === 'investment')
      if (investmentNodes.length > 0) {
        const randomNode = investmentNodes[Math.floor(Math.random() * investmentNodes.length)]
        setHighlightedNode(randomNode)
        
        // Force graph to re-render with animation
        if (graphRef.current) {
          graphRef.current.refresh()
        }
      }
    }

    // Initial highlight after a short delay
    const initialTimer = setTimeout(changeHighlight, 1000)

    // Change highlight every 10 seconds
    const interval = setInterval(changeHighlight, 10000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [graphData])

  const handleNodeClick = (node) => {
    // Don't show popup for central node
    if (node.type === 'central') {
      return
    }
    setSelectedNode(node)
  }

  const handleNodeDrag = (node) => {
    // Prevent dragging of central node
    if (node.type === 'central') {
      node.fx = 0
      node.fy = 0
    }
  }

  const paintNode = (node, ctx) => {
    if (!node.x || !node.y) return // Safety check
    
    // Use calculated size, with fallback defaults
    let baseSize = node.size || 10
    
    // Make highlighted node larger with smooth animation
    if (node === highlightedNode) {
      baseSize = baseSize * 1.5 // Highlighted nodes are 50% larger (reduced from 150%)
    }
    
    // Hover makes it slightly larger
    const size = node === hoveredNode ? baseSize * 1.2 : baseSize
    
    // Determine colours based on category or node type
    let categoryColor, isUKFlag = false
    
    if (node.type === 'central') {
      // UK flag colors for central node
      categoryColor = '#012169' // UK flag blue
      isUKFlag = true
    } else {
      categoryColor = categoryColors[node.category] || '#6B7FD7'
    }
    
    const color = node === hoveredNode ? '#FFFFFF' : categoryColor
    
    // Create glow color with transparency
    const rgb = {
      r: parseInt(categoryColor.slice(1, 3), 16),
      g: parseInt(categoryColor.slice(3, 5), 16),
      b: parseInt(categoryColor.slice(5, 7), 16)
    }
            const glowColorRgba = node === hoveredNode || node === highlightedNode 
              ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)` 
              : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)` // Reduced glow opacity for regular nodes
            
            // Draw glow effect
            const glowSize = node === highlightedNode ? size * 3 : size * 2 // Reduced glow radius for regular nodes
            const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowSize)
            
            glowGradient.addColorStop(0, glowColorRgba)
            if (node === highlightedNode) {
              glowGradient.addColorStop(0.4, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`)
            } else {
              glowGradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`)
            }
            glowGradient.addColorStop(1, 'transparent')
            
            ctx.beginPath()
            ctx.arc(node.x, node.y, glowSize, 0, 2 * Math.PI, false)
    ctx.fillStyle = glowGradient
    ctx.fill()
    
    // For UK flag central node, draw the logo image
    if (isUKFlag && ukFlagImage) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false)
      ctx.clip()
      // Draw image centered and scaled to fit the circular node
      // Draw a square image centered on the node
      const drawSize = size * 2
      ctx.drawImage(ukFlagImage, node.x - size, node.y - size, drawSize, drawSize)
      
      // Add a subtle border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()
    } else if (isUKFlag) {
      // Fallback if image hasn't loaded yet - Blue background
      ctx.beginPath()
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false)
      ctx.fillStyle = '#012169'
      ctx.fill()
            } else {
              // Regular node drawing - solid color with inner glow
              
              // Main circle
              ctx.beginPath()
              ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false)
              ctx.fillStyle = categoryColor
              ctx.fill()
              
              // Subtle inner glow/gradient for depth
              const innerGradient = ctx.createRadialGradient(
                node.x - size * 0.3, 
                node.y - size * 0.3, 
                0,
                node.x, 
                node.y, 
                size
              )
              innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)')
              innerGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)')
              
              ctx.fillStyle = innerGradient
              ctx.fill()
              
              // Border
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
              ctx.lineWidth = 1.5
              ctx.stroke()
            }
    
    // Draw selection ring
    if (node === selectedNode) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI, false)
      ctx.strokeStyle = '#4A90E2'
      ctx.lineWidth = 4
      ctx.shadowBlur = 20
      ctx.shadowColor = '#4A90E2'
      ctx.stroke()
      ctx.shadowBlur = 0
    }
  }

  const paintLabels = (ctx, globalScale) => {
    // Draw labels for important nodes (central, hovered, selected, highlighted)
    // We draw them in a separate pass to ensure they are always on top
    
    const nodesToLabel = []
    
    // Add central node
    const centralNode = graphData.nodes.find(n => n.type === 'central')
    if (centralNode) nodesToLabel.push(centralNode)
    
    // Add interacted nodes (avoiding duplicates)
    if (highlightedNode && highlightedNode !== centralNode) nodesToLabel.push(highlightedNode)
    if (selectedNode && selectedNode !== centralNode && selectedNode !== highlightedNode) nodesToLabel.push(selectedNode)
    if (hoveredNode && hoveredNode !== centralNode && hoveredNode !== highlightedNode && hoveredNode !== selectedNode) nodesToLabel.push(hoveredNode)
    
    nodesToLabel.forEach(node => {
      if (!node.x || !node.y) return
      
      // Determine size to calculate offset
      let size = node.size || 10
      if (node.type === 'central') size = 28
      if (node === highlightedNode) size *= 1.5
      if (node === hoveredNode) size *= 1.2
      
      const fontSize = node.type === 'central' ? 16 : 12
      
      // Use consistent font with the rest of the site
      ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`
      
      // High quality text rendering
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Text position with better spacing
      const labelY = node.y - size - 14
      
      // White fill with subtle shadow (no stroke)
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.shadowBlur = 6
      ctx.shadowOffsetY = 2
      ctx.fillStyle = '#F5F5F5'
      ctx.fillText(node.name, node.x, labelY)
      
      // Reset shadow
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0
    })
  }

  return (
    <section ref={sectionRef} className="graph-section">
      {/* Background now handled by shared-background in App */}
      <motion.div
        className="graph-container"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="graph-title">UK AI Story...</h2>
        <div className="graph-wrapper">
          {graphData.nodes.length > 0 && (
            <ForceGraph2D
              ref={graphRef}
              graphData={graphData}
              nodeLabel="" // Disable tooltip to prevent double popup
              nodeColor={node => {
                if (node === hoveredNode) return '#FFFFFF'
                if (node.type === 'central') return '#012169'
                return categoryColors[node.category] || '#6B7FD7'
              }}
              nodeVal={node => {
                let baseSize = node.size || 10
                // Central node is always larger
                if (node.type === 'central') return baseSize
                // Highlighted node is much larger
                if (node === highlightedNode) baseSize *= 1.5
                // Hovered node is slightly larger
                if (node === hoveredNode) baseSize *= 1.2
                return baseSize
              }}
              linkColor={() => 'rgba(255, 255, 255, 0.4)'}
              linkWidth={link => (link.value || 1) * 3}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.01}
              linkDirectionalParticleWidth={2}
              onNodeClick={handleNodeClick}
              onNodeHover={setHoveredNode}
              onNodeDrag={handleNodeDrag}
              onNodeDragEnd={handleNodeDrag}
              nodeCanvasObject={paintNode}
              nodeCanvasObjectMode={() => 'replace'}
              onRenderFramePost={paintLabels}
              linkDirectionalArrowLength={0}
              cooldownTicks={300} // Even longer cooldown for smoother settling
              warmupTicks={200}
              // Higher drag/friction to dampen movement significantly
              d3VelocityDecay={0.9} // High friction (was 0.8) - key for "calmness"
              d3AlphaDecay={0.01}   // Slower cooling for gentle settling (was 0.02)
              d3AlphaMin={0.001}
              // Direct d3Force prop configuration with function
              d3Force={(forceName, force) => {
                if (forceName === 'charge') {
                  // Configure charge force - stronger forcefield
                  force.strength(-500).distanceMax(600)
                }
                if (forceName === 'link') {
                  // Configure link force
                  force.distance(180).strength(0.05)
                }
                if (forceName === 'center') {
                   // Configure center force - increased for stronger pull to center
                   force.strength(0.05)
                }
                // Add vertical compression force to create oval/landscape spread
                if (forceName === 'y-compression') {
                  return d3.forceY().strength(0.2)
                }
                // Add horizontal compression
                if (forceName === 'x-compression') {
                  return d3.forceX().strength(0.05)
                }
                // Add collision force to prevent overlaps
                if (forceName === 'collision') {
                  return d3.forceCollide()
                    .radius(node => {
                      let size = node.size || 10
                      // Central node needs much larger collision radius
                      if (node.type === 'central') return size + 35
                      if (node === highlightedNode) size *= 1.5
                      if (node === hoveredNode) size *= 1.2
                      return size + 20 // Moderate buffer
                    })
                    .strength(0.8)
                    .iterations(3)
                }
              }}
              onEngineStop={() => {
                // Optional: Ensure forces are maintained if needed, but don't re-heat or zoom here
                if (graphRef.current) {
                  // Re-apply forces to ensure stability without restarting simulation loop
                  graphRef.current.d3Force('y-compression', d3.forceY().strength(0.2))
                  graphRef.current.d3Force('x-compression', d3.forceX().strength(0.05))
                }
              }}
              // ZOOM_PAN_DISABLED: Set these to true to re-enable zoom and pan
              enableZoomInteraction={false}
              enablePanInteraction={false}
              enableNodeDrag={true} // Keep node dragging enabled
              backgroundColor="transparent"
            />
          )}
        </div>
        {selectedNode && (
          <motion.div
            className="node-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <button className="close-button" onClick={() => setSelectedNode(null)}>×</button>
            <h3>{selectedNode.name}</h3>
            {selectedNode.description && (
              <p className="description">{selectedNode.description}</p>
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}

export default GraphSection

