import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getQuizById } from '../lib/contentful'
import { useProgress } from '../features/progress/ProgressContext'

export function Quiz() {
  const { courseId, quizId } = useParams()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const { saveQuizResult } = useProgress()

  // Завантаження квізу з Contentful
  const { data: quiz, isLoading, isError } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuizById(quizId!),
    enabled: !!quizId,
    staleTime: 0,
    gcTime: 0
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Завантаження квізу...</p>
          </Card>
        </div>
      </div>
    )
  }

  if (isError || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Квіз не знайдено</h1>
            <p className="text-gray-600 mb-6">На жаль, цей квіз не існує або був видалений.</p>
            <Link to={`/courses/${courseId}`}>
              <Button className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
                Повернутися до курсу
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  const questions = quiz.fields.questions || []

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Завершуємо квіз та зберігаємо результат
      const correctAnswers = calculateScore()
      const scorePercentage = Math.round((correctAnswers / questions.length) * 100)
      
      if (courseId && quizId) {
        saveQuizResult(
          courseId,
          quizId,
          scorePercentage,  // Зберігаємо відсоток, а не кількість правильних відповідей
          questions.length,
          answers
        )
      }
      
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach(question => {
      const userAnswer = answers[question.id]
      
      // Debug логування
      console.log('Question debug:', {
        id: question.id,
        type: question.type,
        userAnswer,
        correctAnswer: question.correctAnswer,
        correctAnswers: question.correctAnswers
      })
      
      if (question.type === 'single') {
        // Для single використовуємо correctAnswer (без 's')
        if (userAnswer === question.correctAnswer) {
          correct++
          console.log('✅ Single answer correct')
        } else {
          console.log('❌ Single answer wrong:', { userAnswer, correctAnswer: question.correctAnswer })
        }
      } else if (question.type === 'text') {
        // Для text також використовуємо correctAnswer
        if (userAnswer?.toLowerCase() === question.correctAnswer?.toLowerCase()) {
          correct++
          console.log('✅ Text answer correct')
        } else {
          console.log('❌ Text answer wrong:', { userAnswer, correctAnswer: question.correctAnswer })
        }
      } else if (question.type === 'multiple') {
        // Для multiple використовуємо correctAnswers (з 's')
        const userAnswers = userAnswer?.split(',') || []
        const correctAnswers = question.correctAnswers || []
        if (userAnswers.length === correctAnswers.length && 
            userAnswers.every(answer => correctAnswers.includes(answer))) {
          correct++
          console.log('✅ Multiple answers correct')
        } else {
          console.log('❌ Multiple answers wrong:', { userAnswers, correctAnswers })
        }
      }
    })
    
    console.log('Final score:', { correct, total: questions.length })
    return correct
  }

  if (showResults) {
    const score = calculateScore()
    const percentage = Math.round((score / questions.length) * 100)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Тест завершено!
            </h1>
            
            <div className="text-6xl font-bold text-primary-600 mb-4">
              {percentage}%
            </div>
            
            <p className="text-xl text-gray-600 mb-8">
              Ви відповіли правильно на {score} з {questions.length} питань
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => {
                  setCurrentQuestion(0)
                  setAnswers({})
                  setShowResults(false)
                }}
                className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                Пройти знову
            </Button>
              <Link to={`/courses/${courseId}`}>
                <Button 
                  variant="ghost"
                  className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Повернутися до курсу
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Питання {currentQuestion + 1} з {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {question.text}
          </h2>

          {question.type === 'single' && (
            <div className="space-y-4">
              {question.options?.map((option, index) => (
                <label key={index} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name={question.id}
                  value={option}
                    checked={answers[question.id] === option}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'multiple' && (
            <div className="space-y-4">
              {question.options?.map((option, index) => (
                <label key={index} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    name={question.id}
                    value={option}
                    checked={answers[question.id]?.includes(option) || false}
                      onChange={(e) => {
                      const currentAnswers = answers[question.id]?.split(',') || []
                      if (e.target.checked) {
                        currentAnswers.push(option)
                      } else {
                        const index = currentAnswers.indexOf(option)
                        if (index > -1) {
                          currentAnswers.splice(index, 1)
                        }
                      }
                      handleAnswerChange(question.id, currentAnswers.join(','))
                    }}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-3 text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'text' && (
            <div>
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder="Введіть вашу відповідь..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
          )}

          <div className="flex justify-between mt-8">
        <Button
              variant="ghost" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Попереднє
        </Button>
            
          <Button
              onClick={handleNext}
              disabled={!answers[question.id]}
              className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
              {currentQuestion === questions.length - 1 ? 'Завершити тест' : 'Наступне'}
          </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Quiz