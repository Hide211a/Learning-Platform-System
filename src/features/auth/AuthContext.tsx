import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { User } from 'firebase/auth'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../firebase'

type AuthContextValue = {
  user: User | null
  loading: boolean
  signInEmail: (email: string, password: string) => Promise<void>
  signUpEmail: (email: string, password: string) => Promise<void>
  signInGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
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


