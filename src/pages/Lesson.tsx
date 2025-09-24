import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getLessonById, getLessonsByCourseId } from '../lib/contentful'
import { useProgress } from '../features/progress/ProgressContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { YouTubePlayer } from '../components/YouTubePlayer'

export function Lesson() {
  const { courseId, lessonId } = useParams()
  const { getLessonProgress, markLessonComplete } = useProgress()

  // Завантаження даних уроку з Contentful
  const { data: lesson, isLoading: lessonLoading, isError: lessonError } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => getLessonById(lessonId!),
    enabled: !!lessonId,
    staleTime: 0,
    gcTime: 0
  })

  // Завантаження всіх уроків курсу для сайдбару
  const { data: allLessons = [] } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => getLessonsByCourseId(courseId!),
    enabled: !!courseId
  })

  // Отримуємо прогрес поточного уроку
  const lessonProgress = lessonId && courseId ? getLessonProgress(courseId, lessonId) : null
  const isCompleted = lessonProgress?.completed || false

  // Debug: перевіряємо прогрес уроку
  console.log('Lesson progress debug:', {
    courseId,
    lessonId,
    lessonProgress,
    isCompleted,
    allProgress: lessonProgress
  })

  // Debug: перевіряємо дані з Contentful
  if (lesson) {
    console.log('Lesson data from Contentful:', {
      id: lesson.id,
      title: lesson.fields.title,
      videoUrl: lesson.fields.videoUrl,
      videoStartTime: lesson.fields.videoStartTime,
      videoEndTime: lesson.fields.videoEndTime,
      description: lesson.fields.description
    })
  }

  // Функція для позначення уроку як завершеного
  const handleMarkComplete = () => {
    if (lessonId && courseId) {
      markLessonComplete(courseId, lessonId)
    }
  }

  // Обробка станів завантаження та помилок
  if (lessonLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження уроку...</p>
        </div>
      </div>
    )
  }

  if (lessonError || !lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Урок не знайдено</h3>
            <p className="text-gray-600 mb-4">Урок з таким ID не існує або був видалений.</p>
            <Link to={`/courses/${courseId}`}>
              <Button>Повернутися до курсу</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-4">
            <Link to={`/courses/${courseId}`}>
              <Button variant="ghost" className="text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Назад до курсу</span>
                <span className="sm:hidden">Назад</span>
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{lesson.fields.title}</h1>
              <p className="text-sm sm:text-base text-gray-600">Урок {lesson.fields.order}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-4 sm:p-8">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Відео урок
                </span>
                <span>•</span>
                <span>YouTube</span>
              </div>
              
              {/* YouTube Video Player */}
              <div className="mb-6 w-full max-w-full overflow-hidden">
                {lesson.fields.videoUrl ? (
                  <YouTubePlayer 
                    videoInput={lesson.fields.videoUrl}
                    title={lesson.fields.title}
                    startTime={lesson.fields.videoStartTime}
                    endTime={lesson.fields.videoEndTime}
                  />
                ) : (
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Відео не налаштовано</h3>
                    <p className="text-gray-600">Для цього уроку не вказано URL відео в Contentful.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Перевірте поле "videoUrl" в Contentful для уроку: {lesson.fields.title}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Lesson Description */}
              {lesson.fields.description && (
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Опис уроку</h3>
                  <p className="text-gray-700 leading-relaxed">{lesson.fields.description}</p>
                </div>
              )}
              
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Button variant="ghost" className="text-sm sm:text-base">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="hidden sm:inline">Попередній урок</span>
                      <span className="sm:hidden">Попередній</span>
                    </Button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                    {!isCompleted ? (
                      <Button 
                        onClick={handleMarkComplete}
                        className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 text-sm sm:text-base"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="hidden sm:inline">Позначити як завершений</span>
                        <span className="sm:hidden">Завершити</span>
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-green-600 text-sm sm:text-base">Завершено</span>
                      </div>
                    )}
                    
                    <Button className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 text-sm sm:text-base">
                      <span className="hidden sm:inline">Наступний урок</span>
                      <span className="sm:hidden">Наступний</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Прогрес курсу
              </h3>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Завершено</span>
                  <span className="text-sm text-gray-600">
                    {allLessons.filter(l => {
                      const progress = getLessonProgress(courseId || '', l.id)
                      return progress?.completed
                    }).length}/{allLessons.length} уроків
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${allLessons.length > 0 ? (allLessons.filter(l => {
                        const progress = getLessonProgress(courseId || '', l.id)
                        return progress?.completed
                      }).length / allLessons.length) * 100 : 0}%` 
                    }} 
                  />
                </div>
              </div>

              
              <div className="space-y-3">
                {allLessons.map((item) => {
                  const progress = getLessonProgress(courseId || '', item.id)
                  const isCurrent = item.id === lessonId
                  const isCompleted = progress?.completed || false
                  
                  return (
                    <Link
                    key={item.id}
                      to={`/courses/${courseId}/lessons/${item.id}`}
                      className={`block p-3 rounded-lg cursor-pointer transition-colors ${
                        isCurrent
                        ? 'bg-primary-100 text-primary-700'
                          : isCompleted
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          isCompleted
                          ? 'bg-green-100 text-green-800'
                            : isCurrent
                          ? 'bg-primary-200 text-primary-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                          {isCompleted ? '✓' : item.fields.order}
                        </div>
                        <span className="text-sm font-medium">{item.fields.title}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Lesson