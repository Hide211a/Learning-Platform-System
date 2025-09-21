/**
 * Менеджер даних користувача - ГАРАНТУЄ ізоляцію даних між користувачами
 */

export interface UserData {
  userId: string
  email: string
  lessonProgress: Record<string, any>
  quizResults: any[]
  courseRatings: any[]
  savedCourses: string[]
  userStreak: any
  profile: any
  lastUpdated: Date
}

class UserDataManager {
  private static instance: UserDataManager
  private currentUser: string | null = null
  private userDataCache: Map<string, UserData> = new Map()

  static getInstance(): UserDataManager {
    if (!UserDataManager.instance) {
      UserDataManager.instance = new UserDataManager()
    }
    return UserDataManager.instance
  }

  /**
   * Встановлює поточного користувача та завантажує його дані
   */
  setCurrentUser(userId: string, email: string): void {
    console.log('🔄 Встановлення користувача:', email, 'UID:', userId)
    
    // Зберігаємо дані попереднього користувача (якщо був)
    if (this.currentUser && this.currentUser !== userId) {
      this.saveCurrentUserData()
    }

    // Встановлюємо нового користувача
    this.currentUser = userId
    
    // Завантажуємо дані нового користувача
    this.loadUserData(userId, email)
  }

  /**
   * Завантажує дані користувача з localStorage
   */
  private loadUserData(userId: string, email: string): void {
    console.log('📥 Завантаження даних для користувача:', email)
    
    const userDataKey = `userData_${userId}`
    const savedData = localStorage.getItem(userDataKey)
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        
        // Конвертуємо дати в lessonProgress
        const lessonProgress = { ...parsedData.lessonProgress }
        Object.keys(lessonProgress).forEach(key => {
          if (lessonProgress[key] && lessonProgress[key].completedAt) {
            try {
              lessonProgress[key].completedAt = new Date(lessonProgress[key].completedAt)
            } catch (error) {
              console.warn('Помилка конвертації дати в lessonProgress:', error)
              lessonProgress[key].completedAt = new Date()
            }
          }
        })
        
        // Конвертуємо дати в quizResults
        const quizResults = parsedData.quizResults.map((result: any) => {
          try {
            return {
              ...result,
              completedAt: result.completedAt ? new Date(result.completedAt) : new Date()
            }
          } catch (error) {
            console.warn('Помилка конвертації дати в quizResults:', error)
            return {
              ...result,
              completedAt: new Date()
            }
          }
        })
        
        // Конвертуємо дати в courseRatings
        const courseRatings = parsedData.courseRatings.map((rating: any) => {
          try {
            return {
              ...rating,
              ratedAt: rating.ratedAt ? new Date(rating.ratedAt) : new Date()
            }
          } catch (error) {
            console.warn('Помилка конвертації дати в courseRatings:', error)
            return {
              ...rating,
              ratedAt: new Date()
            }
          }
        })
        
        // Конвертуємо дати в userStreak
        const userStreak = {
          ...parsedData.userStreak,
          lastLearningDate: parsedData.userStreak.lastLearningDate ? 
            (() => {
              try {
                return new Date(parsedData.userStreak.lastLearningDate)
              } catch (error) {
                console.warn('Помилка конвертації lastLearningDate:', error)
                return null
              }
            })() : null,
          streakStartDate: parsedData.userStreak.streakStartDate ? 
            (() => {
              try {
                return new Date(parsedData.userStreak.streakStartDate)
              } catch (error) {
                console.warn('Помилка конвертації streakStartDate:', error)
                return null
              }
            })() : null
        }
        
        this.userDataCache.set(userId, {
          ...parsedData,
          lessonProgress,
          quizResults,
          courseRatings,
          userStreak,
          lastUpdated: new Date(parsedData.lastUpdated)
        })
        console.log('✅ Дані завантажено з localStorage для:', email)
      } catch (error) {
        console.error('❌ Помилка завантаження даних:', error)
        this.createEmptyUserData(userId, email)
      }
    } else {
      console.log('🆕 Створення нових даних для користувача:', email)
      this.createEmptyUserData(userId, email)
    }
  }

  /**
   * Створює порожні дані для нового користувача
   */
  private createEmptyUserData(userId: string, email: string): void {
    const emptyData: UserData = {
      userId,
      email,
      lessonProgress: {},
      quizResults: [],
      courseRatings: [],
      savedCourses: [],
      userStreak: {
        currentStreak: 0,
        longestStreak: 0,
        lastLearningDate: null,
        streakStartDate: null
      },
      profile: {
        displayName: email.split('@')[0],
        email: email,
        bio: '',
        location: '',
        website: '',
        github: '',
        linkedin: ''
      },
      lastUpdated: new Date()
    }
    
    this.userDataCache.set(userId, emptyData)
    this.saveUserData(userId)
  }

  /**
   * Зберігає дані поточного користувача
   */
  private saveCurrentUserData(): void {
    if (this.currentUser) {
      this.saveUserData(this.currentUser)
    }
  }

  /**
   * Зберігає дані користувача в localStorage
   */
  private saveUserData(userId: string): void {
    const userData = this.userDataCache.get(userId)
    if (!userData) return

    const userDataKey = `userData_${userId}`
    const dataToSave = {
      ...userData,
      lastUpdated: new Date()
    }
    
    localStorage.setItem(userDataKey, JSON.stringify(dataToSave))
    console.log('💾 Дані збережено для користувача:', userData.email)
  }

  /**
   * Отримує дані поточного користувача
   */
  getCurrentUserData(): UserData | null {
    if (!this.currentUser) return null
    return this.userDataCache.get(this.currentUser) || null
  }

  /**
   * Оновлює дані поточного користувача
   */
  updateCurrentUserData(updates: Partial<UserData>): void {
    if (!this.currentUser) return

    const currentData = this.userDataCache.get(this.currentUser)
    if (!currentData) return

    const updatedData = {
      ...currentData,
      ...updates,
      lastUpdated: new Date()
    }

    this.userDataCache.set(this.currentUser, updatedData)
    this.saveUserData(this.currentUser)
  }

  /**
   * Очищає дані користувача
   */
  clearUserData(userId: string): void {
    console.log('🗑️ Очищення даних для користувача:', userId)
    
    // Видаляємо з кешу
    this.userDataCache.delete(userId)
    
    // Видаляємо з localStorage
    const userDataKey = `userData_${userId}`
    localStorage.removeItem(userDataKey)
    
    // Якщо це поточний користувач, створюємо нові порожні дані
    if (this.currentUser === userId) {
      const userData = this.userDataCache.get(userId)
      if (userData) {
        this.createEmptyUserData(userId, userData.email)
      }
    }
  }

  /**
   * Отримує список всіх користувачів з даними
   */
  getAllUsers(): string[] {
    const users: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('userData_')) {
        const userId = key.replace('userData_', '')
        users.push(userId)
      }
    }
    return users
  }

  /**
   * Очищає ВСІ дані (для дебагу)
   */
  clearAllData(): void {
    console.log('🧹 Очищення ВСІХ даних користувачів')
    
    const users = this.getAllUsers()
    users.forEach(userId => {
      this.clearUserData(userId)
    })
    
    this.userDataCache.clear()
    this.currentUser = null
  }

  /**
   * Відключає поточного користувача
   */
  logout(): void {
    if (this.currentUser) {
      this.saveCurrentUserData()
      this.currentUser = null
    }
  }
}

export const userDataManager = UserDataManager.getInstance()
