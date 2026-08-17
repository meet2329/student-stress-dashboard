import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export default function StressGauge({ 
  value = 64.2, 
  max = 100, 
  status = 'Elevated',
  normalized5 = 3.42 
}) {
  const scoreRef = useRef(null)
  const arcRef = useRef(null)
  const [displayVal, setDisplayVal] = useState(0)

  // Gauge Geometry constants
  const size = 220
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const center = size / 2

  // Gauge spans 240 degrees (from 150deg to 390deg)
  const startAngle = 150
  const endAngle = 390
  const totalAngle = endAngle - startAngle // 240 deg

  const arcLength = (totalAngle / 360) * (2 * Math.PI * radius)

  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setDisplayVal(value)
      if (arcRef.current) {
        const targetOffset = arcLength * (1 - value / max)
        arcRef.current.style.strokeDashoffset = targetOffset
      }
      return
    }

    const obj = { val: 0 }
    const targetOffset = arcLength * (1 - value / max)

    const ctx = gsap.context(() => {
      // 1. Animate numeric counter
      gsap.to(obj, {
        val: value,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: () => {
          setDisplayVal(obj.val)
        }
      })

      // 2. Animate SVG stroke dashoffset
      if (arcRef.current) {
        gsap.fromTo(
          arcRef.current,
          { strokeDashoffset: arcLength },
          {
            strokeDashoffset: targetOffset,
            duration: 1.8,
            ease: 'power2.out'
          }
        )
      }
    })

    return () => ctx.revert()
  }, [value, max, arcLength])

  // Convert polar coordinates to Cartesian
  const polarToCartesian = (cx, cy, r, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    }
  }

  const describeArc = (x, y, r, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, r, endAngle)
    const end = polarToCartesian(x, y, r, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
    return [
      'M', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ')
  }

  const backgroundArcPath = describeArc(center, center, radius, startAngle, endAngle)

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      {/* SVG Arc Gauge */}
      <div className="relative w-[220px] h-[180px] flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible -rotate-90 origin-center"
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="90%" stopColor="#EF4444" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d={backgroundArcPath}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Animated Value Arc */}
          <path
            ref={arcRef}
            d={backgroundArcPath}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={arcLength}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Display Value */}
        <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Average Stress
          </p>
          <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
            <span ref={scoreRef} className="text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {displayVal.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-slate-400">/100</span>
          </div>
          <p className="text-xs font-mono font-semibold text-slate-500 mt-0.5">
            ({normalized5} / 5.0 scale)
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-[-8px] flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          Stress State: {status}
        </span>
      </div>
    </div>
  )
}
