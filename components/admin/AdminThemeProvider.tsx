"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme") as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("admin-theme", theme)
      
      // Apply theme class to body to ensure portals (dialogs, popovers) are themed
      const body = document.body
      body.classList.remove("admin-light", "admin-dark")
      body.classList.add(theme === "light" ? "admin-light" : "admin-dark")
    }

    return () => {
      // Clean up body classes when unmounting
      document.body.classList.remove("admin-light", "admin-dark")
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={!mounted ? "admin-dark h-full" : (theme === "light" ? "admin-light" : "admin-dark")}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useAdminTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useAdminTheme must be used within an AdminThemeProvider")
  }
  return context
}
