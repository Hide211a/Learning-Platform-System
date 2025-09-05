import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'
import { AuthProvider } from './features/auth/AuthContext'
import { ProgressProvider } from './features/progress/ProgressContext'
import ErrorBoundary from './components/ErrorBoundary'

const Catalog = lazy(() => import('./pages/Catalog.tsx'))
const Course = lazy(() => import('./pages/Course.tsx'))
const CourseVideo = lazy(() => import('./pages/CourseVideo.tsx'))
const Lesson = lazy(() => import('./pages/Lesson.tsx'))
const Quiz = lazy(() => import('./pages/Quiz.tsx'))
const Profile = lazy(() => import('./pages/Profile.tsx'))
const Admin = lazy(() => import('./pages/Admin.tsx'))
const Auth = lazy(() => import('./pages/Auth.tsx'))

import ProtectedRoute from './features/auth/ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary><div>Error occurred</div></ErrorBoundary>,
    children: [
      { index: true, element: <Catalog /> },
      { path: 'courses/:courseId', element: <Course /> },
      { path: 'courses/:courseId/video', element: <CourseVideo /> },
      { path: 'courses/:courseId/lessons/:lessonId', element: <Lesson /> },
      { path: 'courses/:courseId/quiz/:quizId', element: <Quiz /> },
      { element: <ProtectedRoute />, children: [
        { path: 'profile', element: <Profile /> },
        { path: 'admin', element: <Admin /> },
      ]},
      { path: 'auth', element: <Auth /> },
    ],
  },
])

const theme = createTheme({ palette: { mode: 'light' } })
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ProgressProvider>
              <Suspense fallback={null}>
                <RouterProvider router={router} />
              </Suspense>
            </ProgressProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
