import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

export default function StressOrb3D({ stressScore = 64.2, status = 'Elevated' }) {
  const mountRef = useRef(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const container = mountRef.current
    if (!container) return

    let animationFrameId
    let renderer, scene, camera, orbMesh, wireMesh, particlePoints

    try {
      const width = container.clientWidth || 280
      const height = container.clientHeight || 280

      // Scene & Camera
      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
      camera.position.z = 5.5

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)

      // Dynamic Colors based on Stress Score
      // Base: Soft Blue / Teal (#3B82F6 / #0D9488) -> Amber/Orange (#F59E0B) for Elevated
      const baseColor = stressScore > 75 
        ? new THREE.Color('#EF4444') 
        : stressScore > 50 
        ? new THREE.Color('#F59E0B') 
        : new THREE.Color('#3B82F6')

      const secondaryColor = new THREE.Color('#0D9488')

      // Main Abstract Sphere
      const orbGeometry = new THREE.IcosahedronGeometry(1.6, 4)
      const orbMaterial = new THREE.MeshPhongMaterial({
        color: baseColor,
        emissive: secondaryColor,
        emissiveIntensity: 0.25,
        wireframe: false,
        transparent: true,
        opacity: 0.75,
        shininess: 80,
        flatShading: true,
      })
      orbMesh = new THREE.Mesh(orbGeometry, orbMaterial)
      scene.add(orbMesh)

      // Outer Wireframe Halo
      const wireGeometry = new THREE.IcosahedronGeometry(1.95, 2)
      const wireMaterial = new THREE.MeshBasicMaterial({
        color: baseColor,
        wireframe: true,
        transparent: true,
        opacity: 0.2,
      })
      wireMesh = new THREE.Mesh(wireGeometry, wireMaterial)
      scene.add(wireMesh)

      // Gentle Particles around Orb
      const particleCount = 45
      const particleGeo = new THREE.BufferGeometry()
      const posArray = new Float32Array(particleCount * 3)

      for (let i = 0; i < particleCount * 3; i += 3) {
        const radius = 2.2 + Math.random() * 0.8
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(Math.random() * 2 - 1)

        posArray[i] = radius * Math.sin(phi) * Math.cos(theta)
        posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta)
        posArray[i + 2] = radius * Math.cos(phi)
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
      const particleMat = new THREE.PointsMaterial({
        size: 0.05,
        color: baseColor,
        transparent: true,
        opacity: 0.6,
      })
      particlePoints = new THREE.Points(particleGeo, particleMat)
      scene.add(particlePoints)

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
      scene.add(ambientLight)

      const pointLight1 = new THREE.PointLight(0x38bdf8, 2, 50)
      pointLight1.position.set(4, 4, 5)
      scene.add(pointLight1)

      const pointLight2 = new THREE.PointLight(0xf59e0b, 1.5, 50)
      pointLight2.position.set(-4, -4, -3)
      scene.add(pointLight2)

      // Mouse Parallax Interaction
      let mouseX = 0
      let mouseY = 0
      let targetX = 0
      let targetY = 0

      const handleMouseMove = (e) => {
        const rect = container.getBoundingClientRect()
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.8
        mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.8
      }

      container.addEventListener('mousemove', handleMouseMove)

      // Animation Loop
      let clock = new THREE.Clock()

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate)
        const elapsedTime = clock.getElapsedTime()

        if (!prefersReducedMotion) {
          // Gentle rotation
          orbMesh.rotation.y = elapsedTime * 0.15
          orbMesh.rotation.x = elapsedTime * 0.08

          wireMesh.rotation.y = -elapsedTime * 0.1
          wireMesh.rotation.z = elapsedTime * 0.05

          particlePoints.rotation.y = elapsedTime * 0.06

          // Smooth mouse parallax
          targetX += (mouseX - targetX) * 0.05
          targetY += (mouseY - targetY) * 0.05

          orbMesh.position.x = targetX * 0.6
          orbMesh.position.y = -targetY * 0.6
          wireMesh.position.x = targetX * 0.4
          wireMesh.position.y = -targetY * 0.4
        }

        renderer.render(scene, camera)
      }

      animate()

      // Resize observer
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width: newW, height: newH } = entry.contentRect
          if (newW > 0 && newH > 0) {
            camera.aspect = newW / newH
            camera.updateProjectionMatrix()
            renderer.setSize(newW, newH)
          }
        }
      })
      resizeObserver.observe(container)

      return () => {
        cancelAnimationFrame(animationFrameId)
        container.removeEventListener('mousemove', handleMouseMove)
        resizeObserver.disconnect()
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
        orbGeometry.dispose()
        orbMaterial.dispose()
        wireGeometry.dispose()
        wireMaterial.dispose()
        particleGeo.dispose()
        particleMat.dispose()
        renderer.dispose()
      }
    } catch (err) {
      console.warn('Three.js initialization fallback:', err)
      setHasError(true)
    }
  }, [stressScore, status])

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500/20 via-amber-500/30 to-teal-500/20 border border-amber-300/40 flex items-center justify-center animate-pulse">
          <span className="text-xs font-bold text-amber-800">Stress Orb (2D)</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full min-h-[220px] flex items-center justify-center select-none">
      <div ref={mountRef} className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-2 text-center pointer-events-none">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 bg-white/70 backdrop-blur-xs px-2 py-0.5 rounded-full border border-slate-200/60">
          Stress Intelligence Orb
        </span>
      </div>
    </div>
  )
}
