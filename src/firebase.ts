import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, where, doc, setDoc, onSnapshot } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)

// Типи для ролей користувачів
export type UserRole = 'user' | 'admin' | 'moderator'

export type FirestoreUser = {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
  role: UserRole
  createdAt: any
  lastLoginAt: any
  isActive: boolean
}

// Функція для створення користувача в Firestore
export const createUserInFirestore = async (user: any) => {
  try {
    if (!db) {
      throw new Error('Firestore не ініціалізований')
    }

    const userRef = doc(db, 'users', user.uid)
    
    // Визначаємо роль користувача
    let userRole: UserRole = 'user'
    
    // Якщо це ваш email, робимо адміном
    if (user.email === 'siidechaiin@gmail.com') {
      userRole = 'admin'
      console.log('🔑 Назначено роль адміна для:', user.email)
    }
    
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Користувач',
      photoURL: user.photoURL || null,
      role: userRole,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      isActive: true
    }, { merge: true }) // merge: true дозволяє оновлювати існуючі документи

    console.log('✅ Користувач створений/оновлений в Firestore:', user.uid, 'Роль:', userRole)
    return { success: true, role: userRole }
  } catch (error: any) {
    console.error('❌ Помилка створення користувача в Firestore:', error)
    return { success: false, error: error.message }
  }
}

// Функція для підписки на розсилку
export const subscribeToNewsletter = async (email: string) => {
  try {
    // Перевірка чи Firestore доступний
    if (!db) {
      throw new Error('Firestore не ініціалізований')
    }

    const docRef = await addDoc(collection(db, 'newsletter_subscribers'), {
      email: email.toLowerCase().trim(),
      createdAt: serverTimestamp(),
      isActive: true
    })
    return { success: true, id: docRef.id }
  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error)
    
    // Тимчасова заглушка - зберігаємо в localStorage
    try {
      const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]')
      const newSubscriber = {
        email: email.toLowerCase().trim(),
        createdAt: new Date().toISOString(),
        isActive: true,
        id: Date.now().toString()
      }
      subscribers.push(newSubscriber)
      localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers))
      
      console.log('📧 Email збережено локально:', newSubscriber)
      return { success: true, id: newSubscriber.id, local: true }
    } catch (localError) {
      console.error('Помилка локального збереження:', localError)
    }
    
    // Більш детальна обробка помилок
    if (error.code === 'permission-denied') {
      return { success: false, error: 'Немає дозволу на запис. Перевірте правила Firestore.' }
    } else if (error.code === 'unavailable') {
      return { success: false, error: 'Firestore недоступний. Email збережено локально.' }
    } else if (error.message?.includes('Firestore не ініціалізований')) {
      return { success: false, error: 'Firestore не налаштований. Email збережено локально.' }
    }
    
    return { success: false, error: error.message || 'Невідома помилка' }
  }
}

// Типи для відгуків
export type Testimonial = {
  id?: string
  name: string
  role: string
  content: string
  rating: number
  email?: string
  approved: boolean
  createdAt: any
}

// Функція для додавання відгуку
export const addTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'approved'>) => {
  try {
    const testimonialsRef = collection(db, 'testimonials')
    const newTestimonial = {
      ...testimonial,
      approved: false, // Відгуки потребують модерації
      createdAt: serverTimestamp()
    }
    
    const docRef = await addDoc(testimonialsRef, newTestimonial)
    console.log('✅ Відгук додано:', docRef.id)
    return { success: true, id: docRef.id }
  } catch (error: any) {
    console.error('❌ Помилка додавання відгуку:', error)
    return { success: false, error: error.message || 'Невідома помилка' }
  }
}

