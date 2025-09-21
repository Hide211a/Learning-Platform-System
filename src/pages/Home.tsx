import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import { useProgress } from '../features/progress/ProgressContext'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '../lib/contentful'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Progress } from '../components/ui/Progress'
import { Footer } from '../components/Footer'

// Анімований лічильник
function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let startTime: number
    const startCount = 0
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(startCount + (end - startCount) * easeOutQuart))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [end, duration])
  
  return <span>{count}</span>
}

// Skeleton loader для курсів - New Design
function CourseSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-video bg-gray-200"></div>
      <div className="p-6">
        <div className="h-4 w-20 bg-gray-200 rounded-full mb-3"></div>
        <div className="h-6 bg-gray-200 rounded mb-3"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-6 w-3/4"></div>
        <div className="h-12 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  )
}

export function Home() {
  const { user } = useAuth()
  const { quizResults, lessonProgress } = useProgress()
  const { data: courses, isLoading: coursesLoading, isError: coursesError } = useQuery({ 
    queryKey: ['courses'], 
    queryFn: getCourses 
  })

  const totalLessonsCompleted = Object.values(lessonProgress).filter(p => p.completed).length
  const totalQuizzesCompleted = quizResults.length
  const featuredCourses = courses?.slice(0, 4) || []
  
  // Курси для продовження навчання (на основі завершених уроків)
  const continueLearning = courses?.filter(course => {
    const courseLessons = Object.values(lessonProgress).filter(lesson => lesson.courseId === course.id)
    const completedLessons = courseLessons.filter(lesson => lesson.completed)
    return completedLessons.length > 0 && completedLessons.length < courseLessons.length
  }).slice(0, 2) || []

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="bg-white">
      {/* Hero Section - New Minimalist Design */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            Нова платформа навчання
          </div>
          
          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Навчайся
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              ефективно
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            Інтерактивні курси, персоналізоване навчання та детальна аналітика прогресу в одному місці
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4">
            <Link to={user ? "/catalog" : "/auth"}>
              <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
                Розпочати навчання
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => scrollToSection('features')}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full w-full sm:w-auto"
            >
              Дізнатися більше
            </Button>
          </div>

          {/* Stats - New Design */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto px-4">
            <div className="text-center group">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors duration-300">
                <AnimatedCounter end={courses?.length || 0} />
                <span className="text-xl sm:text-2xl md:text-3xl">+</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">Курсів</div>
            </div>
            <div className="text-center group">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-purple-600 transition-colors duration-300">
                <AnimatedCounter end={totalLessonsCompleted} />
                <span className="text-xl sm:text-2xl md:text-3xl">+</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">Уроків</div>
            </div>
            <div className="text-center group">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-pink-600 transition-colors duration-300">
                <AnimatedCounter end={totalQuizzesCompleted} />
                <span className="text-xl sm:text-2xl md:text-3xl">+</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">Тестів</div>
            </div>
          </div>
        </div>
      </section>

      {/* Continue Learning Section - Only for logged in users */}
      {user && continueLearning.length > 0 && (
        <section className="py-16 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
                Продовжити навчання
              </h2>
              <p className="text-lg text-gray-600">
                Поверніться до курсів, які ви вже почали
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {continueLearning.map((course) => {
                const courseLessons = Object.values(lessonProgress).filter(lesson => lesson.courseId === course.id)
                const completedLessons = courseLessons.filter(lesson => lesson.completed)
                const progress = courseLessons.length > 0 ? (completedLessons.length / courseLessons.length) * 100 : 0
                return (
                  <Card key={course.id} hover className="overflow-hidden h-full">
                    <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center relative">
                      <img 
                        src={course.fields.coverUrl || 'https://via.placeholder.com/400x200?text=Course'}
                        alt={course.fields.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
                        {Math.round(progress)}%
                      </div>
                    </div>
                    <div className="p-6 flex flex-col h-full">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {course.fields.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                        {course.fields.description}
                      </p>
                      <div className="mb-4">
                        <Progress value={progress} className="mb-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Прогрес</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <Link to={`/courses/${course.id}`}>
                          <Button fullWidth className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700">
                            Продовжити курс
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Features Section - New Design */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Чому обирають нас
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Сучасні технології навчання для максимальної ефективності
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
            {[
              {
                icon: '🎯',
                title: 'Персоналізоване навчання',
                description: 'Адаптивні курси, які підлаштовуються під ваш темп та рівень знань',
                color: 'blue'
              },
              {
                icon: '📱',
                title: 'Доступність 24/7',
                description: 'Навчайтесь з будь-якого пристрою в зручний для вас час',
                color: 'purple'
              },
              {
                icon: '📊',
                title: 'Детальна аналітика',
                description: 'Відстежуйте прогрес та отримуйте рекомендації для покращення',
                color: 'pink'
              },
              {
                icon: '🚀',
                title: 'Швидкий результат',
                description: 'Ефективні методики навчання для досягнення цілей',
                color: 'green'
              }
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="flex items-start space-x-4 sm:space-x-6">
                  <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-${feature.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-lg sm:text-xl md:text-2xl">{feature.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-gray-700 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section - New Design */}
      <section className="py-16 sm:py-20 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Популярні курси
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              Оберіть курс, який відповідає вашим цілям та рівню підготовки
            </p>
            <Link to="/catalog">
              <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 rounded-full px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base">
                Переглянути всі курси
              </Button>
            </Link>
          </div>
          
          {coursesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <CourseSkeleton key={index} />
              ))}
            </div>
          ) : coursesError ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😞</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Не вдалося завантажити курси</h3>
              <p className="text-gray-600 mb-4">Спробуйте оновити сторінку або перевірте підключення до інтернету</p>
              <Button onClick={() => window.location.reload()} className="bg-primary-500 hover:bg-primary-600">
                Оновити сторінку
              </Button>
            </div>
          ) : featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <div key={course.id} className="group h-full">
                  <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                      <img 
                        src={course.fields.coverUrl || 'https://via.placeholder.com/400x200?text=Course'}
                        alt={course.fields.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      {course.fields.level && (
                        <div className="mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {course.fields.level}
                          </span>
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors duration-300 line-clamp-2">
                        {course.fields.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                        {course.fields.description}
                      </p>
                      <div className="mt-auto">
                        <Link to={`/courses/${course.id}`}>
                          <Button fullWidth className="bg-gray-900 text-white hover:bg-gray-800 rounded-full py-3 font-semibold transition-all duration-300 group-hover:shadow-lg">
                            Почати курс
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Курси скоро з'являться</h3>
              <p className="text-gray-600">Ми працюємо над додаванням нових курсів</p>
            </div>
          )}
        </div>
      </section>

      {/* Final CTA Section - New Design */}
      <section className="py-16 sm:py-20 md:py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Готовий почати
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              навчання?
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            Приєднуйся до тисяч студентів, які вже розпочали свій шлях до нових знань
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link to={user ? "/catalog" : "/auth"}>
              <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
                {user ? "Перейти до курсів" : "Зареєструватися безкоштовно"}
              </Button>
            </Link>
              
            {!user && (
              <Link to="/auth">
                <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full w-full sm:w-auto">
                  Увійти в акаунт
                </Button>
              </Link>
            )}
          </div>
          
          {/* Trust indicators - Dynamic data */}
          <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Наша платформа в цифрах</p>
            <div className="flex justify-center items-center space-x-4 sm:space-x-6 md:space-x-8 opacity-60">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-400">
                <AnimatedCounter end={courses?.length || 0} />+
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-400">
                <AnimatedCounter end={totalLessonsCompleted} />+
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-400">
                <AnimatedCounter end={totalQuizzesCompleted} />+
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Home
