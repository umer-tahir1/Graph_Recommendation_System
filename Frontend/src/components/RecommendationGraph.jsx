import React, { useEffect, useRef } from 'react'
import { Network } from 'vis-network'

export default function RecommendationGraph({ data }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !data) return

    const options = {
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
      interaction: {
        navigationButtons: true,
        keyboard: true,
        zoomView: true
      }
    }

    const network = new Network(containerRef.current, data, options)

    return () => {
      network.destroy()
    }
  }, [data])

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