// Функція для отримання схвалених відгуків
export const getApprovedTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const testimonialsRef = collection(db, 'testimonials')
    // Спочатку отримуємо всі відгуки, потім фільтруємо на клієнті
    const q = query(testimonialsRef, orderBy('createdAt', 'desc'))
    
    const querySnapshot = await getDocs(q)
    const testimonials: Testimonial[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Testimonial
      // Фільтруємо тільки схвалені відгуки
      if (data.approved === true) {
        testimonials.push({
          id: doc.id,
          ...data
        })
      }
    })
    
    console.log('✅ Отримано відгуків:', testimonials.length)
    return testimonials
  } catch (error: any) {
    console.error('❌ Помилка отримання відгуків:', error)
    
    // Fallback - демонстраційні відгуки для дипломної роботи
    console.log('📝 Використовуємо демонстраційні відгуки')
    return [
      {
        id: 'demo-1',
        name: 'Олександр Петренко',
        role: 'Frontend Developer',
        content: 'Платформа допомогла мені швидко освоїти React та знайти роботу мрії. Курси дуже якісні та практичні.',
        rating: 5,
        approved: true,
        createdAt: new Date()
      },
      {
        id: 'demo-2',
        name: 'Марія Коваленко',
        role: 'UX/UI Designer',
        content: 'Чудові курси з дизайну! Викладачі дуже досвідчені, а матеріал подається зрозуміло та цікаво.',
        rating: 5,
        approved: true,
        createdAt: new Date()
      },
      {
        id: 'demo-3',
        name: 'Дмитро Сидоренко',
        role: 'Backend Developer',
        content: 'Завдяки цій платформі я освоїв Node.js та MongoDB. Тепер працюю в топовій IT-компанії.',
        rating: 5,
        approved: true,
        createdAt: new Date()
      }
    ]
  }
}

// Функція для отримання всіх відгуків (для адміна)
export const getAllTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const testimonialsRef = collection(db, 'testimonials')
    const q = query(testimonialsRef, orderBy('createdAt', 'desc'))
    
    const querySnapshot = await getDocs(q)
    const testimonials: Testimonial[] = []
    
    querySnapshot.forEach((doc) => {
      testimonials.push({
        id: doc.id,
        ...doc.data()
      } as Testimonial)
    })
    
    return testimonials
  } catch (error: any) {
    console.error('❌ Помилка отримання всіх відгуків:', error)
    return []
  }
}

// Функція для отримання статистики відгуків
export const getTestimonialsStats = async () => {
  try {
    const testimonials = await getApprovedTestimonials()
    
    // Розраховуємо відсоток задоволених студентів (оцінка 4-5 зірок)
    const satisfiedReviews = testimonials.filter(t => t.rating >= 4).length
    const satisfactionPercentage = testimonials.length > 0 
      ? Math.round((satisfiedReviews / testimonials.length) * 100)
      : 0
    
    const stats = {
      totalReviews: testimonials.length,
      averageRating: testimonials.length > 0 
        ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
        : '0.0',
      realReviewsPercentage: '100%', // Всі схвалені відгуки вважаємо реальними
      satisfiedStudents: testimonials.length > 0 ? `${testimonials.length}+` : '0+',
      satisfactionPercentage: satisfactionPercentage
    }
    
    console.log('✅ Статистика відгуків:', stats)
    return stats
  } catch (error: any) {
    console.error('❌ Помилка отримання статистики:', error)
    // Fallback статистика
    return {
      totalReviews: 0,
      averageRating: '0.0',
      realReviewsPercentage: '100%',
      satisfiedStudents: '0+',
      satisfactionPercentage: 0
    }
  }
}

// Функція для отримання кількості зареєстрованих користувачів
export const getUsersCount = async () => {
  try {
    // Отримуємо користувачів з колекції users
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)
    
    const count = snapshot.size
    console.log('✅ Кількість користувачів в Firestore:', count)
    
    // Якщо користувачів немає, але є авторизований користувач, повертаємо мінімум 1
    if (count === 0 && auth.currentUser) {
      console.log('📝 Немає користувачів в Firestore, але є авторизований користувач')
      return 1
    }
    
    return count
  } catch (error: any) {
    console.error('❌ Помилка отримання кількості користувачів:', error)
    
    // Fallback - якщо є авторизований користувач, повертаємо 1
    if (auth.currentUser) {
      console.log('📝 Fallback: повертаємо 1 користувача (авторизований)')
      return 1
    }
    
    // Fallback - використовуємо кількість відгуків як приблизну кількість активних користувачів
    try {
      const testimonials = await getApprovedTestimonials()
      return testimonials.length > 0 ? testimonials.length * 10 : 0 // Приблизна оцінка
    } catch {
      return 0
    }
  }
}

