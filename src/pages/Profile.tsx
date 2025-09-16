import { useState } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Progress } from '../components/ui/Progress'

export function Profile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: 'Люблю навчатися новим технологіям та розвиватися в IT-сфері.',
    location: 'Київ, Україна',
    website: '',
    github: '',
    linkedin: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
    // Тут буде логіка збереження профілю
    console.log('Profile saved:', profileData)
    setIsEditing(false)
    alert('Профіль успішно оновлено!')
  }

  // Мокові дані для статистики
  const stats = {
    coursesCompleted: 12,
    totalHours: 156,
    certificates: 8,
    currentStreak: 15
  }

  const recentCourses = [
    { id: 1, title: 'React Advanced Patterns', progress: 100, completed: true },
    { id: 2, title: 'TypeScript Fundamentals', progress: 85, completed: false },
    { id: 3, title: 'Node.js Backend Development', progress: 60, completed: false },
    { id: 4, title: 'Database Design', progress: 100, completed: true }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Мій профіль</h1>
          <p className="text-gray-600 mt-2">Управляйте своїм профілем та переглядайте прогрес навчання</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="p-8 text-center">
              <div className="w-32 h-32 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    name="displayName"
                    value={profileData.displayName}
                    onChange={handleInputChange}
                    placeholder="Ім'я"
                  />
                  <Input
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    disabled
                  />
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    placeholder="Про себе"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                  <Input
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    placeholder="Місцезнаходження"
                  />
                  <Input
                    name="website"
                    value={profileData.website}
                    onChange={handleInputChange}
                    placeholder="Веб-сайт"
                  />
                  <Input
                    name="github"
                    value={profileData.github}
                    onChange={handleInputChange}
                    placeholder="GitHub"
                  />
                  <Input
                    name="linkedin"
                    value={profileData.linkedin}
                    onChange={handleInputChange}
                    placeholder="LinkedIn"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex-1">
                      Зберегти
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsEditing(false)}
                      className="flex-1"
                    >
                      Скасувати
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {profileData.displayName || 'Користувач'}
                  </h2>
                  <p className="text-gray-600 mb-4">{profileData.email}</p>
                  <p className="text-gray-700 mb-6">{profileData.bio}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profileData.location}
                    </div>
                    {profileData.website && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <a href={profileData.website} className="text-primary-600 hover:underline">
                          {profileData.website}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    Редагувати профіль
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {stats.coursesCompleted}
                </div>
                <div className="text-sm text-gray-600">Завершених курсів</div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {stats.totalHours}
                </div>
                <div className="text-sm text-gray-600">Годин навчання</div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {stats.certificates}
                </div>
                <div className="text-sm text-gray-600">Сертифікатів</div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {stats.currentStreak}
                </div>
                <div className="text-sm text-gray-600">Днів поспіль</div>
              </Card>
            </div>

            {/* Recent Courses */}
            <Card className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Останні курси
              </h3>
              
              <div className="space-y-4">
                {recentCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Progress value={course.progress} className="flex-1" />
                        <span className="text-sm text-gray-600 min-w-[3rem]">
                          {course.progress}%
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {course.completed ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium">Завершено</span>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost">
                          Продовжити
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button variant="ghost">
                  Переглянути всі курси
                </Button>
              </div>
            </Card>

            {/* Achievements */}
            <Card className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Досягнення
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Перший курс</h4>
                    <p className="text-sm text-gray-600">Завершено перший курс</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Швидкий старт</h4>
                    <p className="text-sm text-gray-600">7 днів навчання поспіль</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Сертифікат</h4>
                    <p className="text-sm text-gray-600">Отримано перший сертифікат</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Знавець</h4>
                    <p className="text-sm text-gray-600">10+ завершених курсів</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile