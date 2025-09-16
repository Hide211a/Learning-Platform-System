import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Progress } from '../components/ui/Progress'

export function Course() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('overview')

  // Мокові дані для курсу
  const course = {
    id: id || '1',
    title: 'React Advanced Patterns',
    description: 'Вивчіть найкращі практики та патерни розробки на React для створення масштабованих додатків.',
    instructor: 'Анна Марченко',
    duration: '8 тижнів',
    level: 'Просунутий',
    rating: 4.8,
    students: 1250,
    price: 2999,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    progress: 65
  }

  const lessons = [
    { id: 1, title: 'Вступ до React Patterns', duration: '45 хв', completed: true, type: 'video' },
    { id: 2, title: 'Higher-Order Components', duration: '60 хв', completed: true, type: 'video' },
    { id: 3, title: 'Render Props Pattern', duration: '50 хв', completed: true, type: 'video' },
    { id: 4, title: 'Custom Hooks', duration: '55 хв', completed: false, type: 'video' },
    { id: 5, title: 'Context API', duration: '40 хв', completed: false, type: 'video' },
    { id: 6, title: 'Performance Optimization', duration: '70 хв', completed: false, type: 'video' },
    { id: 7, title: 'Тест: React Patterns', duration: '30 хв', completed: false, type: 'quiz' },
    { id: 8, title: 'Практичне завдання', duration: '120 хв', completed: false, type: 'assignment' }
  ]

  const tabs = [
    { id: 'overview', label: 'Огляд', icon: '📋' },
    { id: 'lessons', label: 'Уроки', icon: '📚' },
    { id: 'resources', label: 'Ресурси', icon: '📁' },
    { id: 'discussions', label: 'Обговорення', icon: '💬' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Course Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Link to="/catalog" className="hover:text-primary-600">Курси</Link>
                <span>/</span>
                <span>{course.title}</span>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6">
                {course.description}
              </p>
              
              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {course.instructor}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.duration}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {course.rating} ({course.students} студентів)
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <Card className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    ₴{course.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Одноразовий платіж</div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Прогрес</span>
                    <span className="text-sm text-gray-600">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                </div>
                
                <div className="space-y-3">
                  <Button className="w-full">
                    Продовжити навчання
            </Button>
                  <Button variant="ghost" className="w-full">
                    Додати до закладок
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
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

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Огляд курсу</h2>
                
                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-6">
                    Цей курс призначений для розробників, які вже мають базові знання React і хочуть 
                    поглибити своє розуміння найкращих практик та патернів розробки.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Що ви вивчите:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                    <li>Higher-Order Components (HOC)</li>
                    <li>Render Props патерн</li>
                    <li>Створення та використання Custom Hooks</li>
                    <li>Робота з Context API</li>
                    <li>Оптимізація продуктивності React додатків</li>
                    <li>Тестування React компонентів</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Вимоги:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Базові знання JavaScript ES6+</li>
                    <li>Досвід роботи з React (мінімум 6 місяців)</li>
                    <li>Розуміння компонентної архітектури</li>
                  </ul>
                </div>
              </Card>
            )}

            {activeTab === 'lessons' && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Програма курсу</h2>
                
                <div className="space-y-4">
                  {lessons.map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          lesson.completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {lesson.completed ? '✓' : index + 1}
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              {lesson.type === 'video' && '📹'}
                              {lesson.type === 'quiz' && '📝'}
                              {lesson.type === 'assignment' && '📋'}
                              {lesson.duration}
                            </span>
                            {lesson.completed && (
                              <span className="text-green-600 font-medium">Завершено</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                    <Button 
                        size="sm" 
                        variant={lesson.completed ? "ghost" : "primary"}
                        disabled={!lesson.completed && index > 0 && !lessons[index - 1].completed}
                      >
                        {lesson.completed ? 'Переглянути' : 'Почати'}
                    </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === 'resources' && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Ресурси</h2>
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600">Ресурси будуть доступні найближчим часом</p>
                </div>
              </Card>
            )}

            {activeTab === 'discussions' && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Обговорення</h2>
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-gray-600">Форум обговорень буде доступний найближчим часом</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Course