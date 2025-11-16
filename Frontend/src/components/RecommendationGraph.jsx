import React, { useEffect, useRef } from 'react'

export default function RecommendationGraph({ data }) {
  const containerRef = useRef(null)

  useEffect(() => {
    let networkInstance
    let isMounted = true

    const loadGraph = async () => {
      if (!containerRef.current || !data) return
      const { Network } = await import('vis-network')
      if (!containerRef.current || !isMounted) return

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
          margin: { top: 10, right: 10, bottom: 10, left: 10 },
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
            enabled: true,
            type: 'continuous',
            roundness: 0.4
          }
        },
        interaction: {
          navigationButtons: true,
          keyboard: true,
          zoomView: true
        }
      }

      networkInstance = new Network(containerRef.current, data, options)
    }

    loadGraph()

    return () => {
      isMounted = false
      if (networkInstance) {
        networkInstance.destroy()
      }
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
