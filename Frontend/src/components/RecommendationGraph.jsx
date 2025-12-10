// React imports
import React, { useEffect, useRef } from 'react'
// Visualization library for network graphs
import { Network } from 'vis-network'

// RecommendationGraph component - visualizes user-product relationships using a network graph
// Props: data (graph nodes and edges structure)
export default function RecommendationGraph({ data }) {
  // Reference to the container DOM element for the graph
  const containerRef = useRef(null)

  // Initialize and manage the network visualization
  useEffect(() => {
    // Exit if container or data is not available
    if (!containerRef.current || !data) return

    // Configure network visualization options
      // Physics engine configuration for automatic node layout
      physics: {
        enabled: true,
        stabilization: {
          iterations: 200
        },
        barnesHut: {
          gravitationalConstant: -5000,
          centralGravity: 0.3,
          springLength: 200,
          springConstant: 0.04
        }
      },
      // Node appearance and behavior settings
      nodes: {
        font: {
          size: 14,
          face: 'Tahoma'
        },
        margin: 10,
        widthConstraint: {
          maximum: 150
        }
      },
      // Edge (connection) appearance settings
      edges: {
        width: 2,
        font: {
          size: 12,
          align: 'middle'
        },
        arrows: {
          to: { enabled: true, scaleFactor: 0.5 }
        },
        smooth: {
          type: 'continuous'
        }
      },
      // User interaction settings
      interaction: {
        navigationButtons: true,
        keyboard: true,
        zoomView: true
      }
    }

    // Create network visualization with data and options
    const network = new Network(containerRef.current, data, options)

    // Cleanup function to destroy network when component unmounts
    return () => {
      network.destroy()
    }
  }, [data])

  // Render container div for the network visualization
  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '500px',
        border: '2px solid #e5e7eb',
        borderRadius: '0.5rem',
        backgroundColor: '#f9fafb'
      }}
    />
  )
}
