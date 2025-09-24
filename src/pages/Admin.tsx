import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '../lib/contentful'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useProgress } from '../features/progress/ProgressContext'
import { useAuth } from '../features/auth/AuthContext'
import { useSettings } from '../features/settings/SettingsContext'
import { Navigate } from 'react-router-dom'
import { getAllUsers, getUserProfile, getUserProgress } from '../firebase'
import type { PlatformSettings } from '../firebase'

// Компонент форми налаштувань
function SettingsForm({ 
  settings, 
  onUpdate 
}: { 
  settings: PlatformSettings
  onUpdate: (settings: Partial<PlatformSettings>) => Promise<boolean>
}) {
  const [formData, setFormData] = useState({
    platformName: settings.platformName,
    supportEmail: settings.supportEmail,
    features: { ...settings.features },
    limits: { ...settings.limits },
    security: { ...settings.security }
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    
    try {
      const success = await onUpdate(formData)
      if (success) {
        setMessage({ type: 'success', text: 'Налаштування успішно збережено!' })
      } else {
        setMessage({ type: 'error', text: 'Помилка збереження налаштувань' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Помилка збереження налаштувань' })
    } finally {
      setSaving(false)
    }
  }

  const handleFeatureChange = (feature: keyof typeof settings.features, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: value
      }
    }))
  }

  const handleLimitChange = (limit: keyof typeof settings.limits, value: number) => {
    setFormData(prev => ({
      ...prev,
      limits: {
        ...prev.limits,
        [limit]: value
      }
    }))
  }

  const handleSecurityChange = (setting: keyof typeof settings.security, value: boolean | number) => {
    setFormData(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [setting]: value
      }
    }))
  }

  return (
    <div className="space-y-8">
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Основні налаштування */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Основні налаштування</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Назва платформи
            </label>
            <Input 
              value={formData.platformName}
              onChange={(e) => setFormData(prev => ({ ...prev, platformName: e.target.value }))}
              placeholder="Введіть назву платформи"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email підтримки
            </label>
            <Input 
              value={formData.supportEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, supportEmail: e.target.value }))}
              placeholder="support@example.com"
              type="email"
            />
          </div>
        </div>
      </div>

      {/* Функції */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Функції платформи</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(formData.features).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">
                  {key === 'quizzes' && 'Квізи'}
                  {key === 'ratings' && 'Рейтинги'}
                  {key === 'comments' && 'Коментарі'}
                  {key === 'analytics' && 'Аналітика'}
                </div>
                <div className="text-sm text-gray-500">
                  {key === 'quizzes' && 'Дозволити проходження квізів'}
                  {key === 'ratings' && 'Дозволити оцінювання курсів'}
                  {key === 'comments' && 'Дозволити коментарі'}
                  {key === 'analytics' && 'Показувати аналітику'}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleFeatureChange(key as keyof typeof settings.features, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Ліміти */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Ліміти системи</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Максимум курсів
            </label>
            <Input 
              type="number"
              value={formData.limits.maxCourses}
              onChange={(e) => handleLimitChange('maxCourses', parseInt(e.target.value) || 0)}
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Максимум користувачів
            </label>
            <Input 
              type="number"
              value={formData.limits.maxUsers}
              onChange={(e) => handleLimitChange('maxUsers', parseInt(e.target.value) || 0)}
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Максимум уроків на курс
            </label>
            <Input 
              type="number"
              value={formData.limits.maxLessonsPerCourse}
              onChange={(e) => handleLimitChange('maxLessonsPerCourse', parseInt(e.target.value) || 0)}
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Безпека */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Налаштування безпеки</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Мінімальний рейтинг для доступу
            </label>
            <Input 
              type="number"
              value={formData.security.minRatingForAccess}
              onChange={(e) => handleSecurityChange('minRatingForAccess', parseInt(e.target.value) || 0)}
              min="0"
              max="5"
            />
            <p className="text-sm text-gray-500 mt-1">
              Користувачі з рейтингом нижче цього значення не зможуть отримати доступ до платформи
            </p>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Верифікація email</div>
              <div className="text-sm text-gray-500">Вимагати підтвердження email при реєстрації</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.security.requireEmailVerification}
                onChange={(e) => handleSecurityChange('requireEmailVerification', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Гостовий доступ</div>
              <div className="text-sm text-gray-500">Дозволити доступ без реєстрації</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.security.allowGuestAccess}
                onChange={(e) => handleSecurityChange('allowGuestAccess', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Кнопка збереження */}
      <div className="flex justify-end pt-6 border-t">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-black hover:bg-gray-800 text-white px-8"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Збереження...
            </>
          ) : (
            'Зберегти налаштування'
          )}
        </Button>
      </div>
    </div>
  )
}

