import { useEffect, useRef } from 'react'

export default function WarpTunnel({ className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined

    let animationFrame = 0
    let width = 0
    let height = 0
    let last = 0
    const stars = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      stars.length = 0
      const count = Math.round(Math.min(220, Math.max(90, (width * height) / 8000)))
      for (let index = 0; index < count; index += 1) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random(),
          length: 80 + Math.random() * 220,
        })
      }
    }

    const draw = (now) => {
      const delta = last ? Math.min(0.05, (now - last) / 1000) : 0.016
      last = now
      context.clearRect(0, 0, width, height)
      const centerX = width * 0.5
      const centerY = height * 0.5
      context.lineCap = 'round'

      stars.forEach((star) => {
        star.z += delta * (0.42 + star.z * 0.42)
        if (star.z > 1) {
          star.z = 0.04
          star.x = centerX + (Math.random() - 0.5) * width * 0.8
          star.y = centerY + (Math.random() - 0.5) * height * 0.8
        }
        const dx = star.x - centerX
        const dy = star.y - centerY
        const scale = 1 + star.z * 2.5
        const x1 = star.x + dx * star.z * 0.55
        const y1 = star.y + dy * star.z * 0.55
        const x2 = x1 + (dx * 0.015 * star.length) / scale
        const y2 = y1 + (dy * 0.015 * star.length) / scale
        const alpha = Math.min(1, star.z * 1.5) * (1 - Math.max(0, star.z - 0.7) / 0.3)
        context.globalAlpha = alpha
        context.strokeStyle = star.z > 0.65 ? 'rgb(125,225,255)' : 'rgb(255,255,255)'
        context.lineWidth = star.z > 0.65 ? 1.6 : 1
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
      })
      context.globalAlpha = 1
      animationFrame = requestAnimationFrame(draw)
    }

    resize()
    animationFrame = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} aria-hidden className={className} />
}
