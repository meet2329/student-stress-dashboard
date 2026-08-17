import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Auth3DCanvas() {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // 1. Scene Setup
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x060913, 0.035)

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 22

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // 2. 3D Floating Geometries (Serene Metric Atmosphere)
    // Main Torus Knot
    const knotGeometry = new THREE.TorusKnotGeometry(4.2, 1.1, 120, 24, 2, 3)
    const knotMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0EA5E9,
      emissive: 0x0284C7,
      emissiveIntensity: 0.25,
      roughness: 0.2,
      metalness: 0.8,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      wireframe: true,
      transparent: true,
      opacity: 0.65
    })
    const knotMesh = new THREE.Mesh(knotGeometry, knotMaterial)
    scene.add(knotMesh)

    // Inner Glowing Core Sphere
    const coreGeometry = new THREE.IcosahedronGeometry(2.5, 3)
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x10B981,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    })
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial)
    scene.add(coreMesh)

    // Outer Floating Particle Cloud (300 nodes)
    const particleCount = 280
    const particleGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    const colorTeal = new THREE.Color(0x10B981)
    const colorBlue = new THREE.Color(0x3B82F6)
    const colorCyan = new THREE.Color(0x06B6D4)

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 45
      positions[i + 1] = (Math.random() - 0.5) * 45
      positions[i + 2] = (Math.random() - 0.5) * 35

      const chosenColor = Math.random() > 0.6 ? colorTeal : Math.random() > 0.3 ? colorBlue : colorCyan
      colors[i] = chosenColor.r
      colors[i + 1] = chosenColor.g
      colors[i + 2] = chosenColor.b
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.75
    })
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particleSystem)

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0x0ea5e9, 2.5, 50)
    pointLight1.position.set(10, 15, 12)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x10b981, 2.0, 50)
    pointLight2.position.set(-12, -10, 10)
    scene.add(pointLight2)

    // 4. Mouse Interactivity / Parallax
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

    // 5. Animation Loop
    let animationFrameId
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      targetX += (mouseX - targetX) * 0.04
      targetY += (mouseY - targetY) * 0.04

      // Rotate Main Mesh
      knotMesh.rotation.x = elapsedTime * 0.25 + targetY * 0.5
      knotMesh.rotation.y = elapsedTime * 0.35 + targetX * 0.5

      // Rotate Core Sphere
      coreMesh.rotation.x = -elapsedTime * 0.15
      coreMesh.rotation.y = -elapsedTime * 0.25

      // Orbit particles gently
      particleSystem.rotation.y = elapsedTime * 0.05
      particleSystem.rotation.x = elapsedTime * 0.02

      camera.position.x += (targetX * 2 - camera.position.x) * 0.05
      camera.position.y += (-targetY * 2 - camera.position.y) * 0.05
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }

    animate()

    // 6. Resize Handling
    const handleResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      knotGeometry.dispose()
      knotMaterial.dispose()
      coreGeometry.dispose()
      coreMaterial.dispose()
      particleGeometry.dispose()
      particleMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  )
}