export function Admin() {
  const { user, loading } = useAuth()
  const { settings, updateSettings, loading: settingsLoading } = useSettings()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [firebaseUsers, setFirebaseUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [analyticsPeriod, setAnalyticsPeriod] = useState('week')
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Додаткова перевірка адміна (на всякий випадок)
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

  if (!user || user.email !== 'siidechaiin@gmail.com') {
    return <Navigate to="/" replace />
  }

  // Отримуємо курси з Contentful
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses
  })
  
  // Отримуємо дані з ProgressContext
  const { 
    totalLessonsCompleted, 
    totalQuizzesCompleted,
    getCompletedStudentsCount,
    getCourseRating
  } = useProgress()

  // Розрахунок реальних статистик
  const stats = {
    totalUsers: calculateTotalUsers(),
    totalCourses: courses.length,
    totalActivity: calculateTotalActivity(),
    activeUsers: calculateActiveUsers()
  }

  // Функція для підрахунку загальної кількості користувачів
  function calculateTotalUsers() {
    try {
      const allKeys = Object.keys(localStorage)
      const userKeys = allKeys.filter(key => 
        key.startsWith('userProfile_') || 
        key.startsWith('progress_') ||
        key.startsWith('quizResults_')
      )
      
      const userIds = new Set()
      userKeys.forEach(key => {
        if (key.startsWith('userProfile_')) {
          const userId = key.replace('userProfile_', '')
          userIds.add(userId)
        } else if (key.startsWith('progress_')) {
          const userId = key.replace('progress_', '')
          userIds.add(userId)
        } else if (key.startsWith('quizResults_')) {
          const userId = key.replace('quizResults_', '')
          userIds.add(userId)
        }
      })
      
      return userIds.size
    } catch (error) {
      console.error('Error calculating total users:', error)
      return 0
    }
  }

  // Функція для підрахунку загальної активності
  function calculateTotalActivity() {
    // Загальна активність = уроки + квізи + завершені курси
    return totalLessonsCompleted + totalQuizzesCompleted + calculateCompletedCourses()
  }

  // Функція для підрахунку завершених курсів
  function calculateCompletedCourses() {
    try {
      const allKeys = Object.keys(localStorage)
      const progressKeys = allKeys.filter(key => key.startsWith('progress_'))
      
      let completedCourses = 0
      progressKeys.forEach(key => {
        try {
          const progressData = JSON.parse(localStorage.getItem(key) || '{}')
          Object.values(progressData).forEach((p: any) => {
            if (p.isCompleted) {
              completedCourses++
            }
          })
        } catch (error) {
          console.error('Error parsing progress data:', error)
        }
      })
      
      return completedCourses
    } catch (error) {
      console.error('Error calculating completed courses:', error)
      return 0
    }
  }

  // Функція для підрахунку активних користувачів (за останні 7 днів)
  function calculateActiveUsers() {
    try {
      const allKeys = Object.keys(localStorage)
      const progressKeys = allKeys.filter(key => key.startsWith('progress_'))
      
      const activeUserIds = new Set()
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      progressKeys.forEach(key => {
        try {
          const progressData = JSON.parse(localStorage.getItem(key) || '{}')
          Object.values(progressData).forEach((p: any) => {
            if (p.completedAt) {
              const completedDate = new Date(p.completedAt)
              if (completedDate >= sevenDaysAgo) {
                const userId = key.replace('progress_', '')
                activeUserIds.add(userId)
              }
            }
          })
        } catch (error) {
          console.error('Error parsing progress data:', error)
        }
      })
      
      return activeUserIds.size
    } catch (error) {
      console.error('Error calculating active users:', error)
      return 0
    }
  }

  // Завантаження користувачів з Firebase
  const loadFirebaseUsers = async () => {
    setUsersLoading(true)
    try {
      const result = await getAllUsers()
      if (result.success) {
        setFirebaseUsers(result.data || [])
        console.log('✅ Користувачі завантажено з Firebase:', result.data?.length)
      } else {
        console.error('❌ Помилка завантаження користувачів:', result.error)
      }
    } catch (error) {
      console.error('❌ Помилка завантаження користувачів:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  // Завантажуємо користувачів при ініціалізації та при відкритті табу
  useEffect(() => {
    loadFirebaseUsers()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') {
      loadFirebaseUsers()
    }
  }, [activeTab])

  // Функція для отримання списку користувачів
  function getUserList() {
    try {
      const allKeys = Object.keys(localStorage)
      const userKeys = allKeys.filter(key => 
        key.startsWith('userProfile_') || 
        key.startsWith('progress_') ||
        key.startsWith('quizResults_')
      )
      
      const users = new Map()
      
      // Збираємо дані користувачів
      userKeys.forEach(key => {
        let userId = ''
        if (key.startsWith('userProfile_')) {
          userId = key.replace('userProfile_', '')
        } else if (key.startsWith('progress_')) {
          userId = key.replace('progress_', '')
        } else if (key.startsWith('quizResults_')) {
          userId = key.replace('quizResults_', '')
        }
        
        if (userId && !users.has(userId)) {
          users.set(userId, {
            id: userId,
            name: '',
            email: '',
            lessonsCompleted: 0,
            quizzesCompleted: 0,
            lastActive: 'Невідомо',
            coursesStarted: 0,
            coursesCompleted: 0,
            totalActivity: 0
          })
        }
      })
      
      // Заповнюємо дані користувачів
      userKeys.forEach(key => {
        let userId = ''
        if (key.startsWith('userProfile_')) {
          userId = key.replace('userProfile_', '')
          try {
            const profileData = JSON.parse(localStorage.getItem(key) || '{}')
            if (users.has(userId)) {
              const user = users.get(userId)
              user.name = profileData.displayName || 'Анонімний користувач'
              user.email = profileData.email || 'Невідомо'
              users.set(userId, user)
            }
          } catch (error) {
            console.error('Error parsing profile data:', error)
          }
        } else if (key.startsWith('progress_')) {
          userId = key.replace('progress_', '')
          try {
            const progressData = JSON.parse(localStorage.getItem(key) || '{}')
            if (users.has(userId)) {
              const user = users.get(userId)
              let lessonsCompleted = 0
              let quizzesCompleted = 0
              let lastActive = new Date(0)
              let coursesStarted = 0
              let coursesCompleted = 0
              
              Object.values(progressData).forEach((p: any) => {
                if (p.completedAt) {
                  if (p.type === 'lesson') {
                    lessonsCompleted++
                  } else if (p.type === 'quiz') {
                    quizzesCompleted++
                  } else {
                    lessonsCompleted++ // Якщо тип не вказано, вважаємо уроком
                  }
                  
                  const completedDate = new Date(p.completedAt)
                  if (completedDate > lastActive) {
                    lastActive = completedDate
                  }
                }
                
                // Підрахунок курсів
                if (p.totalLessons > 0) {
                  coursesStarted++
                  if (p.isCompleted) {
                    coursesCompleted++
                  }
                }
              })
              
              user.lessonsCompleted = lessonsCompleted
              user.quizzesCompleted = quizzesCompleted
              user.coursesStarted = coursesStarted
              user.coursesCompleted = coursesCompleted
              user.totalActivity = lessonsCompleted + quizzesCompleted
              user.lastActive = lastActive > new Date(0) ? 
                lastActive.toLocaleDateString('uk-UA') : 'Невідомо'
              users.set(userId, user)
            }
          } catch (error) {
            console.error('Error parsing progress data:', error)
          }
        } else if (key.startsWith('quizResults_')) {
          userId = key.replace('quizResults_', '')
          try {
            const quizData = JSON.parse(localStorage.getItem(key) || '{}')
            if (users.has(userId)) {
              const user = users.get(userId)
              const quizCount = Object.keys(quizData).length
              user.quizzesCompleted = Math.max(user.quizzesCompleted, quizCount)
              user.totalActivity = user.lessonsCompleted + user.quizzesCompleted
              users.set(userId, user)
            }
          } catch (error) {
            console.error('Error parsing quiz data:', error)
          }
        }
      })
      
      // Сортуємо за активністю
      return Array.from(users.values()).sort((a, b) => {
        // Спочатку за останньою активністю
        if (a.lastActive === 'Невідомо' && b.lastActive !== 'Невідомо') return 1
        if (a.lastActive !== 'Невідомо' && b.lastActive === 'Невідомо') return -1
        
        // Потім за загальною активністю
        return b.totalActivity - a.totalActivity
      })
    } catch (error) {
      console.error('Error getting user list:', error)
      return []
    }
  }

  // Функція для отримання списку користувачів з Firebase (з прогресом з localStorage)
  const getCombinedUserList = () => {
    const localStorageUsers = getUserList()
    const combinedUsers = new Map()

    // Додаємо користувачів з Firebase
    firebaseUsers.forEach(firebaseUser => {
      const userId = firebaseUser.uid || firebaseUser.id
      combinedUsers.set(userId, {
        id: userId,
        name: firebaseUser.displayName || 'Анонімний користувач',
        email: firebaseUser.email || 'Невідомо',
        lessonsCompleted: 0,
        quizzesCompleted: 0,
        lastActive: 'Невідомо',
        coursesStarted: 0,
        coursesCompleted: 0,
        totalActivity: 0,
        source: 'firebase',
        createdAt: firebaseUser.createdAt,
        lastLoginAt: firebaseUser.lastLoginAt,
        isActive: firebaseUser.isActive
      })
    })

    // Додаємо прогрес з localStorage для користувачів з Firebase
    localStorageUsers.forEach(localUser => {
      if (combinedUsers.has(localUser.id)) {
        // Оновлюємо існуючого користувача з Firebase прогресом
        const existingUser = combinedUsers.get(localUser.id)
        combinedUsers.set(localUser.id, {
          ...existingUser,
          lessonsCompleted: localUser.lessonsCompleted,
          quizzesCompleted: localUser.quizzesCompleted,
          lastActive: localUser.lastActive,
          coursesStarted: localUser.coursesStarted,
          coursesCompleted: localUser.coursesCompleted,
          totalActivity: localUser.totalActivity,
          source: 'firebase+progress'
        })
      }
    })

    return Array.from(combinedUsers.values()).sort((a, b) => {
      // Спочатку за останньою активністю
      if (a.lastActive === 'Невідомо' && b.lastActive !== 'Невідомо') return 1
      if (a.lastActive !== 'Невідомо' && b.lastActive === 'Невідомо') return -1
      
      // Потім за загальною активністю
      return b.totalActivity - a.totalActivity
    })
  }

  // Функція для фільтрації користувачів
  const getFilteredUsers = () => {
    const users = getCombinedUserList()
    if (!userSearchTerm.trim()) return users
    
    const searchLower = userSearchTerm.toLowerCase()
    return users.filter(user => 
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.id.toLowerCase().includes(searchLower)
    )
  }


  // Функція для реального оновлення даних аналітики
  const refreshAnalyticsData = async () => {
    try {
      console.log('🔄 Оновлюємо дані аналітики...')
      
      // Оновлюємо дані користувачів з Firebase
      const usersResult = await getAllUsers()
      if (usersResult.success) {
        setFirebaseUsers(usersResult.data || [])
        console.log('✅ Користувачі оновлено:', usersResult.data?.length || 0)
      }
      
      // Оновлюємо дані з ProgressContext (автоматично через React Query)
      // Курси вже оновлюються через useQuery
      
      console.log('✅ Аналітика оновлено успішно')
    } catch (error) {
      console.error('❌ Помилка оновлення аналітики:', error)
    }
  }

  // Функції для аналітики
  const getWeeklyActivity = () => {
    // Реальні дані з ProgressContext та localStorage
    const currentWeek = new Date()
    const weeks = []
    
    // Визначаємо кількість періодів залежно від вибраного фільтру
    let periodsCount = 4
    let periodDays = 7
    
    switch (analyticsPeriod) {
      case 'month':
        periodsCount = 4
        periodDays = 7 // 4 тижні в місяці
        break
      case 'quarter':
        periodsCount = 12
        periodDays = 7 // 12 тижнів в кварталі
        break
      default: // week
        periodsCount = 4
        periodDays = 7
    }
    
    // Збираємо реальну активність за датами
    const activityByDate = new Map<string, { lessons: number, quizzes: number }>()
    
    try {
      // Отримуємо дані з localStorage
      const allKeys = Object.keys(localStorage)
      const progressKeys = allKeys.filter(key => key.startsWith('progress_'))
      const quizKeys = allKeys.filter(key => key.startsWith('quizResults_'))
      
      // Обробляємо прогрес уроків
      for (const key of progressKeys) {
        try {
          const progressData = JSON.parse(localStorage.getItem(key) || '{}')
          Object.values(progressData).forEach((p: any) => {
            if (p.completed && p.completedAt) {
              const date = new Date(p.completedAt)
              const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD
              
              if (!activityByDate.has(dateString)) {
                activityByDate.set(dateString, { lessons: 0, quizzes: 0 })
              }
              activityByDate.get(dateString)!.lessons++
            }
          })
        } catch (error) {
          console.error('Помилка обробки прогресу:', error)
        }
      }
      
      // Обробляємо результати квізів
      for (const key of quizKeys) {
        try {
          const quizData = JSON.parse(localStorage.getItem(key) || '[]')
          if (Array.isArray(quizData)) {
            quizData.forEach((quiz: any) => {
              if (quiz.completedAt) {
                const date = new Date(quiz.completedAt)
                const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD
                
                if (!activityByDate.has(dateString)) {
                  activityByDate.set(dateString, { lessons: 0, quizzes: 0 })
                }
                activityByDate.get(dateString)!.quizzes++
              }
            })
          }
        } catch (error) {
          console.error('Помилка обробки квізів:', error)
        }
      }
      
      console.log('📅 Реальна активність за датами:', activityByDate)
      console.log('📊 Загальна активність:', {
        totalLessons: totalLessonsCompleted,
        totalQuizzes: totalQuizzesCompleted,
        activityDates: Array.from(activityByDate.keys())
      })
      
    } catch (error) {
      console.error('Помилка збору активності:', error)
    }
    
    // Групуємо активність по тижнях
    for (let i = periodsCount - 1; i >= 0; i--) {
      const periodStart = new Date(currentWeek)
      periodStart.setDate(periodStart.getDate() - (i * periodDays))
      
      const periodEnd = new Date(periodStart)
      periodEnd.setDate(periodEnd.getDate() + periodDays - 1)
      
      let periodLessons = 0
      let periodQuizzes = 0
      
      // Підраховуємо активність за цей період
      for (const [dateString, activity] of activityByDate) {
        const activityDate = new Date(dateString)
        if (activityDate >= periodStart && activityDate <= periodEnd) {
          periodLessons += activity.lessons
          periodQuizzes += activity.quizzes
        }
      }
      
      const weekData = {
        week: i + 1,
        date: periodStart,
        lessons: periodLessons,
        quizzes: periodQuizzes,
        total: periodLessons + periodQuizzes,
        period: analyticsPeriod
      }
      
      console.log(`📅 Тиждень ${i + 1} (${periodStart.toLocaleDateString('uk-UA')} - ${periodEnd.toLocaleDateString('uk-UA')}):`, {
        lessons: periodLessons,
        quizzes: periodQuizzes,
        total: periodLessons + periodQuizzes
      })
      
      weeks.push(weekData)
    }
    
    return weeks
  }

  const getLearningMetrics = () => {
    const totalUsers = stats.totalUsers
    const avgLessonsPerUser = totalUsers > 0 ? (totalLessonsCompleted / totalUsers) : 0
    const avgQuizzesPerUser = totalUsers > 0 ? (totalQuizzesCompleted / totalUsers) : 0
    const completionRate = totalUsers > 0 ? (stats.activeUsers / totalUsers) * 100 : 0
    
    // Реальний розрахунок часу навчання на основі середньої тривалості уроків та квізів
    const avgLessonDuration = 15 // хвилини (середня тривалість уроку)
    const avgQuizDuration = 10 // хвилини (середня тривалість квізу)
    const avgLearningTime = Math.round(avgLessonsPerUser * avgLessonDuration + avgQuizzesPerUser * avgQuizDuration)
    
    return {
      avgLessonsPerUser: Math.round(avgLessonsPerUser * 10) / 10,
      avgQuizzesPerUser: Math.round(avgQuizzesPerUser * 10) / 10,
      completionRate: Math.round(completionRate),
      avgLearningTime,
      totalLearningTime: Math.round((totalLessonsCompleted * avgLessonDuration + totalQuizzesCompleted * avgQuizDuration) / 60) // години
    }
  }

  const getCourseAnalytics = () => {
    return courses.map(course => {
      const completedStudents = getCompletedStudentsCount(course.id)
      const percentage = Math.round((completedStudents / Math.max(stats.totalUsers, 1)) * 100)
      
      // Реальний рейтинг курсу з ProgressContext
      const rating = getCourseRating(course.id)
      
      return {
        ...course,
        completedStudents,
        percentage,
        rating: rating || 0, // Якщо немає рейтингу, показуємо 0
        engagement: percentage // Реальний engagement = відсоток завершення
      }
    }).sort((a, b) => b.completedStudents - a.completedStudents)
  }

  const getTopPerformers = () => {
    // Отримуємо топ користувачів за активністю
    const allUsers = [...firebaseUsers]
    console.log('👥 Firebase користувачі для топ-перформерів:', allUsers.length, allUsers)
    return allUsers
      .map(user => {
        const progress = user.progress || {}
        const totalActivity = (progress.lessonsCompleted || 0) + (progress.quizzesCompleted || 0)
        
        // Розраховуємо реальний середній бал користувача з localStorage
        let avgScore = 0
        try {
          // Шукаємо дані квізів користувача в localStorage
          const quizKey = `quizResults_${user.id}`
          const quizData = localStorage.getItem(quizKey)
          if (quizData) {
            const quizResults = JSON.parse(quizData)
            if (quizResults && quizResults.length > 0) {
              const totalScore = quizResults.reduce((sum: number, quiz: any) => sum + (quiz.score || 0), 0)
              avgScore = Math.round(totalScore / quizResults.length)
              console.log(`📊 Користувач ${user.email}: ${quizResults.length} квізів, середній бал: ${avgScore}%`)
            } else {
              console.log(`📊 Користувач ${user.email}: немає даних квізів`)
            }
          } else {
            console.log(`📊 Користувач ${user.email}: немає ключа ${quizKey}`)
          }
        } catch (error) {
          console.error('Помилка отримання даних квізів для користувача:', user.id, error)
        }
        
        return {
          ...user,
          totalActivity,
          avgScore
        }
      })
      .sort((a, b) => b.totalActivity - a.totalActivity)
      .slice(0, 5)
  }

  // Функція для отримання детальної інформації про користувача
  const getUserDetails = async (userId: string) => {
    try {
      // Завантажуємо профіль з Firebase
      const profileResult = await getUserProfile(userId)
      const profileData = profileResult.success ? profileResult.data : {}
      
      // Завантажуємо прогрес з Firebase
      const progressResult = await getUserProgress(userId)
      const firebaseProgress = progressResult.success ? progressResult.data : []
      
      // Завантажуємо з localStorage як fallback
      const userProgress = localStorage.getItem(`progress_${userId}`)
      const userQuizzes = localStorage.getItem(`quizResults_${userId}`)
      
      let progressData = {}
      let quizData = {}
      
      if (userProgress) {
        progressData = JSON.parse(userProgress)
        console.log('📊 LocalStorage progress data:', progressData)
      }
      if (userQuizzes) {
        quizData = JSON.parse(userQuizzes)
        console.log('📊 LocalStorage quiz data:', quizData)
        console.log('📊 Quiz data type:', Array.isArray(quizData) ? 'Array' : 'Object')
        console.log('📊 Quiz data length/keys:', Array.isArray(quizData) ? quizData.length : Object.keys(quizData).length)
      }
      
      console.log('📊 Firebase progress data:', firebaseProgress)
      
      // Об'єднуємо дані з Firebase та localStorage
      const combinedProgress: { [key: string]: any } = { ...progressData }
      if (firebaseProgress && Array.isArray(firebaseProgress)) {
        firebaseProgress.forEach((firebaseItem: any) => {
          const key = `${firebaseItem.courseId}_${firebaseItem.lessonId || firebaseItem.quizId}`
          combinedProgress[key] = {
            ...firebaseItem,
            completedAt: new Date(firebaseItem.completedAt)
          }
        })
      }
      
      // Підраховуємо детальну статистику
      let totalLessons = 0
      let completedLessons = 0
      let totalQuizzes = 0
      let completedQuizzes = 0
      let averageScore = 0
      let coursesProgress: any[] = []
      let lastActivity = new Date(0)
      
      // Підраховуємо статистику з об'єднаних даних
      Object.entries(combinedProgress).forEach(([, progressItem]: [string, any]) => {
        if (progressItem.completed) {
          if (progressItem.lessonId) {
            completedLessons++
          } else if (progressItem.quizId) {
            completedQuizzes++
            if (progressItem.score !== undefined) {
              averageScore += progressItem.score
            }
          }
          
          if (progressItem.completedAt) {
            const activityDate = new Date(progressItem.completedAt)
            if (activityDate > lastActivity) {
              lastActivity = activityDate
            }
          }
        }
      })
      
      // Також підраховуємо з quizData (окремо збережені результати квізів)
      // quizData - це масив QuizResult[], а не об'єкт
      if (Array.isArray(quizData)) {
        quizData.forEach((quizItem: any) => {
          if (quizItem.score !== undefined) {
            completedQuizzes++
            averageScore += quizItem.score
            console.log('📊 Quiz result:', { score: quizItem.score, courseId: quizItem.courseId, quizId: quizItem.quizId })
          }
          
          if (quizItem.completedAt) {
            const activityDate = new Date(quizItem.completedAt)
            if (activityDate > lastActivity) {
              lastActivity = activityDate
            }
          }
        })
      } else {
        // Fallback для старого формату (якщо зберігалося як об'єкт)
        Object.entries(quizData).forEach(([, quizItem]: [string, any]) => {
          if (quizItem.score !== undefined) {
            completedQuizzes++
            averageScore += quizItem.score
            console.log('📊 Quiz result (old format):', { score: quizItem.score, courseId: quizItem.courseId, quizId: quizItem.quizId })
          }
          
          if (quizItem.completedAt) {
            const activityDate = new Date(quizItem.completedAt)
            if (activityDate > lastActivity) {
              lastActivity = activityDate
            }
          }
        })
      }
      
      // Підраховуємо середній бал (score вже в відсотках)
      if (completedQuizzes > 0) {
        averageScore = Math.round(averageScore / completedQuizzes)
      }
      
      console.log('📊 Calculated stats:', {
        completedLessons,
        completedQuizzes,
        averageScore,
        totalLessons,
        totalQuizzes,
        calculationDetails: {
          totalScoreSum: averageScore * completedQuizzes,
          quizzesFromProgress: Object.entries(combinedProgress).filter(([, item]) => item.quizId).length,
          quizzesFromQuizData: Array.isArray(quizData) ? quizData.length : Object.keys(quizData).length,
          quizDataIsArray: Array.isArray(quizData)
        }
      })
      
      // Групуємо прогрес по курсах
      const courseGroups: { [key: string]: any } = {}
      Object.entries(combinedProgress).forEach(([, progressItem]: [string, any]) => {
        const courseId = progressItem.courseId
        if (!courseGroups[courseId]) {
          courseGroups[courseId] = {
            courseId,
            lessonsCompleted: 0,
            quizzesCompleted: 0,
            totalScore: 0,
            lastActivity: new Date(0)
          }
        }
        
        if (progressItem.completed) {
          if (progressItem.lessonId) {
            courseGroups[courseId].lessonsCompleted++
          } else if (progressItem.quizId) {
            courseGroups[courseId].quizzesCompleted++
            if (progressItem.score !== undefined) {
              courseGroups[courseId].totalScore += progressItem.score
            }
          }
          
          if (progressItem.completedAt) {
            const activityDate = new Date(progressItem.completedAt)
            if (activityDate > courseGroups[courseId].lastActivity) {
              courseGroups[courseId].lastActivity = activityDate
            }
          }
        }
      })
      
      // Також додаємо дані з quizData до груп курсів
      if (Array.isArray(quizData)) {
        quizData.forEach((quizItem: any) => {
          const courseId = quizItem.courseId
          if (courseId) {
            if (!courseGroups[courseId]) {
              courseGroups[courseId] = {
                courseId,
                lessonsCompleted: 0,
                quizzesCompleted: 0,
                totalScore: 0,
                lastActivity: new Date(0)
              }
            }
            
            courseGroups[courseId].quizzesCompleted++
            if (quizItem.score !== undefined) {
              courseGroups[courseId].totalScore += quizItem.score
            }
            
            if (quizItem.completedAt) {
              const activityDate = new Date(quizItem.completedAt)
              if (activityDate > courseGroups[courseId].lastActivity) {
                courseGroups[courseId].lastActivity = activityDate
              }
            }
          }
        })
      } else {
        // Fallback для старого формату
        Object.entries(quizData).forEach(([, quizItem]: [string, any]) => {
          const courseId = quizItem.courseId
          if (courseId) {
            if (!courseGroups[courseId]) {
              courseGroups[courseId] = {
                courseId,
                lessonsCompleted: 0,
                quizzesCompleted: 0,
                totalScore: 0,
                lastActivity: new Date(0)
              }
            }
            
            courseGroups[courseId].quizzesCompleted++
            if (quizItem.score !== undefined) {
              courseGroups[courseId].totalScore += quizItem.score
            }
            
            if (quizItem.completedAt) {
              const activityDate = new Date(quizItem.completedAt)
              if (activityDate > courseGroups[courseId].lastActivity) {
                courseGroups[courseId].lastActivity = activityDate
              }
            }
          }
        })
      }
      
      // Конвертуємо в масив для відображення
      coursesProgress = Object.values(courseGroups).map((course: any) => {
        // Знаходимо назву курсу з Contentful
        const courseFromContentful = courses.find(c => c.id === course.courseId)
        const courseTitle = courseFromContentful?.fields?.title || `Курс ${course.courseId}`
        
        console.log('📚 Course mapping:', {
          courseId: course.courseId,
          foundInContentful: !!courseFromContentful,
          title: courseTitle,
          contentfulTitle: courseFromContentful?.fields?.title
        })
        
        return {
          courseId: course.courseId,
          title: courseTitle,
          lessonsCompleted: course.lessonsCompleted,
          quizzesCompleted: course.quizzesCompleted,
          averageScore: course.quizzesCompleted > 0 ? Math.round(course.totalScore / course.quizzesCompleted) : 0,
          lastActivity: course.lastActivity,
          isActive: course.lessonsCompleted > 0 || course.quizzesCompleted > 0
        }
      })
      
      // Додаткова статистика з localStorage (якщо є)
      Object.entries(progressData).forEach(([courseId, courseProgress]: [string, any]) => {
        if (courseProgress.totalLessons) {
          totalLessons += courseProgress.totalLessons
          completedLessons += courseProgress.completedLessons || 0
          
          if (courseProgress.totalQuizzes) {
            totalQuizzes += courseProgress.totalQuizzes
            completedQuizzes += courseProgress.completedQuizzes || 0
          }
          
          // Знаходимо назву курсу з Contentful
          const courseFromContentful = courses.find(c => c.id === courseId)
          const courseTitle = courseFromContentful?.fields?.title || courseProgress.title || `Курс ${courseId}`
          
          coursesProgress.push({
            courseId,
            title: courseTitle,
            progress: courseProgress.completedLessons || 0,
            total: courseProgress.totalLessons,
            percentage: Math.round(((courseProgress.completedLessons || 0) / courseProgress.totalLessons) * 100),
            isCompleted: courseProgress.isCompleted || false,
            lastAccessed: courseProgress.lastAccessed
          })
          
          if (courseProgress.lastAccessed) {
            const lastDate = new Date(courseProgress.lastAccessed)
            if (lastDate > lastActivity) {
              lastActivity = lastDate
            }
          }
        }
      })
      
      // Середній бал вже розрахований вище, тому цей блок видаляємо
      // (було дублювання логіки)
      
      return {
        ...profileData,
        id: userId,
        // Основна інформація профілю
        displayName: profileData?.displayName || 'Анонімний користувач',
        email: profileData?.email || 'Невідомо',
        bio: profileData?.bio || '',
        location: profileData?.location || '',
        website: profileData?.website || '',
        github: profileData?.github || '',
        linkedin: profileData?.linkedin || '',
        createdAt: profileData?.createdAt,
        lastLoginAt: profileData?.lastLoginAt,
        isActive: profileData?.isActive,
        // Статистика навчання
        totalLessons,
        completedLessons,
        totalQuizzes,
        completedQuizzes,
        averageScore,
        coursesProgress,
        lastActivity: lastActivity > new Date(0) ? lastActivity.toLocaleDateString('uk-UA') : 'Невідомо',
        totalActivity: completedLessons + completedQuizzes,
        firebaseProgress: firebaseProgress?.length || 0,
        localStorageProgress: Object.keys(progressData).length,
        dataSource: (firebaseProgress?.length || 0) > 0 ? 'Firebase + LocalStorage' : 'LocalStorage only'
      }
    } catch (error) {
      console.error('Error getting user details:', error)
      return null
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Панель керування', icon: '📊' },
    { id: 'users', label: 'Користувачі', icon: '👥' },
    { id: 'analytics', label: 'Аналітика', icon: '📈' },
    { id: 'settings', label: 'Налаштування', icon: '⚙️' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Адмін панель</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Управляйте платформою та аналізуйте дані</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          <div className="lg:col-span-1">
            <Card className="p-4 sm:p-6">
              <nav className="space-y-1 sm:space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors text-sm sm:text-base ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-base sm:text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Основні статистики */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  <Card className="p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Всього користувачів</p>
                        <p className="text-lg sm:text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                      </div>
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Всього курсів</p>
                        <p className="text-lg sm:text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                      </div>
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Загальна активність</p>
                        <p className="text-lg sm:text-3xl font-bold text-gray-900">{stats.totalActivity.toLocaleString()}</p>
                      </div>
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Активні користувачі</p>
                        <p className="text-lg sm:text-3xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
                      </div>
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Додаткові статистики */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Завершено уроків</p>
                        <p className="text-2xl font-bold text-gray-900">{totalLessonsCompleted.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Пройдено квізів</p>
                        <p className="text-2xl font-bold text-gray-900">{totalQuizzesCompleted.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Середній прогрес</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {courses.length > 0 ? Math.round((totalLessonsCompleted / (courses.length * 5)) * 100) : 0}%
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Топ курси */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Популярні курси</h3>
                  <div className="space-y-4">
                    {courses.slice(0, 5).map((course, index) => {
                      const completedStudents = getCompletedStudentsCount(course.id)
                      return (
                        <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-primary-600">#{index + 1}</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{course.fields.title}</h4>
                              <p className="text-sm text-gray-600">{course.fields.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{completedStudents} студентів</p>
                            <p className="text-xs text-gray-500">завершили</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-4 sm:space-y-6">
              <Card className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                    <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Управління користувачами</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Всього користувачів: {getCombinedUserList().length} • 
                        Показано: {getFilteredUsers().length}
                        {usersLoading && <span className="ml-2 text-blue-600">🔄 Завантаження...</span>}
                      </p>
                    </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <Input 
                        placeholder="Пошук користувачів..." 
                        className="w-full sm:w-64"
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button onClick={loadFirebaseUsers} disabled={usersLoading} size="sm" className="flex-1 sm:flex-none">
                          {usersLoading ? '🔄' : '🔄'} Оновити
                        </Button>
                        <Button size="sm" className="flex-1 sm:flex-none">Додати</Button>
                      </div>
                    </div>
                  </div>
                    
                  <div className="space-y-4">
                    {getFilteredUsers().length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Користувачі не знайдені</h4>
                        <p className="text-gray-600">
                          {userSearchTerm ? 'Спробуйте змінити пошуковий запит' : 'Поки що немає зареєстрованих користувачів'}
                        </p>
                      </div>
                    ) : (
                      getFilteredUsers().map((user) => (
                        <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors gap-3 sm:gap-4">
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm sm:text-lg font-bold text-gray-600">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{user.name || 'Анонімний користувач'}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                                  user.source === 'firebase' ? 'bg-green-100 text-green-700' :
                                  user.source === 'firebase+progress' ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {user.source === 'firebase' ? '🔥 Firebase' :
                                   user.source === 'firebase+progress' ? '🔥📊 Firebase+Progress' :
                                   '💾 LocalStorage'}
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                                <span className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</span>
                                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                                  <span>{user.lessonsCompleted} уроків</span>
                                  <span className="hidden sm:inline">•</span>
                                  <span>{user.quizzesCompleted} квізів</span>
                                  <span className="hidden sm:inline">•</span>
                                  <span>{user.coursesCompleted} курсів</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                            <div className="text-center sm:text-right">
                              <p className="text-xs sm:text-sm font-medium text-gray-900">{user.lastActive}</p>
                              <p className="text-xs text-gray-500">остання активність</p>
                            </div>
                            <div className="flex gap-1 sm:gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="hover:bg-blue-50 hover:text-blue-600 text-xs sm:text-sm px-2 sm:px-3"
                                onClick={async () => {
                                  const userDetails = await getUserDetails(user.id)
                                  setSelectedUser(userDetails)
                                }}
                              >
                                <span className="hidden sm:inline">Переглянути</span>
                                <span className="sm:hidden">👁️</span>
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-3">
                                <span className="hidden sm:inline">Заблокувати</span>
                                <span className="sm:hidden">🚫</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                </div>
              </Card>
              </div>
            )}


            {activeTab === 'analytics' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Заголовок з фільтрами */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Аналітика платформи</h2>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Детальна статистика та метрики навчання</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <select
                      value={analyticsPeriod}
                      onChange={(e) => {
                        setAnalyticsPeriod(e.target.value)
                        console.log('📅 Період змінено на:', e.target.value)
                      }}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="week">Останній тиждень</option>
                      <option value="month">Останній місяць</option>
                      <option value="quarter">Останній квартал</option>
                    </select>
                    <Button 
                      onClick={() => {
                        setAnalyticsLoading(true)
                        // Реальне оновлення даних
                        refreshAnalyticsData()
                        setTimeout(() => setAnalyticsLoading(false), 1000)
                      }}
                      disabled={analyticsLoading}
                      className="bg-black hover:bg-gray-800 text-white text-sm sm:text-base"
                    >
                      {analyticsLoading ? '🔄' : '🔄'} Оновити
                    </Button>
                  </div>
                </div>

                {/* Ключові метрики */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  {(() => {
                    const metrics = getLearningMetrics()
                    return (
                      <>
                        <Card className="p-3 sm:p-6">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Середній час навчання</p>
                              <p className="text-lg sm:text-2xl font-bold text-blue-600">{metrics.avgLearningTime} хв</p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-base sm:text-xl">⏱️</span>
                            </div>
                          </div>
                        </Card>
                        
                        <Card className="p-3 sm:p-6">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Загальний час навчання</p>
                              <p className="text-lg sm:text-2xl font-bold text-green-600">{metrics.totalLearningTime} год</p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-base sm:text-xl">📚</span>
                            </div>
                          </div>
                        </Card>
                        
                        <Card className="p-3 sm:p-6">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Відсоток завершення</p>
                              <p className="text-lg sm:text-2xl font-bold text-purple-600">{metrics.completionRate}%</p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-base sm:text-xl">🎯</span>
                            </div>
                          </div>
                        </Card>
                        
                        <Card className="p-3 sm:p-6">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Активні користувачі</p>
                              <p className="text-lg sm:text-2xl font-bold text-orange-600">{stats.activeUsers}</p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-base sm:text-xl">👥</span>
                            </div>
                          </div>
                        </Card>
                      </>
                    )
                  })()}
                </div>

                {/* Активність за періодами */}
                <Card className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                    Активність за {analyticsPeriod === 'week' ? 'останні 4 тижні' : 
                                   analyticsPeriod === 'month' ? 'останній місяць' : 
                                   'останній квартал'}
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {getWeeklyActivity().map((week) => (
                      <div key={week.week} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xs sm:text-sm font-bold text-primary-600">Т{week.week}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm sm:text-base">
                              {week.date.toLocaleDateString('uk-UA', { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {analyticsPeriod === 'week' ? `Тиждень ${week.week}` :
                               analyticsPeriod === 'month' ? `Тиждень ${week.week}` :
                               `Тиждень ${week.week}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-xs sm:text-sm font-medium text-gray-900">{week.lessons}</span>
                            <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">уроків</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                            <span className="text-xs sm:text-sm font-medium text-gray-900">{week.quizzes}</span>
                            <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">квізів</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-bold text-gray-900">{week.total}</p>
                            <p className="text-xs text-gray-600">всього</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Топ курси та топ користувачі */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Топ курси за популярністю</h3>
                    <div className="space-y-3 sm:space-y-4">
                      {getCourseAnalytics().slice(0, 5).map((course, index) => (
                        <div key={course.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2 sm:gap-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-xs sm:text-sm font-bold text-primary-600">#{index + 1}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{course.fields.title}</p>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{course.fields.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:text-right">
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-gray-900">{course.completedStudents}</p>
                              <p className="text-xs text-gray-600">студентів</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-yellow-600">⭐</span>
                              <span className="text-xs text-gray-600">
                                {course.rating > 0 ? course.rating : 'Немає рейтингу'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Топ користувачі за активністю</h3>
                    <div className="space-y-3 sm:space-y-4">
                      {getTopPerformers().map((user) => (
                        <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2 sm:gap-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs sm:text-sm font-bold text-gray-600">
                                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{user.displayName || 'Анонімний'}</p>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:text-right">
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-gray-900">{user.totalActivity}</p>
                              <p className="text-xs text-gray-600">активність</p>
                            </div>
                            <div>
                              <p className="text-xs text-green-600">Середній бал: {user.avgScore}%</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Налаштування платформи</h3>
                  {settings && (
                    <span className="text-sm text-gray-500">
                      Останнє оновлення: {new Date(settings.updatedAt).toLocaleString('uk-UA')}
                    </span>
                  )}
                </div>
                
                {settingsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : settings ? (
                  <SettingsForm settings={settings} onUpdate={updateSettings} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Помилка завантаження налаштувань
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Модальне вікно з деталями користувача */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Детальна інформація про користувача</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Основна інформація */}
                <Card className="p-4 sm:p-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Основна інформація</h4>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm sm:text-lg font-bold text-gray-600">
                          {selectedUser.displayName ? selectedUser.displayName.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{selectedUser.displayName || 'Анонімний користувач'}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{selectedUser.email || 'Невідомо'}</p>
                      </div>
                    </div>
                    
                    {/* Біографія */}
                    {selectedUser.bio && (
                      <div className="pt-3 border-t">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Про себе:</h5>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedUser.bio}</p>
                      </div>
                    )}
                    
                    {/* Контактна інформація */}
                    <div className="pt-3 border-t">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Контактна інформація:</h5>
                      <div className="space-y-2">
                        {selectedUser.location && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm text-gray-600">{selectedUser.location}</span>
                          </div>
                        )}
                        {selectedUser.website && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <a href={selectedUser.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                              {selectedUser.website}
                            </a>
                          </div>
                        )}
                        {selectedUser.github && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <a href={`https://github.com/${selectedUser.github}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                              {selectedUser.github}
                            </a>
                          </div>
                        )}
                        {selectedUser.linkedin && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            <a href={`https://linkedin.com/in/${selectedUser.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                              {selectedUser.linkedin}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Технічна інформація */}
                    <div className="pt-3 border-t">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Технічна інформація:</h5>
                      <div className="space-y-1 text-xs text-gray-500">
                        <p>ID користувача: <span className="font-mono">{selectedUser.id}</span></p>
                        <p>Остання активність: {selectedUser.lastActivity}</p>
                        <p>Джерело даних: <span className="font-medium">{selectedUser.dataSource}</span></p>
                        <p>Firebase: {selectedUser.firebaseProgress} записів • LocalStorage: {selectedUser.localStorageProgress} записів</p>
                        {selectedUser.createdAt && (
                          <p>Дата реєстрації: {new Date(selectedUser.createdAt).toLocaleDateString('uk-UA')}</p>
                        )}
                        {selectedUser.lastLoginAt && (
                          <p>Останній вхід: {new Date(selectedUser.lastLoginAt).toLocaleDateString('uk-UA')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Статистика */}
                <Card className="p-4 sm:p-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Статистика навчання</h4>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold text-blue-600">{selectedUser.completedLessons}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Уроків завершено</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold text-green-600">{selectedUser.completedQuizzes}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Квізів пройдено</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-purple-50 rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold text-purple-600">{selectedUser.coursesProgress.filter((c: any) => c.isCompleted).length}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Курсів завершено</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold text-orange-600">{selectedUser.averageScore}%</p>
                      <p className="text-xs sm:text-sm text-gray-600">Середній бал</p>
                    </div>
                  </div>
                  
                  {/* Додаткова статистика */}
                  <div className="pt-3 sm:pt-4 border-t">
                    <h5 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Додаткова інформація:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Загальна активність:</span>
                        <span className="font-medium">{selectedUser.totalActivity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Всього уроків:</span>
                        <span className="font-medium">{selectedUser.totalLessons}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Всього квізів:</span>
                        <span className="font-medium">{selectedUser.totalQuizzes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Активних курсів:</span>
                        <span className="font-medium">{selectedUser.coursesProgress.filter((c: any) => c.isActive).length}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Прогрес по курсах */}
              <Card className="p-4 sm:p-6 mt-4 sm:mt-6">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Прогрес по курсах</h4>
                <div className="space-y-3 sm:space-y-4">
                  {selectedUser.coursesProgress.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h5 className="text-lg font-medium text-gray-900 mb-2">Користувач ще не почав жодного курсу</h5>
                      <p className="text-gray-600">Коли користувач почне навчання, тут з'явиться інформація про прогрес</p>
                    </div>
                  ) : (
                    selectedUser.coursesProgress.map((course: any) => (
                      <div key={course.courseId} className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 mb-1 text-sm sm:text-base truncate">{course.title}</h5>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">ID курсу: {course.courseId}</p>
                          </div>
                          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                            {course.isCompleted && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="hidden sm:inline">Завершено</span>
                                <span className="sm:hidden">✓</span>
                              </span>
                            )}
                            {course.isActive && !course.isCompleted && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="hidden sm:inline">Активний</span>
                                <span className="sm:hidden">⚡</span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-1 sm:space-y-2">
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-600">Уроків завершено:</span>
                              <span className="font-medium text-blue-600">{course.lessonsCompleted || 0}</span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-600">Квізів пройдено:</span>
                              <span className="font-medium text-green-600">{course.quizzesCompleted || 0}</span>
                            </div>
                            {course.progress !== undefined && (
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-600">Прогрес:</span>
                                <span className="font-medium text-purple-600">{course.progress}%</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1 sm:space-y-2">
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-600">Середній бал:</span>
                              <span className="font-medium text-orange-600">{course.averageScore || 0}%</span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-600">Остання активність:</span>
                              <span className="font-medium text-gray-900 text-right">
                                {course.lastActivity ? new Date(course.lastActivity).toLocaleDateString('uk-UA') : 'Невідомо'}
                              </span>
                            </div>
                            {course.lastAccessed && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Останній доступ:</span>
                                <span className="font-medium text-gray-900">
                                  {new Date(course.lastAccessed).toLocaleDateString('uk-UA')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Дії */}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={() => setSelectedUser(null)}>
                  Закрити
                </Button>
                <Button className="bg-red-600 hover:bg-red-700">
                  Заблокувати користувача
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Admin


