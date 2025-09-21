import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { isUserAdmin } from '../firebase'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false)
        setChecking(false)
        return
      }

      try {
        const adminStatus = await isUserAdmin(user.uid)
        setIsAdmin(adminStatus)
        console.log('🔐 Перевірка адмін статусу:', user.email, 'Адмін:', adminStatus)
      } catch (error) {
        console.error('❌ Помилка перевірки адмін статусу:', error)
        setIsAdmin(false)
      } finally {
        setChecking(false)
      }
    }

    checkAdminStatus()
  }, [user])

  // Показуємо завантаження поки перевіряємо
  if (loading || checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Перевірка прав доступу...</p>
        </div>
      </div>
    )
  }

  // Якщо користувач не авторизований або не адмін - редирект
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />
  }

  // Якщо адмін - показуємо контент
  return <>{children}</>
}
