import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../features/auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Alert } from '../components/ui/Alert'

const schema = z.object({
  email: z.string().email('Введіть правильний email'),
  password: z.string().min(6, 'Пароль має бути мінімум 6 символів'),
})

type FormValues = z.infer<typeof schema>

export function Auth() {
  const { signInEmail, signUpEmail, signInGoogle } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ 
    resolver: zodResolver(schema) 
  })

  const onSignIn = handleSubmit(async ({ email, password }) => {
    try {
      setError(null)
      await signInEmail(email, password)
      navigate('/profile')
    } catch (err: any) {
      setError(err.message || 'Помилка входу. Спробуйте ще раз.')
    }
  })

  const onSignUp = handleSubmit(async ({ email, password }) => {
    try {
      setError(null)
      await signUpEmail(email, password)
      navigate('/profile')
    } catch (err: any) {
      setError(err.message || 'Помилка реєстрації. Спробуйте ще раз.')
    }
  })

  const onGoogleSignIn = async () => {
    try {
      setError(null)
      await signInGoogle()
      navigate('/profile')
    } catch (err: any) {
      setError(err.message || 'Помилка входу через Google. Спробуйте ще раз.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl font-bold">🎓</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isSignUp ? 'Створити акаунт' : 'Увійти в акаунт'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp ? 'Зареєструйтеся, щоб розпочати навчання' : 'Увійдіть, щоб продовжити навчання'}
          </p>
        </div>

        <Card className="shadow-large">
          <CardHeader>
            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}
          </CardHeader>
          
          <CardContent>
            <form onSubmit={isSignUp ? onSignUp : onSignIn} className="space-y-6">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                {...register('email')}
                error={errors.email?.message}
                startIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              <Input
                label="Пароль"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                {...register('password')}
                error={errors.password?.message}
                startIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
              >
                {isSignUp ? 'Зареєструватися' : 'Увійти'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Або</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={onGoogleSignIn}
                  disabled={isSubmitting}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Продовжити з Google
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
              >
                {isSignUp 
                  ? 'Вже маєте акаунт? Увійти' 
                  : 'Немає акаунту? Зареєструватися'
                }
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Продовжуючи, ви погоджуєтеся з нашими{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">
              Умовами використання
            </a>{' '}
            та{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">
              Політикою конфіденційності
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth