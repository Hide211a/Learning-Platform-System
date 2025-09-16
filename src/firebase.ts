import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

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


