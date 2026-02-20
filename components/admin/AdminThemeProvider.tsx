"use client"

import React, { createContext, useContext, useEffect } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const body = document.body
    body.classList.remove("admin-dark")
    body.classList.add("admin-light")
    return () => {
      document.body.classList.remove("admin-light", "admin-dark")
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: "light", toggleTheme: () => {} }}>
      <div className="admin-light h-full">
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
