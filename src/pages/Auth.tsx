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
  const { signInEmail, signUpEmail } = useAuth()
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
                variant="outline"
                fullWidth
                loading={isSubmitting}
                className="border-none text-primary-500 hover:bg-primary-500 hover:text-white"
              >
                {isSignUp ? 'Зареєструватися' : 'Увійти'}
              </Button>
            </form>


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