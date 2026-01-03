"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content: string
  className?: string
  delay?: number
}

export function Tooltip({ children, content, className, delay = 0.2 }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 8
      })
    }
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  return (
    <div 
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.1, delay }}
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              transform: 'translateX(-50%) translateY(-100%)',
              zIndex: 9999,
              pointerEvents: 'none'
            }}
            className={cn(
              "px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-100 text-[10px] font-bold uppercase tracking-widest rounded shadow-xl whitespace-nowrap",
              className
            )}
          >
            {content}
            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 border-r border-b border-zinc-800 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
