import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * UploadZone3DEffect
 * A lightweight 3D rotating holographic data crystal for the CSV drop zone.
 * Features:
 * - Rotating dual-wireframe octahedron with inner pulsing core
 * - Dynamic color reaction on dragOver
 * - Full cleanup on unmount
 */

export default function UploadZone3DEffect({ isDragOver = false, size = 64 }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // WebGL Check
    try {
      const testCanvas = document.createElement('canvas')
      const isSupported = !!(window.WebGLRenderingContext && 
        (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')))
      if (!isSupported) return
    } catch {
      return
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.z = 5.2

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      })
    } catch {
      return
    }

    renderer.setSize(size, size)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Outer Octahedron (Data Crystal)
    const outerGeo = new THREE.OctahedronGeometry(1.6, 0)
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x3B82F6,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    })
    const outerMesh = new THREE.Mesh(outerGeo, outerMat)
    scene.add(outerMesh)

    // Inner Icosahedron Core
    const innerGeo = new THREE.IcosahedronGeometry(0.85, 0)
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x10B981,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    })
    const innerMesh = new THREE.Mesh(innerGeo, innerMat)
    scene.add(innerMesh)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLight)

    let animationFrameId
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      const speed = isDragOver ? 2.5 : 1.0

      outerMesh.rotation.x = t * 0.4 * speed
      outerMesh.rotation.y = t * 0.6 * speed

      innerMesh.rotation.x = -t * 0.5 * speed
      innerMesh.rotation.z = t * 0.7 * speed

      // Subtle scale pulse
      const scale = 1 + Math.sin(t * 2 * speed) * 0.05
      outerMesh.scale.set(scale, scale, scale)

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      outerGeo.dispose()
      outerMat.dispose()
      innerGeo.dispose()
      innerMat.dispose()
      renderer.dispose()
    }
  }, [size, isDragOver])

  return (
    <div
      ref={mountRef}
      className="pointer-events-none flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  )
}
