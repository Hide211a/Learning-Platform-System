import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { User } from 'firebase/auth'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, createUserInFirestore, getUserRole, type UserRole } from '../../firebase'

type AuthContextValue = {
  user: User | null
  userRole: UserRole | null
  loading: boolean
  roleLoading: boolean
  signInEmail: (email: string, password: string) => Promise<void>
  signUpEmail: (email: string, password: string) => Promise<void>
  signInGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [roleLoading, setRoleLoading] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setLoading(false)
      
      // Автоматично створюємо/оновлюємо користувача в Firestore при вході
      if (u) {
        setRoleLoading(true)
        try {
          await createUserInFirestore(u)
          // Отримуємо роль користувача
          const role = await getUserRole(u.uid)
          setUserRole(role)
        } catch (error) {
          console.error('Помилка створення користувача в Firestore:', error)
          // Fallback: якщо це ваш email, призначаємо роль адміна
          if (u.email === 'siidechaiin@gmail.com') {
            setUserRole('admin')
          } else {
            setUserRole('user')
          }
        } finally {
          setRoleLoading(false)
        }
      } else {
        setUserRole(null)
        setRoleLoading(false)
      }
    })
    return () => unsub()
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    userRole,
    loading,
    roleLoading,
    async signInEmail(email, password) {
      try {
        await signInWithEmailAndPassword(auth, email, password)
      } catch (error: any) {
        console.error('Sign in error:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        
        // Provide user-friendly error messages
        if (error.code === 'auth/invalid-credential') {
          throw new Error('Invalid email or password. Please check your credentials or sign up for a new account.')
        } else if (error.code === 'auth/user-not-found') {
          throw new Error('No account found with this email. Please sign up first.')
        } else if (error.code === 'auth/wrong-password') {
          throw new Error('Incorrect password. Please try again.')
        }
        
        throw error
      }
    },
    async signUpEmail(email, password) {
      try {
        await createUserWithEmailAndPassword(auth, email, password)
      } catch (error: any) {
        console.error('Sign up error:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        
        // Provide user-friendly error messages
        if (error.code === 'auth/email-already-in-use') {
          throw new Error('An account with this email already exists. Please sign in instead.')
        } else if (error.code === 'auth/weak-password') {
          throw new Error('Password is too weak. Please choose a stronger password.')
        } else if (error.code === 'auth/invalid-email') {
          throw new Error('Please enter a valid email address.')
        }
        
        throw error
      }
    },
    async signInGoogle() {
      await signInWithPopup(auth, googleProvider)
    },
    async logout() {
      await signOut(auth)
    },
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


