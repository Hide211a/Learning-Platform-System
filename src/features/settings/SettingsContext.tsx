import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getPlatformSettings, updatePlatformSettings, subscribeToPlatformSettings } from '../../firebase'
import type { PlatformSettings } from '../../firebase'
import { useAuth } from '../auth/AuthContext'

type SettingsContextValue = {
  settings: PlatformSettings | null
  loading: boolean
  error: string | null
  updateSettings: (newSettings: Partial<PlatformSettings>) => Promise<boolean>
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Завантаження налаштувань при ініціалізації
  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await getPlatformSettings()
      if (result.success && result.data) {
        setSettings(result.data)
        console.log('✅ Налаштування завантажено в контекст')
      } else {
        setError(result.error || 'Помилка завантаження налаштувань')
      }
    } catch (err) {
      setError('Помилка завантаження налаштувань')
      console.error('❌ Помилка завантаження налаштувань:', err)
    } finally {
      setLoading(false)
    }
  }

  // Оновлення налаштувань
  const updateSettings = async (newSettings: Partial<PlatformSettings>): Promise<boolean> => {
    if (!user) {
      setError('Користувач не авторизований')
      return false
    }

    try {
      setError(null)
      
      const result = await updatePlatformSettings(newSettings, user.uid)
      if (result.success) {
        // Оновлюємо локальний стан
        if (settings) {
          setSettings({
            ...settings,
            ...newSettings,
            updatedAt: new Date(),
            updatedBy: user.uid
          })
        }
        console.log('✅ Налаштування оновлено')
        return true
      } else {
        setError(result.error || 'Помилка оновлення налаштувань')
        return false
      }
    } catch (err) {
      setError('Помилка оновлення налаштувань')
      console.error('❌ Помилка оновлення налаштувань:', err)
      return false
    }
  }

  // Оновлення налаштувань
  const refreshSettings = async () => {
    await loadSettings()
  }

  // Підписка на зміни налаштувань
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const setupSubscription = () => {
      unsubscribe = subscribeToPlatformSettings((newSettings) => {
        setSettings(newSettings)
        console.log('🔄 Налаштування оновлено через підписку')
      })
    }

    // Спочатку завантажуємо налаштування
    loadSettings().then(() => {
      // Потім налаштовуємо підписку
      setupSubscription()
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const value: SettingsContextValue = {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