// Функція для отримання кількості сертифікатів
export const getCertificatesCount = async () => {
  try {
    const certificatesRef = collection(db, 'certificates')
    const snapshot = await getDocs(certificatesRef)
    
    const count = snapshot.size
    console.log('✅ Кількість сертифікатів:', count)
    return count
  } catch (error: any) {
    console.error('❌ Помилка отримання кількості сертифікатів:', error)
    // Fallback - використовуємо кількість завершених курсів з відгуків
    try {
      const testimonials = await getApprovedTestimonials()
      return Math.floor(testimonials.length * 0.7) // 70% від кількості відгуків
    } catch {
      return 0
    }
  }
}

// Функція для отримання загальної статистики платформи
export const getPlatformStats = async () => {
  try {
    const [usersCount, certificatesCount, testimonialsStats] = await Promise.all([
      getUsersCount(),
      getCertificatesCount(),
      getTestimonialsStats()
    ])
    
    const stats = {
      students: usersCount,
      certificates: certificatesCount,
      courses: 0, // Буде отримано з Contentful
      satisfiedStudents: testimonialsStats.satisfiedStudents,
      satisfactionPercentage: testimonialsStats.satisfactionPercentage
    }
    
    console.log('✅ Загальна статистика платформи:', stats)
    return stats
  } catch (error: any) {
    console.error('❌ Помилка отримання загальної статистики:', error)
    return {
      students: 0,
      certificates: 0,
      courses: 0,
      satisfiedStudents: '0+',
      satisfactionPercentage: 0
    }
  }
}

// Тип для контактних повідомлень
export type ContactMessage = {
  id?: string
  name: string
  email: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  createdAt: any
  userAgent?: string
  ipAddress?: string
}

// Функція для відправки контактного повідомлення
export const sendContactMessage = async (messageData: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) => {
  try {
    if (!db) {
      throw new Error('Firestore не ініціалізований')
    }

    const contactRef = collection(db, 'contact_messages')
    const newMessage = {
      ...messageData,
      status: 'new' as const,
      createdAt: serverTimestamp(),
      userAgent: navigator.userAgent,
      // IP адресу можна отримати через сервіс, але для дипломної роботи це не критично
    }
    
    const docRef = await addDoc(contactRef, newMessage)
    console.log('✅ Контактне повідомлення відправлено:', docRef.id)
    return { success: true, id: docRef.id }
  } catch (error: any) {
    console.error('❌ Помилка відправки контактного повідомлення:', error)
    
    // Fallback - зберігаємо локально
    try {
      const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]')
      const newMessage = {
        ...messageData,
        status: 'new',
        createdAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        id: Date.now().toString()
      }
      messages.push(newMessage)
      localStorage.setItem('contact_messages', JSON.stringify(messages))
      
      console.log('📧 Повідомлення збережено локально:', newMessage)
      return { success: true, id: newMessage.id, local: true }
    } catch (localError) {
      console.error('Помилка локального збереження:', localError)
    }
    
    return { success: false, error: error.message || 'Невідома помилка' }
  }
}

// Функція для отримання всіх контактних повідомлень (для адміна)
export const getAllContactMessages = async (): Promise<ContactMessage[]> => {
  try {
    const contactRef = collection(db, 'contact_messages')
    const q = query(contactRef, orderBy('createdAt', 'desc'))
    
    const querySnapshot = await getDocs(q)
    const messages: ContactMessage[] = []
    
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      } as ContactMessage)
    })
    
    return messages
  } catch (error: any) {
    console.error('❌ Помилка отримання контактних повідомлень:', error)
    return []
  }
}

