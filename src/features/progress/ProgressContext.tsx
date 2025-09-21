import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { useAuth } from '../auth/AuthContext'
// import { addComment as addCommentToFirestore, subscribeToComments } from '../../firebase'
// import type { FirestoreComment } from '../../firebase'
import { userDataManager, type UserData } from '../../lib/userDataManager'

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
  answers: Record<string, string | string[]>
  completedAt: Date
}

export type CourseRating = {
  courseId: string
  rating: number
  ratedAt: Date
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

export type UserStreak = {
  currentStreak: number
  longestStreak: number
  lastLearningDate: Date | null
  streakStartDate: Date | null
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
  getCompletedStudentsCount: (courseId: string, totalLessons?: number, totalQuizzes?: number) => number
  getCourseRating: (courseId: string) => number
  rateCourse: (courseId: string, rating: number) => void
  addComment: (courseId: string, content: string, author: string) => Promise<void>
  getCommentsByCourseId: (courseId: string) => Comment[]
  subscribeToCourseComments: (courseId: string) => () => void
  comments: Comment[]
  isLoading: boolean
  totalLessonsCompleted: number
  totalQuizzesCompleted: number
  userStreak: UserStreak
  updateStreak: () => void
  clearAllUserData: () => void
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined)

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)

  // Ініціалізація користувача
  useEffect(() => {
    if (!user) {
      console.log('❌ Користувач не авторизований')
      setUserData(null)
      setIsLoading(false)
      return
    }

    console.log('🔄 Ініціалізація даних для користувача:', user.email)
    
    // Встановлюємо користувача в менеджері
    userDataManager.setCurrentUser(user.uid, user.email || '')
    
    // Отримуємо дані користувача
    const data = userDataManager.getCurrentUserData()
    setUserData(data)
    setIsLoading(false)
    
    console.log('✅ Дані користувача ініціалізовано:', user.email)
  }, [user])

  // Оновлення даних при зміні userData
  useEffect(() => {
    if (userData) {
      console.log('📊 Оновлення даних користувача:', userData.email)
    }
  }, [userData])

  // Функції для роботи з уроками
  const markLessonComplete = (courseId: string, lessonId: string, timeSpent: number = 0) => {
    if (!userData) return

    const key = `${courseId}_${lessonId}`
    const newProgress = {
      ...userData.lessonProgress,
      [key]: {
        courseId,
        lessonId,
        completed: true,
        completedAt: new Date(),
        timeSpent
      }
    }

    userDataManager.updateCurrentUserData({ lessonProgress: newProgress })
    setUserData(prev => prev ? { ...prev, lessonProgress: newProgress } : null)
    
    // Оновлюємо streak
    updateStreak()
  }

  const unmarkLessonComplete = (courseId: string, lessonId: string) => {
    if (!userData) return

    const key = `${courseId}_${lessonId}`
    const newProgress = { ...userData.lessonProgress }
    delete newProgress[key]

    userDataManager.updateCurrentUserData({ lessonProgress: newProgress })
    setUserData(prev => prev ? { ...prev, lessonProgress: newProgress } : null)
  }

  // Функції для роботи з квізами
  const saveQuizResult = (courseId: string, quizId: string, score: number, totalQuestions: number, answers: Record<string, string | string[]>) => {
    if (!userData) return

    const newResult: QuizResult = {
      courseId,
      quizId,
      score,
      totalQuestions,
      answers,
      completedAt: new Date()
    }

    const newResults = [...userData.quizResults.filter(r => !(r.courseId === courseId && r.quizId === quizId)), newResult]

    userDataManager.updateCurrentUserData({ quizResults: newResults })
    setUserData(prev => prev ? { ...prev, quizResults: newResults } : null)
    
    // Оновлюємо streak
    updateStreak()
  }

  const removeQuizResult = (courseId: string, quizId: string) => {
    if (!userData) return

    const newResults = userData.quizResults.filter(r => !(r.courseId === courseId && r.quizId === quizId))

    userDataManager.updateCurrentUserData({ quizResults: newResults })
    setUserData(prev => prev ? { ...prev, quizResults: newResults } : null)
  }

  // Функції для роботи з рейтингами
  const rateCourse = (courseId: string, rating: number) => {
    if (!userData) return

    const newRating: CourseRating = {
      courseId,
      rating,
      ratedAt: new Date()
    }

    const newRatings = [...userData.courseRatings.filter(r => r.courseId !== courseId), newRating]

    userDataManager.updateCurrentUserData({ courseRatings: newRatings })
    setUserData(prev => prev ? { ...prev, courseRatings: newRatings } : null)
  }

  // Функції для роботи з збереженими курсами
  const toggleSavedCourse = (courseId: string) => {
    if (!userData) return

    const isSaved = userData.savedCourses.includes(courseId)
    const newSavedCourses = isSaved 
      ? userData.savedCourses.filter(id => id !== courseId)
      : [...userData.savedCourses, courseId]

    userDataManager.updateCurrentUserData({ savedCourses: newSavedCourses })
    setUserData(prev => prev ? { ...prev, savedCourses: newSavedCourses } : null)
  }

  // Функції для роботи зі streak
  const updateStreak = () => {
    if (!userData) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastLearningDate = userData.userStreak.lastLearningDate
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let newStreak = userData.userStreak.currentStreak
    let newStreakStartDate = userData.userStreak.streakStartDate

    if (!lastLearningDate) {
      // Перший день навчання
      newStreak = 1
      newStreakStartDate = today
    } else {
      const lastDate = new Date(lastLearningDate)
      lastDate.setHours(0, 0, 0, 0)

      if (lastDate.getTime() === today.getTime()) {
        // Вже навчалися сьогодні - streak не змінюється
        return
      } else if (lastDate.getTime() === yesterday.getTime()) {
        // Навчалися вчора - продовжуємо streak
        newStreak = userData.userStreak.currentStreak + 1
        if (userData.userStreak.currentStreak === 0) {
          newStreakStartDate = today
        }
      } else {
        // Пропустили дні - streak скидається
        newStreak = 1
        newStreakStartDate = today
      }
    }

    const newLongestStreak = Math.max(userData.userStreak.longestStreak, newStreak)

    const newStreakData = {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastLearningDate: today,
      streakStartDate: newStreakStartDate
    }

    userDataManager.updateCurrentUserData({ userStreak: newStreakData })
    setUserData(prev => prev ? { ...prev, userStreak: newStreakData } : null)
  }

  // Функція для очищення всіх даних
  const clearAllUserData = () => {
    if (!user) return

    userDataManager.clearUserData(user.uid)
    const newData = userDataManager.getCurrentUserData()
    setUserData(newData)
  }

  // Обчислені значення
  const totalLessonsCompleted = useMemo(() => {
    if (!userData) return 0
    return Object.values(userData.lessonProgress).filter(p => p.completed).length
  }, [userData])

  const totalQuizzesCompleted = useMemo(() => {
    if (!userData) return 0
    return userData.quizResults.length
  }, [userData])

  const savedCourses = useMemo(() => {
    if (!userData) return []
    return userData.savedCourses
  }, [userData])

  const userStreak = useMemo(() => {
    if (!userData) return {
      currentStreak: 0,
      longestStreak: 0,
      lastLearningDate: null,
      streakStartDate: null
    }
    return userData.userStreak
  }, [userData])

  // Функції для отримання прогресу
  const getLessonProgress = (courseId: string, lessonId: string): LessonProgress | null => {
    if (!userData) return null
    const key = `${courseId}_${lessonId}`
    return userData.lessonProgress[key] || null
  }

  const getCourseProgress = (courseId: string): CourseProgress | null => {
    if (!userData) return null

    const courseLessons = Object.values(userData.lessonProgress).filter(p => p.courseId === courseId)
    const courseQuizzes = userData.quizResults.filter(r => r.courseId === courseId)

    if (courseLessons.length === 0 && courseQuizzes.length === 0) {
      return null
    }

    const completedLessons = courseLessons.filter(p => p.completed).length
    const completedQuizzes = courseQuizzes.length

    let averageQuizScore = 0
    if (courseQuizzes.length > 0) {
      let totalScore = 0
      for (const quiz of courseQuizzes) {
        totalScore += quiz.score / quiz.totalQuestions
      }
      averageQuizScore = (totalScore / courseQuizzes.length) * 100
    }

    let lastAccessed = 0
    for (const lesson of courseLessons) {
      if (lesson.completedAt) {
        const date = lesson.completedAt instanceof Date ? lesson.completedAt : new Date(lesson.completedAt)
        lastAccessed = Math.max(lastAccessed, date.getTime())
      }
    }
    for (const quiz of courseQuizzes) {
      if (quiz.completedAt) {
        const date = quiz.completedAt instanceof Date ? quiz.completedAt : new Date(quiz.completedAt)
        lastAccessed = Math.max(lastAccessed, date.getTime())
      }
    }

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

  const getCourseProgressPercentage = (courseId: string): number => {
    const progress = getCourseProgress(courseId)
    if (!progress) return 0

    const totalItems = progress.totalLessons + progress.totalQuizzes
    if (totalItems === 0) return 0

    const completedItems = progress.completedLessons + progress.completedQuizzes
    return Math.round((completedItems / totalItems) * 100)
  }

  const isCourseSaved = (courseId: string): boolean => {
    if (!userData) return false
    return userData.savedCourses.includes(courseId)
  }

  const getCourseRating = (courseId: string): number => {
    if (!userData) return 0
    const rating = userData.courseRatings.find(r => r.courseId === courseId)
    return rating ? rating.rating : 0
  }

  // Заглушки для коментарів (поки що не реалізовано)
  const [comments] = useState<Comment[]>([])

  const addComment = async (_courseId: string, _content: string, _author: string): Promise<void> => {
    // TODO: Реалізувати коментарі
  }

  const getCommentsByCourseId = (_courseId: string): Comment[] => {
    return comments.filter(c => c.courseId === _courseId)
  }

  const subscribeToCourseComments = (_courseId: string): (() => void) => {
    // TODO: Реалізувати підписку на коментарі
    return () => {}
  }

  const getCompletedStudentsCount = (_courseId: string, _totalLessons?: number, _totalQuizzes?: number): number => {
    // TODO: Реалізувати підрахунок студентів
    return 0
  }

  const value = useMemo(() => ({
    lessonProgress: userData?.lessonProgress || {},
    quizResults: userData?.quizResults || [],
    courseProgress: {}, // Буде обчислюватися динамічно
    markLessonComplete,
    unmarkLessonComplete,
    saveQuizResult,
    removeQuizResult,
    getLessonProgress,
    getCourseProgress,
    getCourseProgressPercentage,
    savedCourses,
    toggleSavedCourse,
    isCourseSaved,
    getCompletedStudentsCount,
    getCourseRating,
    rateCourse,
    addComment,
    getCommentsByCourseId,
    subscribeToCourseComments,
    comments,
    isLoading,
    totalLessonsCompleted,
    totalQuizzesCompleted,
    userStreak,
    updateStreak,
    clearAllUserData
  }), [userData, isLoading, totalLessonsCompleted, totalQuizzesCompleted, savedCourses, userStreak, comments])

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (ctx === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return ctx
}
