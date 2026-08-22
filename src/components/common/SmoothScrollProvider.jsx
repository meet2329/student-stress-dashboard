import React, { useEffect, useRef } from 'react'

/**
 * SmoothScrollProvider
 * Adds a silky, momentum-based smooth vertical scrolling feel.
 * Features:
 * - Momentum interpolation using requestAnimationFrame
 * - Bypasses tables, code blocks, and horizontal scroll zones so they scroll normally
 * - Bypasses open modals, dropdowns, and textareas
 * - Respects prefers-reduced-motion
 * - Zero external dependency footprint
 */

export default function SmoothScrollProvider({ children, containerRef }) {
  const isScrollingRef = useRef(false)
  const targetScrollY = useRef(0)
  const currentScrollY = useRef(0)
  const animFrameId = useRef(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const targetElement = containerRef?.current || window
    const isWindow = targetElement === window

    const getScrollTop = () => {
      if (isWindow) return window.scrollY || document.documentElement.scrollTop
      return targetElement.scrollTop
    }

    const setScrollTop = (val) => {
      if (isWindow) {
        window.scrollTo({ top: val, behavior: 'auto' })
      } else {
        targetElement.scrollTop = val
      }
    }

    const getMaxScroll = () => {
      if (isWindow) {
        return Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      }
      return Math.max(0, targetElement.scrollHeight - targetElement.clientHeight)
    }

    targetScrollY.current = getScrollTop()
    currentScrollY.current = getScrollTop()

    const isInsideExcludedElement = (target) => {
      if (!target || !target.closest) return false
      // Exclude tables, modals, horizontal scroll areas, dropdowns, textareas, inputs
      return !!target.closest(
        '.overflow-x-auto, [data-lenis-prevent], table, select, input, textarea, .custom-scrollbar, [role="dialog"]'
      )
    }

    const onWheel = (e) => {
      // If event comes from an excluded horizontal or modal container, do not intercept
      if (isInsideExcludedElement(e.target)) return

      // Don't intercept if modifier keys are pressed (like Ctrl for zoom)
      if (e.ctrlKey || e.metaKey || e.altKey) return

      const maxScroll = getMaxScroll()
      if (maxScroll <= 0) return

      // Adjust delta
      const delta = e.deltaY
      targetScrollY.current = Math.max(0, Math.min(maxScroll, targetScrollY.current + delta))

      if (!isScrollingRef.current) {
        isScrollingRef.current = true
        renderLoop()
      }
    }

    const renderLoop = () => {
      const diff = targetScrollY.current - currentScrollY.current
      if (Math.abs(diff) < 0.5) {
        currentScrollY.current = targetScrollY.current
        setScrollTop(currentScrollY.current)
        isScrollingRef.current = false
        return
      }

      currentScrollY.current += diff * 0.12
      setScrollTop(currentScrollY.current)
      animFrameId.current = requestAnimationFrame(renderLoop)
    }

    const onNativeScroll = () => {
      if (!isScrollingRef.current) {
        currentScrollY.current = getScrollTop()
        targetScrollY.current = currentScrollY.current
      }
    }

    if (isWindow) {
      window.addEventListener('wheel', onWheel, { passive: true })
      window.addEventListener('scroll', onNativeScroll, { passive: true })
    } else {
      targetElement.addEventListener('wheel', onWheel, { passive: true })
      targetElement.addEventListener('scroll', onNativeScroll, { passive: true })
    }

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current)
      if (isWindow) {
        window.removeEventListener('wheel', onWheel)
        window.removeEventListener('scroll', onNativeScroll)
      } else {
        targetElement.removeEventListener('wheel', onWheel)
        targetElement.removeEventListener('scroll', onNativeScroll)
      }
    }
  }, [containerRef])

  return <>{children}</>
}
