import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("stream-theme") || "nord", // default theme
  setTheme: (theme) => {
    localStorage.setItem("stream-theme", theme) // persist theme in localStorage
    set({ theme })
  },
}))