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
  const [isHoverPaused, setIsHoverPaused] = useState(false)
  const hoverTimeoutRef = useRef(null)
  const [highlightedNode, setHighlightedNode] = useState(null)
  const sectionRef = useRef(null)
  const graphRef = useRef(null)
  const isInView = useInView(sectionRef, { amount: 0.2 })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Color palette - variations on C8102E (red), 00A3E8 (blue), F5F5F5 (light)
  const colorPalette = [
    '#00A3E8',      // Base blue
    '#0088C7',       // Darker blue
    '#C8102E',       // Base red
    '#E03A4F',       // Lighter red
    '#4DB8E8',       // Light blue
    '#B80D2E',       // Darker red
    '#66C4F0',       // Very light blue
    '#A00E28',       // Dark red
    '#F5F5F5',       // Light gray/white
    '#1A7AA8',       // Deep blue
    '#D4D4D4'        // Light gray variation
  ]
  const getRandomColor = (() => {
    const cache = new Map()
    return (id) => {
      if (cache.has(id)) return cache.get(id)
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      cache.set(id, color)
      return color
    }
  })()

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

            // Central node removed
            /*
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
            */

            // Create investment nodes
            results.data.forEach((row, index) => {
              const category = row.Category || 'General'
              
              // Create investment node with random color
              const nodeId = `investment-${index}`
              const node = {
                id: nodeId,
                name: row.Title || row.Name || 'Investment',
                description: row.Description || '',
                category: category,
                date: row.Date || '',
                type: 'investment',
                size: 8 + Math.random() * 5, // Random size variation 8-13px (reduced from 10-18px)
                color: getRandomColor(nodeId)
              }
              
              nodes.push(node)
              
              // No default links to central node
            })

            // Generate random connections (min 2 per node)
            const linkExists = (source, target) => {
                return links.some(l => 
                    (l.source === source && l.target === target) || 
                    (l.source === target && l.target === source)
                )
            }

            const connectionCounts = new Map(nodes.map(n => [n.id, 0]))

            nodes.forEach(sourceNode => {
                let safety = 0
                while (connectionCounts.get(sourceNode.id) < 2 && safety < 100) {
                    const targetNode = nodes[Math.floor(Math.random() * nodes.length)]
                    
                    if (sourceNode.id !== targetNode.id && !linkExists(sourceNode.id, targetNode.id)) {
                        links.push({
                            source: sourceNode.id,
                            target: targetNode.id,
                            value: 1
                        })
                        connectionCounts.set(sourceNode.id, connectionCounts.get(sourceNode.id) + 1)
                        connectionCounts.set(targetNode.id, connectionCounts.get(targetNode.id) + 1)
                    }
                    safety++
                }
            })
            
            // Add a small amount of extra random connections for better mesh density
            const extraLinks = Math.floor(nodes.length * 0.3) // 30% extra edges
            for (let i = 0; i < extraLinks; i++) {
                 const source = nodes[Math.floor(Math.random() * nodes.length)]
                 const target = nodes[Math.floor(Math.random() * nodes.length)]
                 if (source.id !== target.id && !linkExists(source.id, target.id)) {
                     links.push({ source: source.id, target: target.id, value: 1 })
                 }
            }

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
              graphRef.current.d3Force('y-compression', d3.forceY().strength(0.25))
              
              // Horizontal compression to spread out width (increased for more oval shape)
              graphRef.current.d3Force('x-compression', d3.forceX().strength(0.02))
              
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

  // Handle window resize - update dimensions and reheat simulation
  useEffect(() => {
    let resizeTimer
    
    const updateDimensions = () => {
      if (sectionRef.current) {
        const wrapper = sectionRef.current.querySelector('.graph-wrapper')
        if (wrapper) {
          setDimensions({
            width: wrapper.clientWidth,
            height: wrapper.clientHeight
          })
        }
      }
    }
    
    const handleResize = () => {
      // Debounce resize events
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        updateDimensions()
        
        if (graphRef.current && graphData.nodes.length > 0) {
          // Re-apply forces
          graphRef.current.d3Force('y-compression', d3.forceY().strength(0.25))
          graphRef.current.d3Force('x-compression', d3.forceX().strength(0.02))
          
          // Reheat simulation to redistribute nodes
          graphRef.current.d3ReheatSimulation()
          
          // Zoom to fit after a brief delay
          setTimeout(() => {
            if (graphRef.current) {
              graphRef.current.zoomToFit(400, 50)
            }
          }, 300)
        }
      }, 250) // Wait 250ms after resize stops
    }
    
    // Initial dimensions
    updateDimensions()
    
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer)
    }
  }, [graphData])

  const handleNodeHover = (node) => {
    setHoveredNode(node)
    
    if (node) {
      // When hovering a node, pause the highlight effect immediately
      setIsHoverPaused(true)
      // Clear any pending timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = null
      }
    } else {
      // When unhovering, set a timeout to resume highlight effect after 3 seconds
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHoverPaused(false)
      }, 3000)
    }
  }

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

  const handleNodeDragEnd = (node) => {
    // Prevent dragging of central node
    if (node.type === 'central') {
      node.fx = 0
      node.fy = 0
    } else {
      // Validate and ensure node coordinates are valid numbers
      if (typeof node.x !== 'number' || isNaN(node.x) || typeof node.y !== 'number' || isNaN(node.y)) {
        // Reset to center if coordinates are invalid
        node.x = 0
        node.y = 0
      }
      // Release fixed position after dragging so forces can work again
      node.fx = undefined
      node.fy = undefined
    }
    // Refresh the graph to ensure proper rendering
    if (graphRef.current) {
      graphRef.current.refresh()
    }
  }

  const paintNode = (node, ctx) => {
    if (!node.x || !node.y) return // Safety check
    
    // Use calculated size, with fallback defaults
    let baseSize = node.size || 10
    
    // Make highlighted node larger with smooth animation
    // Also apply this style to the selected node
    // BUT if we are hovering over ANY node, de-highlight the highlighted node (unless it is the selected node)
    // User wanted: "when hovering over a node dehilight the hilighted node"
    // And "give it 3 seconds after unhoverning over a node to show the hilighted node again"
    const isActive = (node === highlightedNode && !isHoverPaused) || node === selectedNode;
    
    if (isActive) {
      baseSize = baseSize * 1.3 // Reduced from 1.5
    }
    
    // Hover size - user requested "dont make it bigger"
    const size = baseSize
    
    // Determine colours based on category or node type
    let categoryColor, isUKFlag = false
    
    if (node.type === 'central') {
      // UK flag colors for central node
      categoryColor = '#012169' // UK flag blue
      isUKFlag = true
    } else {
      // Use the randomly assigned color on the node
      categoryColor = node.color || '#00A3E8'
    }
    
    const color = node === hoveredNode ? '#FFFFFF' : categoryColor
    
    // Create glow color with transparency
    const rgb = {
      r: parseInt(categoryColor.slice(1, 3), 16),
      g: parseInt(categoryColor.slice(3, 5), 16),
      b: parseInt(categoryColor.slice(5, 7), 16)
    }
            // User requested "dont have more blur" on hover -> Wait, new request: "when hovering over a node give it a little more glow"
            // So we keep high opacity for hovered node
            const isHovered = node === hoveredNode;
            const glowColorRgba = (isActive || isHovered)
              ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)` 
              : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)` // Reduced glow opacity for regular nodes
            
            // Draw glow effect
            // User requested "reduce the glow increase of the hlighted node"
            // User requested "when hovering over a node give it a little more glow"
            const glowSize = (isActive || isHovered) ? size * 2.5 : size * 2 // Reduced active/hovered glow from 3 to 2.5
            const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowSize)
            
            glowGradient.addColorStop(0, glowColorRgba)
            if (isActive || isHovered) {
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
    
    // Remove the old blue ring selection style
    /* 
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
    */
  }

  const paintLabels = (ctx, globalScale) => {
    // Draw labels for important nodes (central, hovered, selected, highlighted)
    // We draw them in a separate pass to ensure they are always on top
    
    const nodesToLabel = []
    
    // Add central node
    const centralNode = graphData.nodes.find(n => n.type === 'central')
    if (centralNode) nodesToLabel.push(centralNode)
    
    // Add interacted nodes (avoiding duplicates)
    // Hide highlighted node title if a popup is open (selectedNode is set) OR if hovering over any node (isHoverPaused)
    if (highlightedNode && highlightedNode !== centralNode && !selectedNode && !isHoverPaused) nodesToLabel.push(highlightedNode)
    
    if (selectedNode && selectedNode !== centralNode) nodesToLabel.push(selectedNode)
    if (hoveredNode && hoveredNode !== centralNode && hoveredNode !== highlightedNode && hoveredNode !== selectedNode) nodesToLabel.push(hoveredNode)
    
    nodesToLabel.forEach(node => {
      if (!node.x || !node.y) return
      
      // Determine size to calculate offset
      let size = node.size || 10
      if (node.type === 'central') size = 28
      if (node === highlightedNode) size *= 1.5
      if (node === hoveredNode) size *= 1.2
      
      const fontSize = node.type === 'central' ? 10 : 7
      
      // Highlight/Select font size
      const finalFontSize = (node === highlightedNode || node === selectedNode) && node.type !== 'central' ? 7 : fontSize
      
      // Use consistent font with the rest of the site
      ctx.font = `700 ${finalFontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`
      
      // High quality text rendering
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Text position with better spacing (moved closer to node)
      const labelY = node.y - size - 5
      
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
        <div className="graph-header">
          <h2 className="graph-title">Tracking the UK AI story</h2>
          <p className="graph-subtitle">We're making the UK the world's best AI deployment hub</p>
        </div>
        <div className="graph-wrapper">
          {graphData.nodes.length > 0 && dimensions.width > 0 && (
            <ForceGraph2D
              ref={graphRef}
              graphData={graphData}
              width={dimensions.width}
              height={dimensions.height}
              nodeLabel="" // Disable tooltip to prevent double popup
              nodeColor={node => {
                if (node === hoveredNode) return '#FFFFFF'
                if (node.type === 'central') return '#012169'
                return node.color || '#00A3E8'
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
              onNodeHover={handleNodeHover}
              onNodeDrag={handleNodeDrag}
              onNodeDragEnd={handleNodeDragEnd}
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
                  // Configure link force - increased distance for more horizontal spread
                  force.distance(250).strength(0.05)
                }
                if (forceName === 'center') {
                   // Configure center force - reduced to allow more horizontal spread
                   force.strength(0.02)
                }
                // Add vertical compression force to create oval/landscape spread
                if (forceName === 'y-compression') {
                  return d3.forceY().strength(0.25)
                }
                // Add horizontal compression (weaker to allow more spread)
                if (forceName === 'x-compression') {
                  return d3.forceX().strength(0.02)
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
                  graphRef.current.d3Force('y-compression', d3.forceY().strength(0.25))
                  graphRef.current.d3Force('x-compression', d3.forceX().strength(0.02))
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
          <div className="popup-overlay" onClick={() => setSelectedNode(null)}>
            <motion.div
              className="node-details-popup"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the popup itself
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button className="close-button" onClick={() => setSelectedNode(null)}>×</button>
              <div className="popup-header">
                {selectedNode.date && <span className="popup-date">{selectedNode.date}</span>}
              </div>
              <h3>{selectedNode.name}</h3>
              {selectedNode.description && (
                <p className="description">{selectedNode.description}</p>
              )}
            </motion.div>
          </div>
        )}
      </motion.div>
    </section>
  )
}

export default GraphSection

