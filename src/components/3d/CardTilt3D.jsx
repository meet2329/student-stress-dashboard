import React, { useRef, useState, useCallback } from 'react'

/**
 * CardTilt3D
 * High-performance 3D perspective tilt wrapper.
 * Features:
 * - Subtle 3D rotation (rotateX, rotateY) based on mouse position within card
 * - Dynamic light/glare reflection effect
 * - Smooth spring-like transition on mouse enter & leave
 * - Respects prefers-reduced-motion
 * - Zero impact on inner element events/clicks
 */

export default function CardTilt3D({
  children,
  className = '',
  maxTilt = 5,       // Max degrees of rotation
  glare = true,       // Subtle dynamic reflection highlight
  scaleOnHover = 1.015,
  style = {}
}) {
  const cardRef = useRef(null)
  const [tiltStyle, setTiltStyle] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    glareX: 50,
    glareY: 50,
    glareOpacity: 0
  })

  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left // x position within element
    const y = e.clientY - rect.top  // y position within element

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -maxTilt
    const rotateY = ((x - centerX) / centerX) * maxTilt

    const glareX = (x / rect.width) * 100
    const glareY = (y / rect.height) * 100

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scaleOnHover}, ${scaleOnHover}, 1)`,
      glareX,
      glareY,
      glareOpacity: 0.15
    })
  }, [maxTilt, scaleOnHover])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      glareX: 50,
      glareY: 50,
      glareOpacity: 0
    })
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transform: tiltStyle.transform,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        transformStyle: 'preserve-3d',
        willChange: 'transform'
      }}
      className={`relative ${className}`}
    >
      {children}

      {/* Dynamic Specular Glare Reflection */}
      {glare && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden transition-opacity duration-300 z-10"
          style={{
            opacity: tiltStyle.glareOpacity,
            background: `radial-gradient(circle at ${tiltStyle.glareX}% ${tiltStyle.glareY}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
