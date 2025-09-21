
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function CourseVideo() {
  const { id } = useParams()
  const [isPlaying, setIsPlaying] = useState(false)

  // Мокові дані
  const lesson = {
    id: id || '1',
    title: 'Higher-Order Components',
    course: 'React Advanced Patterns',
    duration: '60 хвилин',
    description: 'Вивчіть, як використовувати Higher-Order Components для повторного використання логіки між компонентами.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Заглушка
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-black text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/course/${lesson.id}`}>
              <Button variant="ghost" className="text-white hover:bg-gray-800">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад до курсу
          </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">{lesson.title}</h1>
              <p className="text-gray-400">{lesson.course}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white hover:bg-gray-800">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
              Налаштування
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Video Player */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="aspect-video bg-black relative">
              {isPlaying ? (
                <iframe
                  src={lesson.videoUrl}
                  title={lesson.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
                  >
                    <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {lesson.title}
              </h2>
              <p className="text-gray-600 mb-6">
                {lesson.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {lesson.duration}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Відео урок
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Програма курсу
            </h3>
            
            <div className="space-y-3">
              {[
                { id: 1, title: 'Вступ до React Patterns', completed: true, current: false },
                { id: 2, title: 'Higher-Order Components', completed: false, current: true },
                { id: 3, title: 'Render Props Pattern', completed: false, current: false },
                { id: 4, title: 'Custom Hooks', completed: false, current: false },
                { id: 5, title: 'Context API', completed: false, current: false },
                { id: 6, title: 'Performance Optimization', completed: false, current: false }
              ].map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    item.current
                      ? 'bg-primary-100 text-primary-700'
                      : item.completed
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      item.completed
                        ? 'bg-green-100 text-green-800'
                        : item.current
                        ? 'bg-primary-200 text-primary-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {item.completed ? '✓' : item.id}
                    </div>
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Швидкі дії
            </h3>
            
            <div className="space-y-3">
              <Button variant="ghost" className="w-full justify-start">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Додати до закладок
              </Button>
              
              <Button variant="ghost" className="w-full justify-start">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Поділитися
              </Button>
              
              <Button variant="ghost" className="w-full justify-start">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Задати питання
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CourseVideo