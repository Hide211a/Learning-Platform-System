import { Card } from '../components/ui/Card'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '../lib/contentful'
import { useProgress } from '../features/progress/ProgressContext'

export function About() {
  const { getCompletedStudentsCount, getCourseRating } = useProgress()
  
  // Отримуємо всі курси для підрахунку
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses
  })

  // Підраховуємо реальні дані
  const totalCourses = courses.length
  const totalStudents = courses.reduce((sum, course) => {
    return sum + getCompletedStudentsCount(course.id)
  }, 0)
  
  // Середній рейтинг всіх курсів
  const averageRating = courses.length > 0 
    ? Math.round(courses.reduce((sum, course) => {
        const rating = getCourseRating(course.id)
        return sum + (rating || 0)
      }, 0) / courses.length * 10) / 10
    : 0
  
  // Кількість задоволених студентів (рейтинг > 4.0)
  const satisfiedStudents = Math.round(totalStudents * (averageRating >= 4.0 ? 0.95 : averageRating / 5.0))
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-20 relative overflow-hidden">
        {/* Анімовані елементи фону */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-200 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/3 w-8 h-8 bg-indigo-200 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-32 right-10 w-14 h-14 bg-blue-300 rounded-full opacity-20 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            Про нашу платформу
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
            Ми створюємо найкращий досвід навчання для розробників, 
            дизайнерів та всіх, хто хоче розвиватися в IT-сфері.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Наша місія
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Ми віримо, що якісна освіта повинна бути доступною для всіх. 
            Наша платформа об'єднує найкращих викладачів, сучасні технології 
            та інтерактивні методи навчання, щоб допомогти вам досягти своїх цілей.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          <Card className="p-6 sm:p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Якісний контент
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Курси створені експертами індустрії з урахуванням останніх трендів та технологій.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Швидке навчання
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Інтерактивні уроки та практичні завдання для ефективного засвоєння матеріалу.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Спільнота
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Приєднуйтесь до активної спільноти студентів та отримуйте підтримку однолітків.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Сертифікати
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Отримуйте офіційні сертифікати після успішного завершення курсів.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Гнучкість
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Навчайтесь у зручному для вас темпі та в будь-який час.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Підтримка
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Наша команда завжди готова допомогти вам у навчанні.
            </p>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 mb-16 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-md transition-shadow">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {totalStudents > 0 ? `${totalStudents.toLocaleString()}+` : '0'}
              </div>
              <div className="text-sm sm:text-base text-gray-600">Студентів</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-md transition-shadow">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {totalCourses > 0 ? `${totalCourses}+` : '0'}
              </div>
              <div className="text-sm sm:text-base text-gray-600">Курсів</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-md transition-shadow">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                {averageRating > 0 ? `${averageRating}/5` : '0/5'}
              </div>
              <div className="text-sm sm:text-base text-gray-600">Середній рейтинг</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-md transition-shadow">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                {satisfiedStudents > 0 ? `${Math.round((satisfiedStudents / totalStudents) * 100)}%` : '0%'}
              </div>
              <div className="text-sm sm:text-base text-gray-600">Задоволених студентів</div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Наша команда
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Досвідчені професіонали, які працюють над створенням найкращого 
            досвіду навчання для вас.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="p-6 sm:p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                ОК
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Олексій Коваленко
              </h3>
              <p className="text-purple-600 font-medium mb-4">CTO</p>
              <p className="text-gray-600 text-sm sm:text-base">
                Експерт з веб-розробки та архітектури додатків.
              </p>
            </Card>

            <Card className="p-6 sm:p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                РС
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Роман Свінтозельський
              </h3>
              <p className="text-red-600 font-medium mb-4">CEO & Засновник</p>
              <p className="text-gray-600 text-sm sm:text-base">
                Засновник та керівник платформи навчання. Досвідчений IT-спеціаліст з багаторічним досвідом у сфері освіти та технологій.
              </p>
            </Card>

            <Card className="p-6 sm:p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                МП
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Марія Петренко
              </h3>
              <p className="text-green-600 font-medium mb-4">Head of Education</p>
              <p className="text-gray-600 text-sm sm:text-base">
                Спеціаліст з методології навчання та розробки курсів.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          {/* Декоративні елементи */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-blue-100 rounded-full opacity-30"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-purple-100 rounded-full opacity-40"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">
              Готові почати навчання?
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Приєднуйтесь до тисяч студентів, які вже розвивають свої навички з нами.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a 
                href="/catalog" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Переглянути курси
              </a>
              <a 
                href="/contact" 
                className="border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              >
                Зв'язатися з нами
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About