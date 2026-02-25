"use client"

import { useEffect } from "react"

export function ThemeColorApplier() {
  useEffect(() => {
    const apply = () => {
      const color = typeof window !== "undefined" ? localStorage.getItem("theme-primary") : null
      if (color) {
        document.documentElement.style.setProperty("--primary", color)
        document.documentElement.style.setProperty("--ring", color)
        document.body?.style.setProperty("--primary", color)
        document.body?.style.setProperty("--ring", color)
        const adminWrap = document.querySelector("div.admin-light") as HTMLElement | null
        if (adminWrap) {
          adminWrap.style.setProperty("--primary", color)
          adminWrap.style.setProperty("--ring", color)
        }
      }
    }
    apply()
    const onStorage = (e: StorageEvent) => {
      if (e.key === "theme-primary") {
        apply()
      }
    }
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  return null
}