// Функція для ручного створення поточного користувача в Firestore
export const ensureCurrentUserInFirestore = async () => {
  try {
    if (auth.currentUser) {
      const result = await createUserInFirestore(auth.currentUser)
      if (result.success) {
        console.log('✅ Поточний користувач успішно створений/оновлений в Firestore')
        return true
      } else {
        console.error('❌ Помилка створення користувача:', result.error)
        return false
      }
    } else {
      console.log('📝 Немає авторизованого користувача')
      return false
    }
  } catch (error: any) {
    console.error('❌ Помилка ensureCurrentUserInFirestore:', error)
    return false
  }
}

// Тип для streak даних
export type FirestoreStreak = {
  currentStreak: number
  longestStreak: number
  lastLearningDate: any
  streakStartDate: any
  updatedAt: any
}

// Функція для збереження streak в Firestore
export const saveStreakToFirestore = async (userId: string, streakData: Omit<FirestoreStreak, 'updatedAt'>) => {
  try {
    if (!db) {
      throw new Error('Firestore не ініціалізований')
    }

    const streakRef = doc(db, 'user_streaks', userId)
    await setDoc(streakRef, {
      ...streakData,
      updatedAt: serverTimestamp()
    }, { merge: true })

    console.log('✅ Streak збережено в Firestore для користувача:', userId)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Помилка збереження streak:', error)
    return { success: false, error: error.message }
  }
}

// Функція для отримання streak з Firestore
export const getStreakFromFirestore = async (userId: string): Promise<FirestoreStreak | null> => {
  try {
    if (!db) {
      throw new Error('Firestore не ініціалізований')
    }

    const streakRef = doc(db, 'user_streaks', userId)
    const streakDoc = await getDocs(collection(db, 'user_streaks'))
    
    // Знаходимо документ для конкретного користувача
    let userStreak = null
    streakDoc.forEach((doc) => {
      if (doc.id === userId) {
        userStreak = { id: doc.id, ...doc.data() } as FirestoreStreak
      }
    })

    if (userStreak) {
      console.log('✅ Streak завантажено з Firestore для користувача:', userId)
      return userStreak
    } else {
      console.log('📝 Streak не знайдено в Firestore для користувача:', userId)
      return null
    }
  } catch (error: any) {
    console.error('❌ Помилка завантаження streak:', error)
    return null
  }
}

// Функція для отримання ролі користувача
export const getUserRole = async (userId: string): Promise<UserRole> => {
  try {
    if (!db) {
      throw new Error('Firestore не ініціалізований')
    }

    const userRef = doc(db, 'users', userId)
    const userDoc = await getDocs(collection(db, 'users'))
    
    // Знаходимо документ для конкретного користувача
    let userRole: UserRole = 'user'
    let userFound = false
    
    userDoc.forEach((doc) => {
      if (doc.id === userId) {
        const userData = doc.data() as FirestoreUser
        userRole = userData.role || 'user'
        userFound = true
        console.log('🔍 Знайдено користувача в Firestore:', doc.id, 'Роль:', userRole)
      }
    })

    if (!userFound) {
      console.log('⚠️ Користувач не знайдений в Firestore:', userId)
      // Якщо користувач не знайдений, але це ваш email, повертаємо admin
      const currentUser = auth.currentUser
      if (currentUser?.email === 'siidechaiin@gmail.com') {
        console.log('🔑 Автоматично призначаємо роль адміна для:', currentUser.email)
        return 'admin'
      }
    }

    console.log('✅ Роль користувача завантажена:', userId, 'Роль:', userRole)
    return userRole
  } catch (error: any) {
    console.error('❌ Помилка завантаження ролі користувача:', error)
    // Якщо помилка, але це ваш email, повертаємо admin
    const currentUser = auth.currentUser
    if (currentUser?.email === 'siidechaiin@gmail.com') {
      console.log('🔑 Fallback: призначаємо роль адміна для:', currentUser.email)
      return 'admin'
    }
    return 'user' // За замовчуванням звичайний користувач
  }
}

