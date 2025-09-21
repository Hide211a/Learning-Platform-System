import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth()

  // Показуємо завантаження поки перевіряємо
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Перевірка прав доступу...</p>
        </div>
      </div>
    )
  }

  // Якщо користувач не авторизований - редирект на авторизацію
  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // Якщо користувач не адмін - показуємо повідомлення
  if (user.email !== 'siidechaiin@gmail.com') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Доступ заборонено</h2>
          <p className="text-gray-600 mb-6">
            У вас немає прав доступу до адмін панелі. 
            Зверніться до адміністратора для отримання доступу.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Повернутися назад
          </button>
        </div>
      </div>
    )
  }

  // Якщо адмін - показуємо контент
  return <>{children}</>
}
