import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { useAuth } from '../auth/AuthContext'

export type LessonProgress = {
  courseId: string
  lessonId: string
  completed: boolean
  completedAt?: Date
  timeSpent: number // in seconds
}

export type QuizResult = {
  courseId: string
  quizId: string
  score: number
  totalQuestions: number
  completedAt: Date
  answers: Record<string, string | string[]>
}

export type CourseProgress = {
  courseId: string
  totalLessons: number
  completedLessons: number
  totalQuizzes: number
  completedQuizzes: number
  averageQuizScore: number
  lastAccessed: Date
}

type ProgressContextValue = {
  lessonProgress: Record<string, LessonProgress>
  quizResults: QuizResult[]
  courseProgress: Record<string, CourseProgress>
  markLessonComplete: (courseId: string, lessonId: string, timeSpent?: number) => void
  unmarkLessonComplete: (courseId: string, lessonId: string) => void
  saveQuizResult: (courseId: string, quizId: string, score: number, totalQuestions: number, answers: Record<string, string | string[]>) => void
  removeQuizResult: (courseId: string, quizId: string) => void
  getLessonProgress: (courseId: string, lessonId: string) => LessonProgress | null
  getCourseProgress: (courseId: string) => CourseProgress | null
  isLoading: boolean
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined)

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({})
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load progress from localStorage on mount
  useEffect(() => {
    if (!user) {
      setLessonProgress({})
      setQuizResults([])
      setIsLoading(false)
      return
    }

    // Використовуємо requestIdleCallback для неблокуючого завантаження
    const loadProgress = () => {
      try {
        const savedProgress = localStorage.getItem(`progress_${user.uid}`)
        const savedQuizResults = localStorage.getItem(`quizResults_${user.uid}`)
        
        if (savedProgress) {
          const parsed = JSON.parse(savedProgress)
          // Оптимізуємо конвертацію дат
          const progressEntries = Object.entries(parsed)
          for (const [key, value] of progressEntries) {
            if ((value as any).completedAt) {
              (value as any).completedAt = new Date((value as any).completedAt)
            }
          }
          setLessonProgress(parsed)
        }
        
        if (savedQuizResults) {
          const parsed = JSON.parse(savedQuizResults)
          // Оптимізуємо конвертацію дат для quiz results
          const results = []
          for (const result of parsed) {
            results.push({
              ...result,
              completedAt: new Date(result.completedAt)
            })
          }
          setQuizResults(results)
        }
      } catch (error) {
        console.error('Error loading progress:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Використовуємо requestIdleCallback якщо доступний, інакше setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadProgress)
    } else {
      setTimeout(loadProgress, 0)
    }
  }, [user])

  // Debounced save to localStorage to prevent excessive writes
  useEffect(() => {
    if (!user || isLoading) return
    
    const timeoutId = setTimeout(() => {
      // Використовуємо requestIdleCallback для неблокуючого збереження
      const saveProgress = () => {
        try {
          localStorage.setItem(`progress_${user.uid}`, JSON.stringify(lessonProgress))
        } catch (error) {
          console.error('Error saving progress:', error)
        }
      }

      if ('requestIdleCallback' in window) {
        requestIdleCallback(saveProgress)
      } else {
        setTimeout(saveProgress, 0)
      }
    }, 300) // Debounce by 300ms

    return () => clearTimeout(timeoutId)
  }, [lessonProgress, user, isLoading])

  useEffect(() => {
    if (!user || isLoading) return
    
    const timeoutId = setTimeout(() => {
      // Використовуємо requestIdleCallback для неблокуючого збереження
      const saveQuizResults = () => {
        try {
          localStorage.setItem(`quizResults_${user.uid}`, JSON.stringify(quizResults))
        } catch (error) {
          console.error('Error saving quiz results:', error)
        }
      }

      if ('requestIdleCallback' in window) {
        requestIdleCallback(saveQuizResults)
      } else {
        setTimeout(saveQuizResults, 0)
      }
    }, 300) // Debounce by 300ms

    return () => clearTimeout(timeoutId)
  }, [quizResults, user, isLoading])

  const markLessonComplete = (courseId: string, lessonId: string, timeSpent: number = 0) => {
    const key = `${courseId}_${lessonId}`
    setLessonProgress(prev => ({
      ...prev,
      [key]: {
        courseId,
        lessonId,
        completed: true,
        completedAt: new Date(),
        timeSpent
      }
    }))
  }

  const unmarkLessonComplete = (courseId: string, lessonId: string) => {
    const key = `${courseId}_${lessonId}`
    setLessonProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[key]
      return newProgress
    })
  }

  const saveQuizResult = (courseId: string, quizId: string, score: number, totalQuestions: number, answers: Record<string, string | string[]>) => {
    const result: QuizResult = {
      courseId,
      quizId,
      score,
      totalQuestions,
      completedAt: new Date(),
      answers
    }
    
    setQuizResults(prev => {
      // Remove any existing result for this quiz
      const filtered = prev.filter(r => !(r.courseId === courseId && r.quizId === quizId))
      return [...filtered, result]
    })
  }

  const removeQuizResult = (courseId: string, quizId: string) => {
    setQuizResults(prev => prev.filter(r => !(r.courseId === courseId && r.quizId === quizId)))
  }

  const getLessonProgress = (courseId: string, lessonId: string): LessonProgress | null => {
    const key = `${courseId}_${lessonId}`
    return lessonProgress[key] || null
  }

  const getCourseProgress = useMemo(() => {
    return (courseId: string): CourseProgress | null => {
      const courseLessons = Object.values(lessonProgress).filter(p => p.courseId === courseId)
      const courseQuizzes = quizResults.filter(r => r.courseId === courseId)
      
      if (courseLessons.length === 0 && courseQuizzes.length === 0) {
        return null
      }

      const completedLessons = courseLessons.filter(p => p.completed).length
      const completedQuizzes = courseQuizzes.length
      
      // Оптимізуємо обчислення середнього балу
      let averageQuizScore = 0
      if (courseQuizzes.length > 0) {
        let totalScore = 0
        for (const quiz of courseQuizzes) {
          totalScore += quiz.score / quiz.totalQuestions
        }
        averageQuizScore = (totalScore / courseQuizzes.length) * 100
      }

      // Оптимізуємо обчислення останнього доступу
      let lastAccessed = 0
      for (const lesson of courseLessons) {
        if (lesson.completedAt) {
          lastAccessed = Math.max(lastAccessed, lesson.completedAt.getTime())
        }
      }
      for (const quiz of courseQuizzes) {
        lastAccessed = Math.max(lastAccessed, quiz.completedAt.getTime())
      }

      return {
        courseId,
        totalLessons: courseLessons.length,
        completedLessons,
        totalQuizzes: courseQuizzes.length,
        completedQuizzes,
        averageQuizScore,
        lastAccessed: new Date(lastAccessed)
      }
    }
  }, [lessonProgress, quizResults])

  const courseProgress = useMemo(() => {
    // Оптимізуємо збір courseIds
    const courseIds = new Set<string>()
    
    // Використовуємо for...of замість map для кращої продуктивності
    for (const progress of Object.values(lessonProgress)) {
      courseIds.add(progress.courseId)
    }
    for (const result of quizResults) {
      courseIds.add(result.courseId)
    }

    const progress: Record<string, CourseProgress> = {}
    for (const courseId of courseIds) {
      const courseProg = getCourseProgress(courseId)
      if (courseProg) {
        progress[courseId] = courseProg
      }
    }

    return progress
  }, [lessonProgress, quizResults, getCourseProgress])

  const value = useMemo(() => ({
    lessonProgress,
    quizResults,
    courseProgress,
    markLessonComplete,
    unmarkLessonComplete,
    saveQuizResult,
    removeQuizResult,
    getLessonProgress,
    getCourseProgress,
    isLoading
  }), [lessonProgress, quizResults, courseProgress, isLoading])

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