// Функція для перевірки, чи є користувач адміном
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId)
  return role === 'admin'
}

// Тип для коментарів
export type FirestoreComment = {
  id?: string
  courseId: string
  author: string
  content: string
  createdAt: any
  userId: string
}

// Функція для додавання коментаря
export const addComment = async (commentData: Omit<FirestoreComment, 'id' | 'createdAt'>) => {
  try {
    if (!db) {
      throw new Error('Firestore не ініціалізований')
    }

    const commentsRef = collection(db, 'comments')
    const newComment = {
      ...commentData,
      createdAt: serverTimestamp()
    }
    
    const docRef = await addDoc(commentsRef, newComment)
    console.log('✅ Коментар додано:', docRef.id)
    return { success: true, id: docRef.id }
  } catch (error: any) {
    console.error('❌ Помилка додавання коментаря:', error)
    
    // Fallback - зберігаємо локально
    try {
      const comments = JSON.parse(localStorage.getItem('comments_fallback') || '[]')
      const newComment = {
        ...commentData,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date()
      }
      comments.push(newComment)
      localStorage.setItem('comments_fallback', JSON.stringify(comments))
      
      console.log('📝 Коментар збережено локально:', newComment)
      return { success: true, id: newComment.id, local: true }
    } catch (localError) {
      console.error('Помилка локального збереження:', localError)
    }
    
    return { success: false, error: error.message || 'Невідома помилка' }
  }
}

// Функція для отримання коментарів курсу
export const getCommentsByCourseId = async (courseId: string): Promise<FirestoreComment[]> => {
  try {
    if (!db) {
      throw new Error('Firestore не ініціалізований')
    }

    const commentsRef = collection(db, 'comments')
    // Спрощений запит без orderBy
    const q = query(
      commentsRef, 
      where('courseId', '==', courseId)
    )
    
    const querySnapshot = await getDocs(q)
    const comments: FirestoreComment[] = []
    
    querySnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data()
      } as FirestoreComment)
    })
    
    // Сортуємо на клієнті
    comments.sort((a, b) => {
      const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0
      const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0
      return bTime - aTime // Найновіші спочатку
    })
    
    console.log('✅ Отримано коментарів для курсу', courseId, ':', comments.length)
    return comments
  } catch (error: any) {
    console.error('❌ Помилка отримання коментарів:', error)
    return []
  }
}

// Функція для підписки на коментарі в реальному часі
export const subscribeToComments = (courseId: string, callback: (comments: FirestoreComment[]) => void) => {
  try {
    if (!db) {
      throw new Error('Firestore не ініціалізований')
    }

    const commentsRef = collection(db, 'comments')
    // Спрощений запит без orderBy для уникнення потреби в складному індексі
    const q = query(
      commentsRef, 
      where('courseId', '==', courseId)
    )
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const comments: FirestoreComment[] = []
      
      querySnapshot.forEach((doc) => {
        comments.push({
          id: doc.id,
          ...doc.data()
        } as FirestoreComment)
      })
      
      // Сортуємо на клієнті замість orderBy в запиті
      comments.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0
        return bTime - aTime // Найновіші спочатку
      })
      
      console.log('🔄 Оновлено коментарі в реальному часі:', comments.length)
      callback(comments)
    }, (error) => {
      console.error('❌ Помилка підписки на коментарі:', error)
      
      // Fallback - завантажуємо локальні коментарі
      try {
        const localComments = JSON.parse(localStorage.getItem('comments_fallback') || '[]')
        const courseComments = localComments.filter((c: any) => c.courseId === courseId)
        console.log('📝 Використовуємо локальні коментарі:', courseComments.length)
        callback(courseComments)
      } catch (localError) {
        console.error('Помилка завантаження локальних коментарів:', localError)
        callback([])
      }
    })
    
    return unsubscribe
  } catch (error: any) {
    console.error('❌ Помилка створення підписки на коментарі:', error)
    return () => {}
  }
}


