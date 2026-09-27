import { useEffect, useRef, useState } from 'react'

export default function Reveal({ children, delay = 0, className = '', repeat = false }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return undefined
    }
    const element = ref.current
    if (!element) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (repeat) setVisible(entry.isIntersecting)
        else if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(element)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [repeat])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 560ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 560ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}>
      {children}
    </div>
  )
}
