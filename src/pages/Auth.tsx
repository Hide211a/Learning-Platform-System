import { Box, Button, Paper, Stack, TextField, Typography, Alert } from '@mui/material'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../features/auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})
type FormValues = z.infer<typeof schema>

export function Auth() {
  const { signInEmail, signUpEmail, signInGoogle } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSignIn = handleSubmit(async ({ email, password }) => {
    try {
      setError(null)
      await signInEmail(email, password)
      navigate('/profile')
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please try again.')
    }
  })
  const onSignUp = handleSubmit(async ({ email, password }) => {
    try {
      setError(null)
      await signUpEmail(email, password)
      navigate('/profile')
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.')
    }
  })

  return (
    <Box display="flex" justifyContent="center">
      <Paper sx={{ p: 3, maxWidth: 420, width: '100%' }}>
        <Stack spacing={2} component="form" onSubmit={onSignIn}>
          <Typography variant="h5">Sign In</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
          <TextField label="Password" type="password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={isSubmitting}>Sign In</Button>
            <Button variant="outlined" onClick={onSignUp} disabled={isSubmitting}>Sign Up</Button>
            <Button variant="outlined" onClick={() => signInGoogle()} disabled={isSubmitting}>Google</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}

export default Auth


