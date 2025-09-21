import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '../lib/contentful'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Progress } from '../components/ui/Progress'
import { AnimatedCounter } from '../components/AnimatedCounter'
import { useProgress } from '../features/progress/ProgressContext'
import { saveUserProfile, getUserProfile } from '../firebase'

export function Profile() {
  const { user } = useAuth()
  const { 
    totalLessonsCompleted, 
    totalQuizzesCompleted, 
    getCourseProgress,
    getCourseProgressPercentage,
    isCourseSaved,
    getCurrentStreak
  } = useProgress()
  const [isEditing, setIsEditing] = useState(false)
  const [activeCourseTab, setActiveCourseTab] = useState('active')
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: '',
    location: '',
    website: '',
    github: '',
    linkedin: ''
  })

  // Завантаження профілю з Firebase
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.uid) {
        console.log('🔄 Завантаження профілю для користувача:', user.uid)
        try {
          // Завантажуємо з Firebase
          const firebaseResult = await getUserProfile(user.uid)
          console.log('📥 Результат завантаження з Firebase:', firebaseResult)
          
          if (firebaseResult.success && firebaseResult.data) {
            const firebaseProfile = firebaseResult.data
            console.log('📋 Дані профілю з Firebase:', firebaseProfile)
            setProfileData(prev => ({
              ...prev,
              displayName: firebaseProfile.displayName || prev.displayName,
              bio: firebaseProfile.bio || prev.bio,
              location: firebaseProfile.location || prev.location,
              website: firebaseProfile.website || prev.website,
              github: firebaseProfile.github || prev.github,
              linkedin: firebaseProfile.linkedin || prev.linkedin,
              email: user?.email || prev.email // Email завжди з AuthContext
            }))
            console.log('✅ Профіль завантажено з Firebase')
          } else {
            console.log('⚠️ Профіль не знайдено в Firebase, використовуємо базові дані')
          }
        } catch (error) {
          console.log('❌ Помилка завантаження з Firebase:', error)
        }
      }
    }

    loadProfile()
  }, [user?.uid, user?.email])


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    if (user?.uid) {
      console.log('💾 Збереження профілю для користувача:', user.uid)
      try {
        // Зберігаємо тільки в Firebase
        const result = await saveUserProfile(user.uid, profileData)
        console.log('📤 Результат збереження в Firebase:', result)
        
        if (result.success) {
          setIsEditing(false)
          alert('Профіль успішно оновлено!')
          console.log('✅ Профіль збережено в Firebase')
        } else {
          alert('Помилка збереження профілю. Спробуйте ще раз.')
          console.log('❌ Помилка збереження в Firebase:', result.error)
        }
      } catch (error) {
        alert('Помилка збереження профілю. Перевірте підключення до інтернету.')
        console.log('❌ Помилка Firebase:', error)
      }
    }
  }


  // Завантаження курсів для розрахунку статистики
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
    staleTime: 0,
    gcTime: 0
  })

  // Реальна статистика на основі прогресу
  const stats = (() => {
    const completedCourses = courses.filter(course => {
      const progressData = getCourseProgress(course.id)
      return progressData?.isCompleted === true
    }).length

    const totalHours = Math.floor(totalLessonsCompleted * 1.5 + totalQuizzesCompleted * 0.5)
    const certificates = completedCourses // Сертифікат за кожен завершений курс
    
    // Розрахунок streak (днів поспіль) на основі реальної активності
    const currentStreak = getCurrentStreak()

    return {
      coursesCompleted: completedCourses,
      totalHours,
      certificates,
      currentStreak
    }
  })()

  // Реальні курси з Contentful та прогресом
  const allCourses = courses.map(course => {
    const progress = getCourseProgressPercentage(course.id)
    const progressData = getCourseProgress(course.id)
    
    // Debug: перевіряємо тип прогресу
    console.log('Course progress debug:', {
      courseId: course.id,
      progress,
      progressType: typeof progress,
      progressData
    })
    
    return {
      id: course.id,
      title: course.fields.title,
      progress: typeof progress === 'number' ? progress : 0,
      completed: progressData?.isCompleted === true
    }
  })

  // Фільтруємо курси за активним табом
  const filteredCourses = (() => {
    switch (activeCourseTab) {
      case 'active':
        return allCourses.filter(course => course.progress > 0 && course.progress < 100)
      case 'completed':
        return allCourses.filter(course => course.completed)
      case 'saved':
        return allCourses.filter(course => isCourseSaved(course.id)) // Збережені курси
      default:
        return allCourses
    }
  })()

  // Сортуємо за прогресом
  const recentCourses = filteredCourses.sort((a, b) => b.progress - a.progress)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative bg-white py-16 overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gray-100 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gray-50 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in text-black">
            Мій профіль
          </h1>
          <p className="text-xl text-black max-w-2xl mx-auto animate-fade-in-delay">
            Управляйте своїм профілем та переглядайте прогрес навчання
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="p-8 text-center shadow-large hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-6 flex items-center justify-center text-black text-4xl font-bold shadow-lg">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    name="displayName"
                    value={profileData.displayName}
                    onChange={handleInputChange}
                    placeholder="Ім'я"
                  />
                  <Input
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    disabled
                  />
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    placeholder="Про себе"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                  <Input
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    placeholder="Місцезнаходження"
                  />
                  <Input
                    name="website"
                    value={profileData.website}
                    onChange={handleInputChange}
                    placeholder="Веб-сайт"
                  />
                  <Input
                    name="github"
                    value={profileData.github}
                    onChange={handleInputChange}
                    placeholder="GitHub"
                  />
                  <Input
                    name="linkedin"
                    value={profileData.linkedin}
                    onChange={handleInputChange}
                    placeholder="LinkedIn"
                  />
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleSave} 
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Зберегти
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                    >
                      Скасувати
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {profileData.displayName || 'Користувач'}
                  </h2>
                  <p className="text-gray-600 mb-4">{profileData.email}</p>
                  <p className="text-gray-700 mb-6">{profileData.bio}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profileData.location}
                    </div>
                    {profileData.website && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <a href={profileData.website} className="text-primary-600 hover:underline">
                          {profileData.website}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => setIsEditing(true)} 
                    className="w-full bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Редагувати профіль
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <AnimatedCounter 
                  end={stats.coursesCompleted} 
                  className="text-3xl font-bold text-blue-600 mb-2"
                />
                <div className="text-sm text-gray-600">Завершених курсів</div>
      </Card>

              <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <AnimatedCounter 
                  end={stats.totalHours} 
                  className="text-3xl font-bold text-green-600 mb-2"
                />
                <div className="text-sm text-gray-600">Годин навчання</div>
              </Card>
              
              <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <AnimatedCounter 
                  end={stats.certificates} 
                  className="text-3xl font-bold text-purple-600 mb-2"
                />
                <div className="text-sm text-gray-600">Сертифікатів</div>
              </Card>
              
              <Card className="p-6 text-center bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <AnimatedCounter 
                  end={stats.currentStreak} 
                  className="text-3xl font-bold text-orange-600 mb-2"
                />
                <div className="text-sm text-gray-600">Днів поспіль</div>
          </Card>
            </div>

            {/* Recent Courses */}
            <Card className="p-8 shadow-large hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Мої курси
                </h3>
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>

              {/* Таби */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveCourseTab('active')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeCourseTab === 'active'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Активні ({allCourses.filter(c => c.progress > 0 && c.progress < 100).length})
                </button>
                <button
                  onClick={() => setActiveCourseTab('completed')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeCourseTab === 'completed'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Завершені ({allCourses.filter(c => c.completed).length})
                </button>
                <button
                  onClick={() => setActiveCourseTab('saved')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeCourseTab === 'saved'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Збережені ({allCourses.filter(c => isCourseSaved(c.id)).length})
                </button>
              </div>
              
              <div className="space-y-4">
                {recentCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {activeCourseTab === 'active' && 'Немає активних курсів'}
                      {activeCourseTab === 'completed' && 'Немає завершених курсів'}
                      {activeCourseTab === 'saved' && 'Немає збережених курсів'}
                    </h3>
                    <p className="text-gray-600">
                      {activeCourseTab === 'active' && 'Почніть навчання, щоб побачити активні курси'}
                      {activeCourseTab === 'completed' && 'Завершіть курси, щоб побачити їх тут'}
                      {activeCourseTab === 'saved' && 'Додайте курси до збережених, щоб побачити їх тут'}
                    </p>
                  </div>
                ) : (
                  recentCourses.map((course) => (
                  <Link 
                    key={course.id} 
                    to={`/courses/${course.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-3">
                          <Progress value={typeof course.progress === 'number' ? course.progress : 0} className="flex-1" />
                        <span className="text-sm font-medium text-gray-600 min-w-[3rem]">
                            {typeof course.progress === 'number' ? course.progress : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="ml-6">
                      {course.completed ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium">Завершено</span>
                        </div>
                      ) : (
                        <Button size="sm" className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white">
                          Продовжити
                        </Button>
                      )}
                    </div>
                    </div>
                  </Link>
                  ))
                )}
              </div>
              
              <div className="mt-8 text-center">
                <Link to="/catalog">
                <Button variant="ghost" className="text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                  Переглянути всі курси
                </Button>
                </Link>
              </div>
          </Card>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile