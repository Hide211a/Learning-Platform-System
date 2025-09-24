import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourseById, getLessonsByCourseId, getQuizzesByCourseId } from '../lib/contentful'
import { subscribeToCourseRatings } from '../firebase'
import { useProgress } from '../features/progress/ProgressContext'
import { useAuth } from '../features/auth/AuthContext'
import { useSettings } from '../features/settings/SettingsContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Progress } from '../components/ui/Progress'
import { TestimonialForm } from '../components/TestimonialForm'
import { Footer } from '../components/Footer'
import { CertificateGenerator } from '../components/CertificateGenerator'

export function Course() {
  const { courseId } = useParams()
  const { settings } = useSettings()
  const [activeTab, setActiveTab] = useState('overview')
  const [commentText, setCommentText] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')
  const [showCertificate, setShowCertificate] = useState(false)
  const { getCompletedStudentsCount, getCourseRating, getLessonProgress, quizResults, addComment, getCommentsByCourseId, subscribeToCourseComments, toggleSavedCourse, isCourseSaved, setFirestoreRatings } = useProgress()
  const { user } = useAuth()
  
  // Завантаження даних курсу з Contentful
  const { data: course, isLoading: courseLoading, isError: courseError } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId!),
    enabled: !!courseId,
    staleTime: 0, // Завжди оновлювати дані
    gcTime: 0 // Не кешувати дані
  })

  // Завантаження уроків курсу
  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => getLessonsByCourseId(courseId!),
    enabled: !!courseId
  })

  // Завантаження квізів курсу
  const { data: quizzes = [] } = useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: () => getQuizzesByCourseId(courseId!),
    enabled: !!courseId
  })

  // Окремо обробляємо уроки та квізи
  const courseLessons = lessons.map(lesson => {
    const lessonProgress = getLessonProgress(courseId || '', lesson.id)
    
       // Debug: перевіряємо duration з Contentful
       console.log('Lesson duration debug:', {
         lessonId: lesson.id,
         title: lesson.fields.title,
         durationFromContentful: lesson.fields.duration,
         duraionFromContentful: lesson.fields.duraion, // Помилка в Contentful
         finalDuration: lesson.fields.duration || lesson.fields.duraion || '45 хв'
       })
    
    return {
      id: lesson.id,
      title: lesson.fields.title,
      description: lesson.fields.description,
      duration: lesson.fields.duration || lesson.fields.duraion || '45 хв', // Використовуємо правильне поле // Використовуємо duration з Contentful
      completed: lessonProgress?.completed || false,
      type: 'video' as const,
      videoUrl: lesson.fields.videoUrl,
      order: lesson.fields.order
    }
  }).sort((a, b) => a.order - b.order)

  const courseQuizzes = quizzes.map(quiz => {
    const quizResult = quizResults.find(r => r.courseId === courseId && r.quizId === quiz.id)
    return {
      id: quiz.id,
      title: quiz.fields.title,
      description: quiz.fields.description,
      duration: quiz.fields.duration || '30 хв', // Використовуємо duration з Contentful
      completed: !!quizResult,
      type: 'quiz' as const,
      order: quiz.fields.order
    }
  }).sort((a, b) => a.order - b.order)

  // Реальна кількість студентів, які завершили курс
  const completedStudentsCount = courseId ? getCompletedStudentsCount(courseId, lessons.length, quizzes.length) : 0
  
  // Реальний рейтинг курсу (автоматично обчислюється)
  const courseRating = courseId ? getCourseRating(courseId) : 0


  // Функція для обробки рядків як масивів
  const parseStringToArray = (str: string | string[] | undefined): string[] => {
    if (!str) return []
    if (Array.isArray(str)) return str
    if (typeof str === 'string') {
      // Розділяємо по нових рядках або по символах розділення
      return str.split('\n').filter(item => item.trim().length > 0)
    }
    return []
  }

  const learningOutcomes = parseStringToArray(course?.fields?.learningOutcomes)
  const requirements = parseStringToArray(course?.fields?.requirements)


  // Розрахунок прогресу студента по курсу
  const userProgress = (() => {
    if (!courseId || (courseLessons.length === 0 && courseQuizzes.length === 0)) return 0
    
    // Використовуємо реальну кількість уроків та квізів з Contentful
    const totalLessons = courseLessons.length
    const totalQuizzes = courseQuizzes.length
    const totalItems = totalLessons + totalQuizzes
    
    if (totalItems === 0) return 0
    
    // Рахуємо завершені уроки
    const completedLessons = courseLessons.filter(lesson => {
      const lessonProgress = getLessonProgress(courseId, lesson.id)
      return lessonProgress?.completed || false
    }).length
    
    // Рахуємо завершені квізи
    const completedQuizzes = courseQuizzes.filter(quiz => {
      return quizResults.some(result => result.courseId === courseId && result.quizId === quiz.id)
    }).length
    
    const completedItems = completedLessons + completedQuizzes
    
    return Math.round((completedItems / totalItems) * 100)
  })()

  // Функція для навігації до уроку або квізу
  const handleStartLesson = (lesson: any) => {
    if (lesson.type === 'video') {
      // Навігація до сторінки уроку
      window.location.href = `/courses/${courseId}/lessons/${lesson.id}`
    } else if (lesson.type === 'quiz') {
      // Навігація до сторінки квізу
      window.location.href = `/courses/${courseId}/quizzes/${lesson.id}`
    }
  }

  // Підписка на коментарі курсу
  useEffect(() => {
    if (courseId) {
      const unsubscribe = subscribeToCourseComments(courseId)
      return unsubscribe
    }
  }, [courseId, subscribeToCourseComments])

  // Підписка на рейтинги курсу
  useEffect(() => {
    if (courseId) {
      // Підписуємося на рейтинги в реальному часі
      const unsubscribe = subscribeToCourseRatings(courseId, (ratings) => {
        // Оновлюємо рейтинги в контексті
        setFirestoreRatings(prev => {
          const otherRatings = prev.filter(r => r.courseId !== courseId)
          return [...otherRatings, ...ratings]
        })
      })
      
      return unsubscribe
    }
  }, [courseId])

  // Функція для додавання коментаря
  const handleAddComment = async () => {
    if (commentText.trim() && commentAuthor.trim() && courseId) {
      await addComment(courseId, commentText.trim(), commentAuthor.trim())
      setCommentText('')
      setCommentAuthor('')
    }
  }

  // Дані з Contentful (з fallback значеннями)
  const courseMeta = {
    instructor: course?.fields.instructor || 'Анна Марченко',
    duration: course?.fields.duration || '8 тижнів',
    rating: courseRating, // Автоматично обчислюється
    students: completedStudentsCount, // Автоматично обчислюється
    progress: userProgress // Динамічний прогрес студента
  }

  const tabs = [
    { id: 'overview', label: 'Огляд', icon: '📋' },
    { id: 'lessons', label: 'Уроки', icon: '📚' },
    { id: 'quizzes', label: 'Квізи', icon: '📝' },
    { id: 'resources', label: 'Ресурси', icon: '📁' },
    { id: 'reviews', label: 'Відгуки', icon: '⭐' },
    { id: 'discussions', label: 'Обговорення', icon: '💬' }
  ]

  // Обробка станів завантаження та помилок
  if (courseLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження курсу...</p>
        </div>
      </div>
    )
  }

  if (courseError || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Курс не знайдено</h3>
            <p className="text-gray-600 mb-4">Курс з таким ID не існує або був видалений.</p>
            <Link to="/catalog">
              <Button>Повернутися до каталогу</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Course Header */}
      <div className="relative overflow-hidden">
        {/* Background Image with Blur */}
        {course.fields.coverUrl ? (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${course.fields.coverUrl})`,
              filter: 'blur(20px)',
              transform: 'scale(1.1)'
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"></div>
        )}
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 via-gray-800/50 to-gray-900/70"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/8 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 text-sm text-white/80 mb-6">
                <Link to="/catalog" className="hover:text-white transition-colors">Курси</Link>
                <span>/</span>
                <span className="text-white">{course.fields.title}</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
                {course.fields.title}
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                {course.fields.description || 'Опис курсу буде додано найближчим часом.'}
              </p>
              
              <div className="flex flex-wrap gap-8">
                <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-800">{courseMeta.instructor}</span>
                </div>
                <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-800">{courseMeta.duration}</span>
                </div>
                {completedStudentsCount > 0 && courseRating > 0 ? (
                  <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-800">{courseMeta.rating} ({courseMeta.students} студентів)</span>
                </div>
                ) : (
                  <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-gray-800">Новий курс</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <Card className="p-8 bg-white/95 backdrop-blur-sm shadow-2xl border-0">
                <div className="text-center mb-8">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    Безкоштовно
                  </div>
                  <div className="text-sm text-black font-medium">Повний доступ до курсу</div>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                           <span className="text-sm font-semibold text-black">Прогрес курсу</span>
                           <span className="text-sm font-bold text-primary-600">{courseMeta.progress}%</span>
                  </div>
                  <div className="relative">
                           <Progress value={courseMeta.progress} className="h-3 rounded-full" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-200 to-secondary-200 rounded-full"></div>
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-1000"
                             style={{ width: `${courseMeta.progress}%` }}
                    ></div>
                  </div>
                         {userProgress > 0 && (() => {
                           const totalLessons = courseLessons.length
                           const totalQuizzes = courseQuizzes.length
                           const totalItems = totalLessons + totalQuizzes
                           
                           const completedLessons = courseLessons.filter(lesson => {
                             const lessonProgress = getLessonProgress(courseId || '', lesson.id)
                             return lessonProgress?.completed || false
                           }).length
                           
                           const completedQuizzes = courseQuizzes.filter(quiz => {
                             return quizResults.some(result => result.courseId === courseId && result.quizId === quiz.id)
                           }).length
                           
                           const completedItems = completedLessons + completedQuizzes
                           
                           return (
                             <div className="mt-2 text-xs text-gray-600 text-center">
                               {completedItems} з {totalItems} {totalItems === 1 ? 'уроку' : totalItems < 5 ? 'уроків' : 'уроків'} завершено
                             </div>
                           )
                         })()}
                </div>
                
                <div className="space-y-4">
                        <Button 
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          onClick={() => {
                            if (courseMeta.progress === 100) {
                              setShowCertificate(true)
                            } else {
                              // Переходимо на таб уроків
                              setActiveTab('lessons')
                              // Плавний скрол до табу уроків
                              setTimeout(() => {
                                const lessonsTab = document.querySelector('[data-tab="lessons"]')
                                if (lessonsTab) {
                                  lessonsTab.scrollIntoView({ 
                                    behavior: 'smooth', 
                                    block: 'start' 
                                  })
                                }
                              }, 100)
                            }
                          }}
                        >
                    <span className="flex items-center justify-center gap-2">
                            {courseMeta.progress === 0 ? 'Почати безкоштовно' : 
                             courseMeta.progress === 100 ? 'Курс завершено' : 
                             'Продовжити навчання'}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
            </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => courseId && toggleSavedCourse(courseId)}
                    className={`w-full border-2 font-semibold py-3 rounded-xl transition-all duration-200 ${
                      courseId && isCourseSaved(courseId)
                        ? 'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                        : 'border-gray-200 hover:border-primary-500 hover:bg-primary-50 text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill={courseId && isCourseSaved(courseId) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      {courseId && isCourseSaved(courseId) ? 'У закладках' : 'Додати до закладок'}
                    </span>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-black">Навігація</h3>
              </div>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                           className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all duration-200 relative ${
                      activeTab === tab.id
                               ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl transform scale-105 border-2 border-green-400'
                               : 'text-black hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 border border-gray-200 hover:border-green-300 hover:shadow-md'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span className="font-semibold">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
                   <div className="transition-all duration-300 ease-in-out">
            {activeTab === 'overview' && (
              <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h2 className="text-3xl font-bold text-black">
                    Огляд курсу
                  </h2>
                </div>
                
                <div className="prose max-w-none">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8">
                    <p className="text-lg text-black leading-relaxed">
                      {course.fields.overview || course.fields.description || 'Опис курсу буде додано найближчим часом.'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                        <span className="text-2xl">🎯</span>
                        Що ви вивчите:
                      </h3>
                      <ul className="space-y-3 text-black">
                        {learningOutcomes.length > 0 ? (
                          learningOutcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="text-green-500 mt-1">✓</span>
                              <span>{outcome}</span>
                            </li>
                          ))
                        ) : (
                          <>
                        <li className="flex items-start gap-3">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>Higher-Order Components (HOC)</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>Render Props патерн</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>Створення та використання Custom Hooks</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>Робота з Context API</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>Оптимізація продуктивності React додатків</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>Тестування React компонентів</span>
                        </li>
                          </>
                        )}
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                        <span className="text-2xl">📚</span>
                        Вимоги:
                      </h3>
                      <ul className="space-y-3 text-black">
                        {requirements.length > 0 ? (
                          requirements.map((requirement, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="text-orange-500 mt-1">•</span>
                              <span>{requirement}</span>
                            </li>
                          ))
                        ) : (
                          <>
                        <li className="flex items-start gap-3">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>Базові знання JavaScript ES6+</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>Досвід роботи з React (мінімум 6 місяців)</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>Розуміння компонентної архітектури</span>
                        </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Цільова аудиторія */}
                  {course.fields.targetAudience && (
                    <div className="mt-8">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                          <span className="text-2xl">🎯</span>
                          Цільова аудиторія:
                        </h3>
                        <p className="text-black leading-relaxed">
                          {course.fields.targetAudience}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {activeTab === 'lessons' && (
              <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm" data-tab="lessons">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-black">
                    Програма курсу
                  </h2>
                    <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full self-start sm:self-auto">
                      {courseLessons.filter(lesson => {
                        const lessonProgress = getLessonProgress(courseId || '', lesson.id)
                        return lessonProgress?.completed || false
                      }).length} з {courseLessons.length} уроків завершено
                    </div>
                  </div>
                </div>
                
                {lessonsLoading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-black">Завантаження уроків...</p>
                  </div>
                ) : courseLessons.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📚</span>
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">Уроки відсутні</h3>
                    <p className="text-black">Уроки для цього курсу будуть додані найближчим часом.</p>
                  </div>
                ) : (
                <div className="space-y-4">
                    {courseLessons.map((lesson, index) => (
                    <div 
                      key={lesson.id} 
                      className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                        lesson.completed 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                          : index > 0 && !courseLessons[index - 1].completed
                          ? 'bg-gray-50 border-gray-200 opacity-60'
                          : 'bg-white border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 gap-4 sm:gap-6">
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                            lesson.completed 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                              : index > 0 && !courseLessons[index - 1].completed
                              ? 'bg-gray-200 text-gray-500'
                              : 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 group-hover:from-primary-500 group-hover:to-primary-600 group-hover:text-white'
                          }`}>
                            {lesson.completed ? (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              index + 1
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-base sm:text-lg font-bold mb-2 transition-colors ${
                              lesson.completed ? 'text-green-800' : 'text-black group-hover:text-primary-600'
                            }`}>
                              {lesson.title}
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
                              <span className={`flex items-center gap-2 px-3 py-1 rounded-full font-medium ${
                                lesson.type === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {lesson.type === 'video' ? '📹' : '📝'}
                                {lesson.duration}
                              </span>
                              {lesson.completed && (
                                <span className="flex items-center gap-2 text-green-600 font-semibold">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  {(() => {
                                    const quizResult = quizResults.find(result => result.courseId === courseId && result.quizId === lesson.id)
                                    if (quizResult) {
                                      const score = quizResult.score // score вже в відсотках
                                      return `Завершено (${score}%)`
                                    }
                                    return 'Завершено'
                                  })()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                <Button 
                          size="sm" 
                          variant={lesson.completed ? "ghost" : "primary"}
                          disabled={!lesson.completed && index > 0 && !courseLessons[index - 1].completed}
                          onClick={() => handleStartLesson(lesson)}
                          className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 ${
                            lesson.completed 
                              ? 'border-2 border-green-300 text-green-700 hover:bg-green-50' 
                              : index > 0 && !courseLessons[index - 1].completed
                              ? 'opacity-50 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                          }`}
                        >
                          {lesson.completed ? 'Пройти знову' : 'Почати'}
                </Button>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </Card>
            )}

            {activeTab === 'quizzes' && (
              <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                {!settings?.features.quizzes ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🚫</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Квізи вимкнено</h3>
                    <p className="text-gray-600">Адміністратор вимкнув функцію квізів для цієї платформи.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl">
                        <span className="text-2xl">📝</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold text-black">
                          Тестування
                        </h2>
                        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {courseQuizzes.filter(quiz => {
                            return quizResults.some(result => result.courseId === courseId && result.quizId === quiz.id)
                          }).length} з {courseQuizzes.length} квізів завершено
                        </div>
                      </div>
                    </div>
                
                {courseQuizzes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📝</span>
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">Квізи відсутні</h3>
                    <p className="text-black">Тести для цього курсу будуть додані найближчим часом.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courseQuizzes.map((quiz) => {
                      const quizResult = quizResults.find(result => result.courseId === courseId && result.quizId === quiz.id)
                      const isCompleted = !!quizResult
                      const score = quizResult ? quizResult.score : 0 // score вже в відсотках
                      
                      return (
                        <div 
                          key={quiz.id} 
                          className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                            isCompleted 
                              ? 'bg-green-50 border-green-200 hover:border-green-300' 
                              : 'bg-white border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-6">
                              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 group-hover:from-green-500 group-hover:to-green-600 group-hover:text-white'
                                  : 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 group-hover:from-purple-500 group-hover:to-purple-600 group-hover:text-white'
                              }`}>
                                {isCompleted ? '✅' : '📝'}
                              </div>

                              <div className="flex-1">
                                <h3 className="text-lg font-bold mb-2 text-black group-hover:text-primary-600 transition-colors">
                                  {quiz.title}
                                </h3>
                                <div className="flex items-center gap-6 text-sm">
                                  <span className="flex items-center gap-2 px-3 py-1 rounded-full font-medium bg-purple-100 text-purple-800">
                                    📝
                                    {quiz.duration}
                                  </span>
                                  {isCompleted && (
                                    <span className="flex items-center gap-2 px-3 py-1 rounded-full font-medium bg-green-100 text-green-800">
                                      🎯
                                      {score}% ({Math.round(quizResult.score * quizResult.totalQuestions / 100)}/{quizResult.totalQuestions})
                                    </span>
                                  )}
                                </div>
                                {isCompleted && (
                                  <div className="mt-2 text-xs text-gray-600">
                                    Завершено: {new Date(quizResult.completedAt).toLocaleDateString('uk-UA', {
                                      day: 'numeric',
                                      month: 'long',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleStartLesson({ type: 'quiz', id: quiz.id })}
                              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                                isCompleted
                                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                                  : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
                              }`}
                            >
                              Пройти тестування
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                  </>
                )}
              </Card>
            )}

            {activeTab === 'resources' && (
              <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl">
                    <span className="text-2xl">📁</span>
                  </div>
                  <h2 className="text-3xl font-bold text-black">
                    Ресурси
                  </h2>
                </div>
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">Ресурси будуть доступні найближчим часом</h3>
                  <p className="text-black">Ми працюємо над додаванням корисних матеріалів для курсу</p>
                </div>
              </Card>
            )}

            {activeTab === 'reviews' && (
              <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                {!settings?.features.ratings ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🚫</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Рейтинги вимкнено</h3>
                    <p className="text-gray-600">Адміністратор вимкнув функцію рейтингів для цієї платформи.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl">
                        <span className="text-2xl">⭐</span>
                      </div>
                      <h2 className="text-3xl font-bold text-black">
                        Відгуки про курс
                      </h2>
                    </div>
                    
                    <div className="relative">
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                        <TestimonialForm courseId={courseId} />
                      </div>
                    </div>
                  </>
                )}
              </Card>
            )}

            {activeTab === 'discussions' && (
              <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h2 className="text-3xl font-bold text-black">
                    Обговорення
                  </h2>
                </div>
                
                {/* Форма для додавання коментаря */}
                <div className="mb-8">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-black mb-4">Додати коментар</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        placeholder="Ваше ім'я"
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <textarea 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={4}
                        placeholder="Поділіться своїми думками про курс..."
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleAddComment}
                          disabled={!commentText.trim() || !commentAuthor.trim()}
                          className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Опублікувати
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Список коментарів */}
                <div className="space-y-6">
                  {courseId && getCommentsByCourseId(courseId).length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">💬</span>
          </div>
                      <h3 className="text-lg font-semibold text-black mb-2">Поки що немає коментарів</h3>
                      <p className="text-gray-600">Станьте першим, хто поділиться своїми думками про цей курс!</p>
        </div>
                  ) : (
                    courseId && getCommentsByCourseId(courseId).map((comment) => (
                      <div key={comment.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {comment.author.charAt(0).toUpperCase()}
          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-black">{comment.author}</span>
                              <span className="text-sm text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString('uk-UA', {
                                  day: 'numeric',
                                  month: 'long',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {comment.content}
            </p>
          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                     </Card>
                   )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Сертифікат */}
      {showCertificate && course && (
        <CertificateGenerator
          courseTitle={course.fields.title}
          studentName={user?.displayName || user?.email?.split('@')[0] || 'Студент'}
          completionDate={new Date().toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
          onGenerate={() => setShowCertificate(false)}
        />
      )}
      
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Course