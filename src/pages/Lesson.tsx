import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function Lesson() {
  const { id } = useParams()
  const [completed, setCompleted] = useState(false)

  // Мокові дані для уроку
  const lesson = {
    id: id || '1',
    title: 'Вступ до React Patterns',
    course: 'React Advanced Patterns',
    type: 'text',
    content: `
      <h2>Що таке React Patterns?</h2>
      <p>React Patterns - це перевірені способи організації та структурування React коду, які допомагають створювати більш підтримувані, масштабовані та ефективні додатки.</p>
      
      <h3>Основні переваги використання патернів:</h3>
      <ul>
        <li><strong>Повторне використання коду</strong> - патерни дозволяють виносити спільну логіку в окремі компоненти або хуки</li>
        <li><strong>Підтримуваність</strong> - структурований код легше читати, розуміти та модифікувати</li>
        <li><strong>Тестування</strong> - патерни спрощують написання тестів та забезпечують кращу ізоляцію компонентів</li>
        <li><strong>Продуктивність</strong> - правильне використання патернів може значно покращити продуктивність додатку</li>
      </ul>
      
      <h3>Найпопулярніші React Patterns:</h3>
      <ol>
        <li><strong>Higher-Order Components (HOC)</strong> - функції, які приймають компонент і повертають новий компонент</li>
        <li><strong>Render Props</strong> - патерн, де компонент приймає функцію як пропс і викликає її для рендерингу</li>
        <li><strong>Custom Hooks</strong> - власні хуки для винесення логіки з компонентів</li>
        <li><strong>Compound Components</strong> - компоненти, які працюють разом для створення складного UI</li>
        <li><strong>Context API</strong> - для передачі даних через дерево компонентів без пропсів</li>
      </ol>
      
      <p>У цьому курсі ми детально розглянемо кожен з цих патернів, навчимося їх правильно використовувати та розуміти, коли який патерн застосовувати.</p>
    `
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={`/course/${lesson.id}`}>
                <Button variant="ghost">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Назад до курсу
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
                <p className="text-gray-600">{lesson.course}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Закладки
              </Button>
              <Button variant="ghost">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Поділитися
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-8">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Текстовий урок
                </span>
                <span>•</span>
                <span>15 хвилин читання</span>
              </div>
              
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Попередній урок
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {!completed ? (
                      <Button onClick={() => setCompleted(true)}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Позначити як завершений
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Завершено</span>
                      </div>
                    )}
                    
                    <Button>
                      Наступний урок
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <span className="text-sm text-gray-600">3/8 уроків</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: '37.5%' }} />
                </div>
              </div>
              
              <div className="space-y-3">
                {[
                  { id: 1, title: 'Вступ до React Patterns', completed: true, current: true },
                  { id: 2, title: 'Higher-Order Components', completed: false, current: false },
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
                Корисні посилання
              </h3>
              
              <div className="space-y-3">
                <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="font-medium text-gray-900">React Documentation</div>
                  <div className="text-sm text-gray-600">Офіційна документація React</div>
                </a>
                
                <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="font-medium text-gray-900">React Patterns</div>
                  <div className="text-sm text-gray-600">Колекція патернів React</div>
                </a>
                
                <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="font-medium text-gray-900">Code Examples</div>
                  <div className="text-sm text-gray-600">Приклади коду для практики</div>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Lesson