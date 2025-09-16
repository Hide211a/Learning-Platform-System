import { Card } from '../components/ui/Card'

export function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Про нашу платформу
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="p-8 text-center hover-lift">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Якісний контент
            </h3>
            <p className="text-gray-600">
              Курси створені експертами індустрії з урахуванням останніх трендів та технологій.
            </p>
          </Card>

          <Card className="p-8 text-center hover-lift">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Швидке навчання
            </h3>
            <p className="text-gray-600">
              Інтерактивні уроки та практичні завдання для ефективного засвоєння матеріалу.
            </p>
          </Card>

          <Card className="p-8 text-center hover-lift">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Спільнота
            </h3>
            <p className="text-gray-600">
              Приєднуйтесь до активної спільноти студентів та отримуйте підтримку однолітків.
            </p>
          </Card>

          <Card className="p-8 text-center hover-lift">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Сертифікати
            </h3>
            <p className="text-gray-600">
              Отримуйте офіційні сертифікати після успішного завершення курсів.
            </p>
          </Card>

          <Card className="p-8 text-center hover-lift">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Гнучкість
            </h3>
            <p className="text-gray-600">
              Навчайтесь у зручному для вас темпі та в будь-який час.
            </p>
          </Card>

          <Card className="p-8 text-center hover-lift">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Підтримка
            </h3>
            <p className="text-gray-600">
              Наша команда завжди готова допомогти вам у навчанні.
            </p>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-large p-12 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">10,000+</div>
              <div className="text-gray-600">Студентів</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Курсів</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600">Викладачів</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">95%</div>
              <div className="text-gray-600">Задоволених студентів</div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Наша команда
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Досвідчені професіонали, які працюють над створенням найкращого 
            досвіду навчання для вас.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">
                АМ
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Анна Марченко
              </h3>
              <p className="text-primary-600 mb-4">CEO & Засновник</p>
              <p className="text-gray-600">
                10+ років досвіду в IT-освіті та управлінні проектами.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">
                ОК
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Олексій Коваленко
              </h3>
              <p className="text-primary-600 mb-4">CTO</p>
              <p className="text-gray-600">
                Експерт з веб-розробки та архітектури додатків.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">
                МП
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Марія Петренко
              </h3>
              <p className="text-primary-600 mb-4">Head of Education</p>
              <p className="text-gray-600">
                Спеціаліст з методології навчання та розробки курсів.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-6">
            Готові почати навчання?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Приєднуйтесь до тисяч студентів, які вже розвивають свої навички з нами.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/catalog" 
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Переглянути курси
            </a>
            <a 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Зв'язатися з нами
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About