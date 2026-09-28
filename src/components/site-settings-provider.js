'use client'

import {createContext, useContext, useEffect, useState} from 'react'
import FALLBACK_SETTINGS from '@/data/site-settings.json'

const SiteSettingsContext = createContext(FALLBACK_SETTINGS)

function rgbChannels(color, fallback) {
  const match = /^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i.exec(color)
  return match ? match.slice(1).map((channel) => Number.parseInt(channel, 16)).join(', ') : fallback
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}

export default function SiteSettingsProvider({children}) {
  const [settings, setSettings] = useState(FALLBACK_SETTINGS)

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/site-settings', {signal: controller.signal})
      .then((response) => {
        if (!response.ok) throw new Error(`/api/site-settings returned ${response.status}`)
        return response.json()
      })
      .then((nextSettings) => setSettings(nextSettings))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Failed to load site settings', error)
        }
      })

    return () => controller.abort()
  }, [])

  const {colors} = settings
  const style = {
    '--brand-primary': colors.primary,
    '--brand-primary-hover': colors.primaryHover,
    '--brand-primary-rgb': rgbChannels(colors.primary, '13, 61, 43'),
    '--brand-accent': colors.accent,
    '--brand-accent-hover': colors.accentHover,
    '--brand-accent-light': colors.accentLight,
    '--brand-accent-rgb': rgbChannels(colors.accent, '201, 168, 76'),
    '--category-berita': colors.categories.BERITA,
    '--category-kegiatan': colors.categories.KEGIATAN,
    '--category-pengumuman': colors.categories.PENGUMUMAN,
    '--category-sosial': colors.categories.SOSIAL,
  }

  return (
    <SiteSettingsContext.Provider value={settings}>
      <div className="contents" style={style}>{children}</div>
    </SiteSettingsContext.Provider>
  )
}
