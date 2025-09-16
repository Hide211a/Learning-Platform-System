import { Outlet, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from './features/auth/AuthContext'
import { Button } from './components/ui/Button'
import { 
  getCategoryIconElement, 
  categoryGroups 
} from "./lib/courseCategories"

function App() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [coursesMenuOpen, setCoursesMenuOpen] = useState(false)

  // Функція для отримання імені користувача
  const getUserDisplayName = () => {
    if (!user) return ''
    
    if (user.displayName) {
      return user.displayName
    }
    
    if (user.email) {
      const emailName = user.email.split('@')[0]
      return emailName.charAt(0).toUpperCase() + emailName.slice(1)
    }
    
    return 'Користувач'
  }

  // Дані для dropdown меню курсів
  const technicalCourses = categoryGroups.technical.map(category => {
    const { IconComponent } = getCategoryIconElement(category)
    return {
      name: category,
      icon: <IconComponent className="w-4 h-4" />,
      level: category === 'Security' || category === 'Cloud' ? 'ПРОСУНУТИЙ' : ''
    }
  })

  const nonTechnicalCourses = categoryGroups.nonTechnical.map(category => {
    const { IconComponent } = getCategoryIconElement(category)
    return {
      name: category,
      icon: <IconComponent className="w-4 h-4" />,
      level: category === 'Other' ? 'новий' : ''
    }
  })

  const popularCourses = [
    { name: 'Frontend', icon: (() => { const { IconComponent } = getCategoryIconElement('Frontend'); return <IconComponent className="w-4 h-4" /> })(), image: '🎨' },
    { name: 'Backend', icon: (() => { const { IconComponent } = getCategoryIconElement('Backend'); return <IconComponent className="w-4 h-4" /> })(), image: '⚙️' },
    { name: 'JavaScript', icon: (() => { const { IconComponent } = getCategoryIconElement('JavaScript'); return <IconComponent className="w-4 h-4" /> })(), image: '📜' },
    { name: 'Database', icon: (() => { const { IconComponent } = getCategoryIconElement('Database'); return <IconComponent className="w-4 h-4" /> })(), image: '🗄️' },
  ]

  const navigationItems = [
    { label: 'Головна', path: '/', icon: '🏠' },
    { label: 'Курси', path: '/catalog', icon: '📚', hasDropdown: true },
    { label: 'Про нас', path: '/about', icon: 'ℹ️' },
    { label: 'Контакти', path: '/contact', icon: '📞' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header - Mate Academy Style */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Left Side */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">Edu</span>
                <span className="text-sm text-gray-600">Platform</span>
              </div>
            </Link>

            {/* Navigation - Center */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                item.hasDropdown ? (
                  <div key={item.path} className="relative">
                    <button
                      onClick={() => setCoursesMenuOpen(!coursesMenuOpen)}
                      className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    >
                      <span className="font-medium">{item.label}</span>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${coursesMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Courses Dropdown */}
                    {coursesMenuOpen && (
                      <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-large border border-gray-200 overflow-hidden z-50">
                        <div className="p-6">
                          <div className="flex gap-4">
                            {/* Left side - All courses */}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Всі курси</h3>
                              
                              <div className="flex gap-2 mb-4">
                                <span className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
              Технічні
                                </span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                                  Нетехнічні
                                </span>
                              </div>

                              {/* Technical courses */}
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-600 mb-2">Технічні</h4>
                                <div className="space-y-1">
              {technicalCourses.map((course, index) => (
                                    <Link
                  key={index}
                  to="/catalog"
                                      onClick={() => setCoursesMenuOpen(false)}
                                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {course.icon}
                                      <span className="text-sm text-gray-700 flex-1">{course.name}</span>
                  {course.level && (
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                          course.level === 'новий' 
                                            ? 'bg-success-100 text-success-800' 
                                            : 'bg-warning-100 text-warning-800'
                                        }`}>
                                          {course.level}
                                        </span>
                                      )}
                                    </Link>
                                  ))}
                                </div>
                              </div>

                              {/* Non-technical courses */}
                              <div>
                                <h4 className="text-sm font-semibold text-gray-600 mb-2">Нетехнічні</h4>
                                <div className="space-y-1">
              {nonTechnicalCourses.map((course, index) => (
                                    <Link
                  key={index}
                  to="/catalog"
                                      onClick={() => setCoursesMenuOpen(false)}
                                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {course.icon}
                                      <span className="text-sm text-gray-700 flex-1">{course.name}</span>
                  {course.level && (
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-800">
                                          {course.level}
                                        </span>
                                      )}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Right side - Popular */}
                            <div className="w-48 bg-gradient-to-br from-primary-50 to-secondary-50 p-4 rounded-lg">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Популярні</h3>
                              <div className="space-y-2">
            {popularCourses.map((course, index) => (
                                  <Link
                key={index}
                to="/catalog"
                                    onClick={() => setCoursesMenuOpen(false)}
                                    className="flex items-center gap-2 p-2 bg-white rounded-lg hover:shadow-soft transition-all"
                                  >
                                    <span className="text-lg">{course.image}</span>
                    {course.icon}
                                    <span className="text-sm font-medium text-gray-700">{course.name}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </nav>

            {/* Right Side - Utility Buttons */}
            <div className="flex items-center space-x-4">
              {/* Phone Icon */}
              <button className="hidden md:flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>

              {/* Language Selector */}
              <div className="hidden md:flex items-center space-x-1 cursor-pointer hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors duration-200">
                <div className="w-6 h-4 bg-gradient-to-b from-blue-500 to-yellow-400 rounded-sm"></div>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* User Menu / Auth Buttons */}
              <div className="flex items-center space-x-3">
          {user ? (
                <div className="flex items-center space-x-3">
                  <span className="hidden sm:block text-gray-700 font-medium">
                    Привіт, {getUserDisplayName()}!
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </button>
                    
                    {/* User Dropdown */}
                    {userMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-large border border-gray-200 overflow-hidden z-50">
                        <div className="p-4 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">{getUserDisplayName()}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="p-2">
                          <Link
                            to="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <span>👤</span>
                            <span>Профіль</span>
                          </Link>
                          <button
                            onClick={() => {
                              logout()
                              setUserMenuOpen(false)
                            }}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <span>🚪</span>
                            <span>Вийти</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/auth" className="hidden sm:block">
                    <button className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200">
                      Увійти
                    </button>
                  </Link>
                  <Link to="/auth">
                    <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                      Розпочати навчання
                    </button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 group"
              >
                <svg className={`w-6 h-6 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Animated */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-t border-gray-200 bg-white/95 backdrop-blur-sm">
            <div className="px-4 py-6 space-y-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200"
                >
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2">
                      <p className="font-semibold text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span>👤</span>
                      <span>Профіль</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span>🚪</span>
                      <span>Вийти</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200">
                        Увійти
                      </button>
                    </Link>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                        Розпочати навчання
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Click outside to close dropdowns */}
      {(coursesMenuOpen || userMenuOpen || mobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setCoursesMenuOpen(false)
            setUserMenuOpen(false)
            setMobileMenuOpen(false)
          }}
        />
      )}
    </div>
  )
}

export default App