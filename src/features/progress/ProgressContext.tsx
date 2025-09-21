import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { useAuth } from '../auth/AuthContext'
import { addComment as addCommentToFirestore, subscribeToComments, addCourseRating, getCourseRatings, saveUserProgress, getUserProgress } from '../../firebase'
import type { FirestoreComment, FirestoreRating } from '../../firebase'

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

export type CourseRating = {
  courseId: string
  rating: number // 1-5
  ratedAt: Date
  userId: string
}

export type Comment = {
  id: string
  courseId: string
  author: string
  content: string
  createdAt: Date
  userId: string
}

export type CourseProgress = {
  courseId: string
  totalLessons: number
  completedLessons: number
  totalQuizzes: number
  completedQuizzes: number
  averageQuizScore: number
  lastAccessed: Date
  isCompleted: boolean
  completedAt?: Date
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
  getCourseProgressPercentage: (courseId: string) => number
  savedCourses: string[]
  toggleSavedCourse: (courseId: string) => void
  isCourseSaved: (courseId: string) => boolean
  addCourseRatingToFirebase: (courseId: string, rating: number) => Promise<{ success: boolean; error?: string }>
  setFirestoreRatings: React.Dispatch<React.SetStateAction<FirestoreRating[]>>
  getCompletedStudentsCount: (courseId: string, totalLessons?: number, totalQuizzes?: number) => number
  getCourseRating: (courseId: string) => number
  rateCourse: (courseId: string, rating: number) => void
  addComment: (courseId: string, content: string, author: string) => Promise<void>
  getCommentsByCourseId: (courseId: string) => Comment[]
  subscribeToCourseComments: (courseId: string) => () => void
  getCurrentStreak: () => number
  comments: Comment[]
  isLoading: boolean
  totalLessonsCompleted: number
  totalQuizzesCompleted: number
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined)

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({})
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [courseRatings, setCourseRatings] = useState<CourseRating[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [savedCourses, setSavedCourses] = useState<string[]>([])
  const [firestoreRatings, setFirestoreRatings] = useState<FirestoreRating[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load progress from localStorage on mount
  useEffect(() => {
    // Завантажуємо прогрес навіть без авторизації (локальне зберігання)
    const userId = user?.uid || 'anonymous'

    // Синхронне завантаження для миттєвого відображення
    try {
      const savedProgress = localStorage.getItem(`progress_${userId}`)
      const savedQuizResults = localStorage.getItem(`quizResults_${userId}`)
      const savedRatings = localStorage.getItem(`courseRatings_${userId}`)
      
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress)
        // Оптимізуємо конвертацію дат
        const progressEntries = Object.entries(parsed)
        for (const [, value] of progressEntries) {
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

      if (savedRatings) {
        const parsed = JSON.parse(savedRatings)
        // Оптимізуємо конвертацію дат для рейтингів
        const ratings = []
        for (const rating of parsed) {
          ratings.push({
            ...rating,
            ratedAt: new Date(rating.ratedAt)
          })
        }
        setCourseRatings(ratings)
      }

      // Завантажуємо збережені курси
      const savedCoursesData = localStorage.getItem(`savedCourses_${userId}`)
      if (savedCoursesData) {
        setSavedCourses(JSON.parse(savedCoursesData))
      }

    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setIsLoading(false)
    }

    // Завантажуємо прогрес з Firebase для авторизованих користувачів
    if (user?.uid) {
      const loadFirebaseProgress = async () => {
        try {
          const firebaseProgress = await getUserProgress(user.uid)
          if (firebaseProgress.success && firebaseProgress.data) {
            console.log('✅ Прогрес завантажено з Firebase:', firebaseProgress.data)
            // TODO: Можна додати логіку для синхронізації з localStorage
          }
        } catch (error) {
          console.error('❌ Помилка завантаження прогресу з Firebase:', error)
        }
      }
      loadFirebaseProgress()
    }
  }, [user])

  // Підписка на рейтинги з Firebase
  useEffect(() => {
    if (isLoading) return
    
    // Завантажуємо всі рейтинги з Firebase
    const loadRatings = async () => {
      try {
        // Отримуємо всі курси з localStorage для яких є прогрес
        const allKeys = Object.keys(localStorage)
        const progressKeys = allKeys.filter(key => key.startsWith('progress_'))
        
        const courseIds = new Set<string>()
        for (const key of progressKeys) {
          try {
            const progressData = JSON.parse(localStorage.getItem(key) || '{}')
            Object.values(progressData).forEach((p: any) => {
              if (p.courseId) courseIds.add(p.courseId)
            })
          } catch (error) {
            console.error('Error parsing progress data:', error)
          }
        }
        
        // Завантажуємо рейтинги для всіх курсів
        const allRatings: FirestoreRating[] = []
        for (const courseId of courseIds) {
          const ratings = await getCourseRatings(courseId)
          allRatings.push(...ratings)
        }
        
        setFirestoreRatings(allRatings)
      } catch (error) {
        console.error('Error loading ratings:', error)
      }
    }
    
    loadRatings()
  }, [isLoading])

  // Debounced save to localStorage to prevent excessive writes
  useEffect(() => {
    if (isLoading) return
    
    const userId = user?.uid || 'anonymous'
    
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(`progress_${userId}`, JSON.stringify(lessonProgress))
      } catch (error) {
        console.error('Error saving progress:', error)
      }
    }, 300) // Debounce by 300ms

    return () => clearTimeout(timeoutId)
  }, [lessonProgress, user, isLoading])

  useEffect(() => {
    if (isLoading) return
    
    const userId = user?.uid || 'anonymous'
    
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(`quizResults_${userId}`, JSON.stringify(quizResults))
      } catch (error) {
        console.error('Error saving quiz results:', error)
      }
    }, 300) // Debounce by 300ms

    return () => clearTimeout(timeoutId)
  }, [quizResults, user, isLoading])

  useEffect(() => {
    if (isLoading) return
    
    const userId = user?.uid || 'anonymous'
    
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(`courseRatings_${userId}`, JSON.stringify(courseRatings))
      } catch (error) {
        console.error('Error saving course ratings:', error)
      }
    }, 300) // Debounce by 300ms

    return () => clearTimeout(timeoutId)
  }, [courseRatings, user, isLoading])

  useEffect(() => {
    if (isLoading) return
    
    const userId = user?.uid || 'anonymous'
    const timeoutId = setTimeout(() => {
      localStorage.setItem(`savedCourses_${userId}`, JSON.stringify(savedCourses))
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [savedCourses, user, isLoading])


  const markLessonComplete = (courseId: string, lessonId: string, timeSpent: number = 0) => {
    const key = `${courseId}_${lessonId}`
    const progressData = {
      courseId,
      lessonId,
      completed: true,
      completedAt: new Date(),
      timeSpent
    }
    
    setLessonProgress(prev => ({
      ...prev,
      [key]: progressData
    }))
    
    // Зберігаємо в Firebase
    if (user?.uid) {
      saveUserProgress(user.uid, courseId, {
        lessonId,
        completed: true,
        completedAt: new Date().toISOString(),
        timeSpent
      }).catch(error => {
        console.error('❌ Помилка збереження прогресу в Firebase:', error)
      })
    }
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
    
    // Зберігаємо в Firebase
    if (user?.uid) {
      saveUserProgress(user.uid, courseId, {
        quizId,
        score,
        totalQuestions,
        completedAt: new Date().toISOString(),
        answers
      }).catch(error => {
        console.error('❌ Помилка збереження результату квізу в Firebase:', error)
      })
    }
  }

  const removeQuizResult = (courseId: string, quizId: string) => {
    setQuizResults(prev => prev.filter(r => !(r.courseId === courseId && r.quizId === quizId)))
  }

  const rateCourse = (courseId: string, rating: number) => {
    const userId = user?.uid || 'anonymous'
    
    const newRating: CourseRating = {
      courseId,
      rating,
      ratedAt: new Date(),
      userId
    }
    
    setCourseRatings(prev => {
      // Remove any existing rating for this course by this user
      const filtered = prev.filter(r => !(r.courseId === courseId && r.userId === userId))
      return [...filtered, newRating]
    })
  }

  const addComment = async (courseId: string, content: string, author: string) => {
    try {
      const result = await addCommentToFirestore({
        courseId,
        author,
        content,
        userId: user?.uid || 'anonymous'
      })
      
      if (result.success) {
        console.log('✅ Коментар додано в Firestore')
        // Коментарі автоматично оновляться через підписку
      } else {
        console.error('❌ Помилка додавання коментаря:', result.error)
      }
    } catch (error) {
      console.error('❌ Помилка додавання коментаря:', error)
    }
  }

  const getCommentsByCourseId = (courseId: string) => {
    return comments
      .filter(comment => comment.courseId === courseId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  const subscribeToCourseComments = (courseId: string) => {
    return subscribeToComments(courseId, (firestoreComments: FirestoreComment[]) => {
      // Конвертуємо FirestoreComment в Comment
      const convertedComments: Comment[] = firestoreComments.map(fc => ({
        id: fc.id || '',
        courseId: fc.courseId,
        author: fc.author,
        content: fc.content,
        createdAt: fc.createdAt?.toDate ? fc.createdAt.toDate() : new Date(),
        userId: fc.userId
      }))
      
      // Оновлюємо стан коментарів
      setComments(prev => {
        // Видаляємо старі коментарі для цього курсу
        const otherComments = prev.filter(c => c.courseId !== courseId)
        // Додаємо нові коментарі
        return [...otherComments, ...convertedComments]
      })
    })
  }

  const toggleSavedCourse = (courseId: string) => {
    setSavedCourses(prev => {
      const newSavedCourses = prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
      return newSavedCourses
    })
  }

  const isCourseSaved = (courseId: string) => savedCourses.includes(courseId)

  // Функція для додавання рейтингу курсу
  const addCourseRatingToFirebase = async (courseId: string, rating: number) => {
    try {
      const userId = user?.uid || 'anonymous'
      const result = await addCourseRating(courseId, userId, rating)
      
      if (result.success) {
        console.log('✅ Рейтинг додано в Firebase')
        // Оновлюємо локальний стан
        const newRating: FirestoreRating = {
          courseId,
          userId,
          rating,
          createdAt: new Date()
        }
        setFirestoreRatings(prev => [...prev, newRating])
      }
      
      return result
    } catch (error) {
      console.error('❌ Помилка додавання рейтингу:', error)
      return { success: false, error: 'Помилка додавання рейтингу' }
    }
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

      // Курс вважається завершеним, якщо всі уроки та квізи пройдені
      const isCompleted = completedLessons === courseLessons.length && 
                         completedQuizzes === courseQuizzes.length &&
                         courseLessons.length > 0

      return {
        courseId,
        totalLessons: courseLessons.length,
        completedLessons,
        totalQuizzes: courseQuizzes.length,
        completedQuizzes,
        averageQuizScore,
        lastAccessed: new Date(lastAccessed),
        isCompleted,
        completedAt: isCompleted ? new Date(lastAccessed) : undefined
      }
    }
  }, [lessonProgress, quizResults])

  const getCourseProgressPercentage = useMemo(() => {
    return (courseId: string): number => {
      const progressData = getCourseProgress(courseId)
      if (!progressData) return 0
      
      const total = progressData.totalLessons + progressData.totalQuizzes
      if (total === 0) return 0
      
      const completed = progressData.completedLessons + progressData.completedQuizzes
      return Math.round((completed / total) * 100)
    }
  }, [getCourseProgress])

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

  // Обчислені значення для статистики
  const totalLessonsCompleted = useMemo(() => {
    return Object.values(lessonProgress).filter(p => p.completed).length
  }, [lessonProgress])

  const totalQuizzesCompleted = useMemo(() => {
    return quizResults.length
  }, [quizResults])

  // Функція для отримання середнього рейтингу курсу
  const getCourseRating = (courseId: string): number => {
    try {
      // Спочатку перевіряємо Firebase рейтинги
      const courseRatings = firestoreRatings.filter(r => r.courseId === courseId)
      
      if (courseRatings.length > 0) {
        const totalRating = courseRatings.reduce((sum, rating) => sum + rating.rating, 0)
        return Math.round((totalRating / courseRatings.length) * 10) / 10
      }
      
      // Fallback до localStorage
      const allKeys = Object.keys(localStorage)
      const ratingKeys = allKeys.filter(key => key.startsWith('courseRatings_'))
      
      let totalRating = 0
      let ratingCount = 0
      
      for (const key of ratingKeys) {
        try {
          const ratingData = JSON.parse(localStorage.getItem(key) || '[]')
          const localCourseRatings = ratingData.filter((r: any) => r.courseId === courseId)
          
          for (const rating of localCourseRatings) {
            totalRating += rating.rating
            ratingCount++
          }
        } catch (error) {
          console.error('Error parsing rating data:', error)
        }
      }
      
      return ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0
    } catch (error) {
      console.error('Error getting course rating:', error)
      return 0
    }
  }

  // Функція для отримання кількості студентів, які завершили курс
  const getCompletedStudentsCount = (courseId: string, totalLessons?: number, totalQuizzes?: number): number => {
    try {
      // Спочатку перевіряємо кількість унікальних користувачів з рейтингами в Firebase
      const courseRatings = firestoreRatings.filter(r => r.courseId === courseId)
      const uniqueUsersWithRatings = new Set(courseRatings.map(r => r.userId)).size
      
      if (uniqueUsersWithRatings > 0) {
        return uniqueUsersWithRatings
      }
      
      // Fallback до localStorage
      const allKeys = Object.keys(localStorage)
      const progressKeys = allKeys.filter(key => key.startsWith('progress_'))
      
      let completedCount = 0
      
      for (const key of progressKeys) {
        try {
          const progressData = JSON.parse(localStorage.getItem(key) || '{}')
          
          // Знаходимо всі уроки для цього курсу
          const courseLessons = Object.values(progressData).filter((p: any) => p.courseId === courseId && p.completed)
          
          // Отримуємо квізи для цього курсу
          const quizKey = key.replace('progress_', 'quizResults_')
          const quizData = JSON.parse(localStorage.getItem(quizKey) || '[]')
          const courseQuizzes = quizData.filter((q: any) => q.courseId === courseId)
          
          // Якщо передано загальну кількість уроків та квізів, перевіряємо повне завершення
          if (totalLessons !== undefined && totalQuizzes !== undefined) {
            if (courseLessons.length === totalLessons && courseQuizzes.length === totalQuizzes) {
              completedCount++
            }
          } else {
            // Для спрощення, вважаємо курс завершеним, якщо студент пройшов хоча б один урок або квіз
            if (courseLessons.length > 0 || courseQuizzes.length > 0) {
              completedCount++
            }
          }
        } catch (error) {
          console.error('Error parsing progress data:', error)
        }
      }
      
      return completedCount
    } catch (error) {
      console.error('Error getting completed students count:', error)
      return 0
    }
  }

  // Функція для підрахунку streak (днів поспіль)
  const getCurrentStreak = () => {
    try {
      const allKeys = Object.keys(localStorage)
      const progressKeys = allKeys.filter(key => key.startsWith('progress_'))
      
      const activityDates = new Set<string>()
      
      // Збираємо всі дати активності
      for (const key of progressKeys) {
        try {
          const progressData = JSON.parse(localStorage.getItem(key) || '{}')
          Object.values(progressData).forEach((p: any) => {
            if (p.completedAt) {
              const date = new Date(p.completedAt)
              const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD
              activityDates.add(dateString)
            }
          })
        } catch (error) {
          console.error('Error parsing progress data for streak:', error)
        }
      }
      
      // Сортуємо дати
      const sortedDates = Array.from(activityDates).sort().reverse()
      
      if (sortedDates.length === 0) return 0
      
      // Підраховуємо streak
      let streak = 0
      const today = new Date()
      const todayString = today.toISOString().split('T')[0]
      
      // Якщо сьогодні є активність, починаємо з 1
      if (sortedDates.includes(todayString)) {
        streak = 1
      } else {
        // Якщо сьогодні немає активності, перевіряємо вчора
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayString = yesterday.toISOString().split('T')[0]
        
        if (sortedDates.includes(yesterdayString)) {
          streak = 1
        } else {
          return 0 // Немає активності вчора або сьогодні
        }
      }
      
      // Підраховуємо послідовні дні
      let currentDate = new Date(today)
      if (!sortedDates.includes(todayString)) {
        currentDate.setDate(currentDate.getDate() - 1) // Починаємо з вчора
      }
      
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(currentDate)
        prevDate.setDate(prevDate.getDate() - 1)
        const prevDateString = prevDate.toISOString().split('T')[0]
        
        if (sortedDates.includes(prevDateString)) {
          streak++
          currentDate = prevDate
        } else {
          break
        }
      }
      
      console.log('🔥 Streak calculated:', streak, 'from dates:', sortedDates.slice(0, 5))
      return streak
    } catch (error) {
      console.error('Error calculating streak:', error)
      return 0
    }
  }

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
    getCourseProgressPercentage,
    getCompletedStudentsCount,
    getCourseRating,
    rateCourse,
    addComment,
    getCommentsByCourseId,
    subscribeToCourseComments,
    comments,
    savedCourses,
    toggleSavedCourse,
    isCourseSaved,
    addCourseRatingToFirebase,
    setFirestoreRatings,
    getCurrentStreak,
    isLoading,
    totalLessonsCompleted,
    totalQuizzesCompleted
  }), [lessonProgress, quizResults, courseProgress, comments, savedCourses, isLoading, totalLessonsCompleted, totalQuizzesCompleted])

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
