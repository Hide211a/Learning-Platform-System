import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'
import { AuthProvider } from './features/auth/AuthContext'
import { ProgressProvider } from './features/progress/ProgressContext'
import ErrorBoundary from './components/ErrorBoundary'

const Home = lazy(() => import('./pages/Home.tsx'))
const Catalog = lazy(() => import('./pages/Catalog.tsx'))
const Course = lazy(() => import('./pages/Course.tsx'))
const CourseVideo = lazy(() => import('./pages/CourseVideo.tsx'))
const Lesson = lazy(() => import('./pages/Lesson.tsx'))
const Quiz = lazy(() => import('./pages/Quiz.tsx'))
const Profile = lazy(() => import('./pages/Profile.tsx'))
const Admin = lazy(() => import('./pages/Admin.tsx'))
const Auth = lazy(() => import('./pages/Auth.tsx'))
const About = lazy(() => import('./pages/About.tsx'))
const Contact = lazy(() => import('./pages/Contact.tsx'))

import ProtectedRoute from './features/auth/ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary><div>Error occurred</div></ErrorBoundary>,
    children: [
      { index: true, element: <Home /> },
      { path: 'catalog', element: <Catalog /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
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

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProgressProvider>
            <Suspense fallback={
              <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Завантаження...</p>
                </div>
              </div>
            }>
              <RouterProvider router={router} />
            </Suspense>
          </ProgressProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
