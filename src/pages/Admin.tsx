import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '../lib/contentful'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useProgress } from '../features/progress/ProgressContext'
import { useAuth } from '../features/auth/AuthContext'
import { Navigate } from 'react-router-dom'
import { getAllUsers, getUserProfile, getUserProgress } from '../firebase'

export function Admin() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [firebaseUsers, setFirebaseUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

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
    getCompletedStudentsCount 
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

  // Завантажуємо користувачів при відкритті табу
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
      }
      if (userQuizzes) {
        quizData = JSON.parse(userQuizzes)
      }
      
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
      
      // Підраховуємо середній бал
      if (completedQuizzes > 0) {
        averageScore = Math.round(averageScore / completedQuizzes)
      }
      
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
      
      // Конвертуємо в масив для відображення
      coursesProgress = Object.values(courseGroups).map((course: any) => ({
        courseId: course.courseId,
        title: `Курс ${course.courseId}`,
        lessonsCompleted: course.lessonsCompleted,
        quizzesCompleted: course.quizzesCompleted,
        averageScore: course.quizzesCompleted > 0 ? Math.round(course.totalScore / course.quizzesCompleted) : 0,
        lastActivity: course.lastActivity,
        isActive: course.lessonsCompleted > 0 || course.quizzesCompleted > 0
      }))
      
      // Додаткова статистика з localStorage (якщо є)
      Object.entries(progressData).forEach(([courseId, courseProgress]: [string, any]) => {
        if (courseProgress.totalLessons) {
          totalLessons += courseProgress.totalLessons
          completedLessons += courseProgress.completedLessons || 0
          
          if (courseProgress.totalQuizzes) {
            totalQuizzes += courseProgress.totalQuizzes
            completedQuizzes += courseProgress.completedQuizzes || 0
          }
          
          coursesProgress.push({
            courseId,
            title: courseProgress.title || `Курс ${courseId}`,
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
      
      // Підраховуємо середній бал з квізів
      const quizScores = Object.values(quizData).map((quiz: any) => quiz.score || 0)
      if (quizScores.length > 0) {
        averageScore = Math.round(quizScores.reduce((sum: number, score: number) => sum + score, 0) / quizScores.length)
      }
      
      return {
        ...profileData,
        id: userId,
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
    { id: 'courses', label: 'Курси', icon: '📚' },
    { id: 'analytics', label: 'Аналітика', icon: '📈' },
    { id: 'settings', label: 'Налаштування', icon: '⚙️' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Адмін панель</h1>
          <p className="text-gray-600 mt-2">Управляйте платформою та аналізуйте дані</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Всього користувачів</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Всього курсів</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Загальна активність</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalActivity.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Активні користувачі</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Додаткові статистики */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                  <h3 className="text-lg font-semibold text-gray-900">Управління користувачами</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Всього користувачів: {getCombinedUserList().length} • 
                        Показано: {getFilteredUsers().length}
                        {usersLoading && <span className="ml-2 text-blue-600">🔄 Завантаження...</span>}
                      </p>
                    </div>
                  <div className="flex gap-4">
                      <Input 
                        placeholder="Пошук користувачів..." 
                        className="w-64"
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                      />
                      <Button onClick={loadFirebaseUsers} disabled={usersLoading}>
                        {usersLoading ? '🔄' : '🔄'} Оновити
                      </Button>
                    <Button>Додати користувача</Button>
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
                        <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-lg font-bold text-gray-600">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">{user.name || 'Анонімний користувач'}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  user.source === 'firebase' ? 'bg-green-100 text-green-700' :
                                  user.source === 'firebase+progress' ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {user.source === 'firebase' ? '🔥 Firebase' :
                                   user.source === 'firebase+progress' ? '🔥📊 Firebase+Progress' :
                                   '💾 LocalStorage'}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm text-gray-600">{user.email}</span>
                                <span className="text-sm text-gray-600">•</span>
                                <span className="text-sm text-gray-600">{user.lessonsCompleted} уроків</span>
                                <span className="text-sm text-gray-600">•</span>
                                <span className="text-sm text-gray-600">{user.quizzesCompleted} квізів</span>
                                <span className="text-sm text-gray-600">•</span>
                                <span className="text-sm text-gray-600">{user.coursesCompleted} курсів завершено</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-900">{user.lastActive}</p>
                              <p className="text-xs text-gray-500">остання активність</p>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="hover:bg-blue-50 hover:text-blue-600"
                                onClick={async () => {
                                  const userDetails = await getUserDetails(user.id)
                                  setSelectedUser(userDetails)
                                }}
                              >
                                Переглянути
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                Заблокувати
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

            {activeTab === 'courses' && (
              <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Управління курсами</h3>
                    <div className="flex gap-3">
                      <Input placeholder="Пошук курсів..." className="w-64" />
                  <Button>Створити курс</Button>
                </div>
                  </div>
                  
                  <div className="space-y-4">
                    {courses.map((course) => {
                      const completedStudents = getCompletedStudentsCount(course.id)
                      const courseRating = Math.random() * 2 + 3 // Симуляція рейтингу
                      
                      return (
                        <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg">📚</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{course.fields.title}</h4>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm text-gray-600">{course.fields.category}</span>
                                <span className="text-sm text-gray-600">•</span>
                                <span className="text-sm text-gray-600">{course.fields.level}</span>
                                <span className="text-sm text-gray-600">•</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm text-yellow-600">⭐</span>
                                  <span className="text-sm text-gray-600">{courseRating.toFixed(1)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-900">{completedStudents}</p>
                              <p className="text-xs text-gray-500">студентів</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost">Редагувати</Button>
                              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">Видалити</Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
              </Card>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Статистика активності */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Активність за тижнями</h3>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((week) => {
                        const lessons = Math.floor(Math.random() * 50) + 10
                        const quizzes = Math.floor(Math.random() * 20) + 5
                        return (
                          <div key={week} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Тиждень {week}</span>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">{lessons} уроків</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">{quizzes} квізів</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Card>

              <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Популярні категорії</h3>
                    <div className="space-y-3">
                      {courses.slice(0, 5).map((course) => {
                        const students = getCompletedStudentsCount(course.id)
                        const percentage = Math.round((students / Math.max(stats.totalUsers, 1)) * 100)
                        return (
                          <div key={course.id} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{course.fields.category}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-8">{percentage}%</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                </div>

                {/* Детальна статистика */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Детальна статистика</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {Math.round((totalLessonsCompleted / Math.max(stats.totalUsers, 1)) * 10) / 10}
                      </div>
                      <div className="text-sm text-blue-800">Середня кількість уроків на користувача</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {Math.round((totalQuizzesCompleted / Math.max(stats.totalUsers, 1)) * 10) / 10}
                      </div>
                      <div className="text-sm text-green-800">Середня кількість квізів на користувача</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        {Math.round((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100)}%
                      </div>
                      <div className="text-sm text-purple-800">Відсоток активних користувачів</div>
                    </div>
                </div>
              </Card>
              </div>
            )}

            {activeTab === 'settings' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Налаштування</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Назва платформи
                    </label>
                    <Input defaultValue="LMS Platform" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email підтримки
                    </label>
                    <Input defaultValue="support@lms-platform.com" />
                  </div>
                  <Button>Зберегти налаштування</Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Модальне вікно з деталями користувача */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Детальна інформація про користувача</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Основна інформація */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Основна інформація</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-600">
                          {selectedUser.displayName ? selectedUser.displayName.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedUser.displayName || 'Анонімний користувач'}</p>
                        <p className="text-sm text-gray-600">{selectedUser.email || 'Невідомо'}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600">ID користувача: <span className="font-mono text-xs">{selectedUser.id}</span></p>
                      <p className="text-sm text-gray-600">Остання активність: {selectedUser.lastActivity}</p>
                      <p className="text-sm text-gray-600">Джерело даних: <span className="font-medium">{selectedUser.dataSource}</span></p>
                      <p className="text-sm text-gray-600">
                        Firebase: {selectedUser.firebaseProgress} записів • 
                        LocalStorage: {selectedUser.localStorageProgress} записів
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Статистика */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Статистика</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedUser.completedLessons}</p>
                      <p className="text-sm text-gray-600">Уроків завершено</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedUser.completedQuizzes}</p>
                      <p className="text-sm text-gray-600">Квізів пройдено</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{selectedUser.coursesProgress.filter((c: any) => c.isCompleted).length}</p>
                      <p className="text-sm text-gray-600">Курсів завершено</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{selectedUser.averageScore}%</p>
                      <p className="text-sm text-gray-600">Середній бал</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Прогрес по курсах */}
              <Card className="p-6 mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Прогрес по курсах</h4>
                <div className="space-y-4">
                  {selectedUser.coursesProgress.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">Користувач ще не почав жодного курсу</p>
                  ) : (
                    selectedUser.coursesProgress.map((course: any) => (
                      <div key={course.courseId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{course.title}</h5>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Уроків завершено:</span> {course.lessonsCompleted || 0}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Квізів пройдено:</span> {course.quizzesCompleted || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Середній бал:</span> {course.averageScore || 0}%
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Остання активність:</span> {course.lastActivity ? new Date(course.lastActivity).toLocaleDateString('uk-UA') : 'Невідомо'}
                              </p>
                            </div>
                          </div>
                          {course.isActive && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Активний курс
                              </span>
                            </div>
                          )}
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


