import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * DataUniverseBackground
 * A high-performance, non-intrusive 3D "Data Universe" background.
 * Features:
 * - Low-poly connected data constellation (nodes & filaments)
 * - Subtle floating geometric data crystals
 * - Ambient particle starfield with smooth orbital drift
 * - Mouse parallax with smooth damping (lerp)
 * - WebGL availability detection + CSS gradient fallback
 * - prefers-reduced-motion compliance
 * - Dynamic mobile throttling (reduced particle count)
 * - Full memory/GPU cleanup on unmount
 * - Strictly pointer-events-none so it never blocks any UI interaction
 */

export default function DataUniverseBackground({ 
  variant = 'dark', // 'dark' | 'light' | 'ambient'
  particleMultiplier = 1,
  className = ''
}) {
  const mountRef = useRef(null)
  const [webGlSupported, setWebGlSupported] = useState(true)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // 0. Check WebGL Support
    try {
      const testCanvas = document.createElement('canvas')
      const isSupported = !!(window.WebGLRenderingContext && 
        (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')))
      if (!isSupported) {
        setWebGlSupported(false)
        return
      }
    } catch {
      setWebGlSupported(false)
      return
    }

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.innerWidth < 768

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene()
    
    // Scene colors based on variant
    const isDark = variant === 'dark'
    const fogColor = isDark ? 0x090D16 : 0xF8FAFC
    const fogDensity = isDark ? 0.028 : 0.035
    scene.fog = new THREE.FogExp2(fogColor, fogDensity)

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.z = 24

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        alpha: true,
        powerPreference: 'high-performance'
      })
    } catch {
      setWebGlSupported(false)
      return
    }

    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2))
    container.appendChild(renderer.domElement)

    // 2. Data Node Network (Constellation of Connected Nodes)
    const baseNodeCount = isMobile ? 35 : Math.floor(70 * particleMultiplier)
    const nodeGeometry = new THREE.BufferGeometry()
    const nodePositions = new Float32Array(baseNodeCount * 3)
    const nodeVelocities = []

    const spreadX = isMobile ? 22 : 36
    const spreadY = isMobile ? 18 : 28
    const spreadZ = 16

    for (let i = 0; i < baseNodeCount; i++) {
      const x = (Math.random() - 0.5) * spreadX
      const y = (Math.random() - 0.5) * spreadY
      const z = (Math.random() - 0.5) * spreadZ
      nodePositions[i * 3] = x
      nodePositions[i * 3 + 1] = y
      nodePositions[i * 3 + 2] = z

      nodeVelocities.push({
        x: (Math.random() - 0.5) * 0.012,
        y: (Math.random() - 0.5) * 0.012,
        z: (Math.random() - 0.5) * 0.008
      })
    }

    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3))

    // Node Points Material
    const nodeMaterial = new THREE.PointsMaterial({
      color: isDark ? 0x38BDF8 : 0x0284C7,
      size: isMobile ? 0.35 : 0.45,
      transparent: true,
      opacity: isDark ? 0.85 : 0.65,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending
    })
    const nodePoints = new THREE.Points(nodeGeometry, nodeMaterial)
    scene.add(nodePoints)

    // Dynamic Connecting Lines (Filaments)
    const maxConnections = isMobile ? 60 : 130
    const linePositions = new Float32Array(maxConnections * 6)
    const lineColors = new Float32Array(maxConnections * 6)
    const lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3))

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.35 : 0.25,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending
    })
    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial)
    scene.add(linesMesh)

    // 3. Floating Geometric Data Prisms (Low-Poly Octahedrons & Icosahedrons)
    const crystalGroup = new THREE.Group()
    const crystalCount = isMobile ? 3 : 6
    const crystals = []

    const crystalGeos = [
      new THREE.OctahedronGeometry(1.2, 0),
      new THREE.IcosahedronGeometry(1.0, 0),
      new THREE.TetrahedronGeometry(1.1, 0)
    ]

    for (let i = 0; i < crystalCount; i++) {
      const geo = crystalGeos[i % crystalGeos.length]
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? (isDark ? 0x06B6D4 : 0x0284C7) : (isDark ? 0x10B981 : 0x0D9488),
        wireframe: true,
        transparent: true,
        opacity: isDark ? 0.35 : 0.22
      })
      const mesh = new THREE.Mesh(geo, mat)
      
      const px = (Math.random() - 0.5) * (spreadX * 0.8)
      const py = (Math.random() - 0.5) * (spreadY * 0.8)
      const pz = (Math.random() - 0.5) * spreadZ - 4
      mesh.position.set(px, py, pz)

      mesh.rotation.x = Math.random() * Math.PI
      mesh.rotation.y = Math.random() * Math.PI

      crystals.push({
        mesh,
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        initialY: py,
        floatSpeed: 0.8 + Math.random() * 0.6
      })
      crystalGroup.add(mesh)
    }
    scene.add(crystalGroup)

    // 4. Ambient Distant Particle Field (160 particles)
    const starCount = isMobile ? 70 : 160
    const starGeometry = new THREE.BufferGeometry()
    const starPositions = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 60
      starPositions[i + 1] = (Math.random() - 0.5) * 50
      starPositions[i + 2] = (Math.random() - 0.5) * 40 - 5
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starMaterial = new THREE.PointsMaterial({
      color: isDark ? 0x94A3B8 : 0x64748B,
      size: 0.2,
      transparent: true,
      opacity: isDark ? 0.4 : 0.25
    })
    const starField = new THREE.Points(starGeometry, starMaterial)
    scene.add(starField)

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.6 : 0.9)
    scene.add(ambientLight)

    // 6. Smooth Mouse Interaction (Parallax)
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      mouseX = (clientX / innerWidth - 0.5) * 2
      mouseY = (clientY / innerHeight - 0.5) * 2
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    // 7. Render Loop with High Performance & Proper Cleanup
    let animationFrameId
    const clock = new THREE.Clock()
    const connectionDistance = isMobile ? 4.5 : 5.8

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Mouse parallax lerp
      targetX += (mouseX - targetX) * 0.035
      targetY += (mouseY - targetY) * 0.035

      if (!prefersReducedMotion) {
        // Camera smooth movement
        camera.position.x = targetX * 1.8
        camera.position.y = -targetY * 1.5
        camera.lookAt(0, 0, 0)

        // Rotate scene gently
        scene.rotation.y = elapsedTime * 0.015
        scene.rotation.x = Math.sin(elapsedTime * 0.02) * 0.03

        // Animate crystals
        crystals.forEach((c, idx) => {
          c.mesh.rotation.x += c.rotSpeedX
          c.mesh.rotation.y += c.rotSpeedY
          c.mesh.position.y = c.initialY + Math.sin(elapsedTime * c.floatSpeed + idx) * 0.6
        })

        // Update node positions and compute connections
        const positions = nodePoints.geometry.attributes.position.array
        let lineIdx = 0
        const linePos = linesMesh.geometry.attributes.position.array

        for (let i = 0; i < baseNodeCount; i++) {
          const i3 = i * 3
          positions[i3] += nodeVelocities[i].x
          positions[i3 + 1] += nodeVelocities[i].y
          positions[i3 + 2] += nodeVelocities[i].z

          // Bounce boundaries
          if (Math.abs(positions[i3]) > spreadX / 2) nodeVelocities[i].x *= -1
          if (Math.abs(positions[i3 + 1]) > spreadY / 2) nodeVelocities[i].y *= -1
          if (Math.abs(positions[i3 + 2]) > spreadZ / 2) nodeVelocities[i].z *= -1

          // Find nearby nodes to connect with lines
          for (let j = i + 1; j < baseNodeCount; j++) {
            if (lineIdx >= maxConnections * 6) break
            const j3 = j * 3
            const dx = positions[i3] - positions[j3]
            const dy = positions[i3 + 1] - positions[j3 + 1]
            const dz = positions[i3 + 2] - positions[j3 + 2]
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

            if (dist < connectionDistance) {
              linePos[lineIdx++] = positions[i3]
              linePos[lineIdx++] = positions[i3 + 1]
              linePos[lineIdx++] = positions[i3 + 2]

              linePos[lineIdx++] = positions[j3]
              linePos[lineIdx++] = positions[j3 + 1]
              linePos[lineIdx++] = positions[j3 + 2]
            }
          }
        }

        // Fill remaining line vertices with 0 to hide them
        for (let k = lineIdx; k < maxConnections * 6; k++) {
          linePos[k] = 0
        }

        nodePoints.geometry.attributes.position.needsUpdate = true
        linesMesh.geometry.attributes.position.needsUpdate = true
      }

      renderer.render(scene, camera)
    }

    animate()

    // 8. Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    // 9. Comprehensive Teardown / Memory Disposal
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }

      // Dispose geometries
      nodeGeometry.dispose()
      lineGeometry.dispose()
      starGeometry.dispose()
      crystalGeos.forEach(g => g.dispose())

      // Dispose materials
      nodeMaterial.dispose()
      lineMaterial.dispose()
      starMaterial.dispose()
      crystals.forEach(c => c.mesh.material.dispose())

      // Dispose renderer
      renderer.dispose()
    }
  }, [variant, particleMultiplier])

  // Graceful CSS Fallback when WebGL is unavailable
  if (!webGlSupported) {
    return (
      <div 
        className={`absolute inset-0 w-full h-full pointer-events-none z-0 bg-radial from-blue-900/10 via-transparent to-transparent ${className}`}
      />
    )
  }

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    />
  )
}
