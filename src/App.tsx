import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from './features/auth/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from './lib/contentful'
import { 
  getCategoryIconElement, 
  categoryGroups 
} from "./lib/courseCategories"
import { ScrollToTop } from './components/ScrollToTop'

function App() {
  const { user, userRole, roleLoading, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [coursesMenuOpen, setCoursesMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [currentPath, setCurrentPath] = useState(location.pathname)

  // Отримуємо курси для пошуку
  const { data: courses } = useQuery({ 
    queryKey: ['courses'], 
    queryFn: getCourses 
  })

  // Відстежуємо зміни маршруту
  useEffect(() => {
    setCurrentPath(location.pathname)
    // Закриваємо меню при зміні маршруту
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
    setCoursesMenuOpen(false)
  }, [location.pathname])

  // Функція пошуку курсів
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim() || !courses) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    const filtered = courses.filter(course => 
      course.fields.title.toLowerCase().includes(query.toLowerCase()) ||
      (course.fields.description && course.fields.description.toLowerCase().includes(query.toLowerCase())) ||
      (course.fields.category && course.fields.category.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 5) // Показуємо тільки перші 5 результатів

    setSearchResults(filtered)
    setShowSearchResults(true)
  }

  // Закрити результати пошуку при кліку поза ними
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.search-container')) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Функція для отримання імені користувача
  const getUserDisplayName = () => {
    if (!user) return ''
    
    // Спочатку перевіряємо збережене ім'я в профілі (прив'язано до користувача)
    try {
      const userId = user.uid
      const savedProfile = localStorage.getItem(`userProfile_${userId}`)
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile)
        if (parsedProfile.displayName && parsedProfile.displayName.trim()) {
          return parsedProfile.displayName
        }
      }
    } catch (error) {
      console.error('Помилка читання профілю:', error)
    }
    
    // Якщо немає збереженого імені, використовуємо displayName з Firebase
    if (user.displayName) {
      return user.displayName
    }
    
    // В останню чергу використовуємо частину email
    if (user.email) {
      const emailName = user.email.split('@')[0]
      return emailName.charAt(0).toUpperCase() + emailName.slice(1)
    }
    
    return 'Користувач'
  }

  // Функція для визначення активної вкладки
  const isActiveTab = (path: string) => {
    if (path === '/') {
      return currentPath === '/'
    }
    return currentPath.startsWith(path)
  }

  // Динамічні категорії з Contentful
  const getDynamicCategories = () => {
    if (!courses) return { technical: [], nonTechnical: [] }
    
    // Отримуємо унікальні категорії з курсів
    const uniqueCategories = [...new Set(courses.map(course => course.fields.category).filter(Boolean))]
    
    
    // Якщо немає категорій в курсах, показуємо всі доступні
    if (uniqueCategories.length === 0) {
      return { 
        technical: categoryGroups.technical, 
        nonTechnical: categoryGroups.nonTechnical 
      }
    }
    
    const technical = uniqueCategories.filter(cat => cat && categoryGroups.technical.includes(cat))
    const nonTechnical = uniqueCategories.filter(cat => cat && categoryGroups.nonTechnical.includes(cat))
    
    return { technical, nonTechnical }
  }

  const { technical: dynamicTechnical, nonTechnical: dynamicNonTechnical } = getDynamicCategories()

  // Дані для dropdown меню курсів
  const technicalCourses = dynamicTechnical.map(category => {
    const { IconComponent } = getCategoryIconElement(category!)
    const courseCount = courses?.filter(c => c.fields.category === category).length || 0
    return {
      name: category,
      icon: <IconComponent />,
      level: category === 'Security' || category === 'Cloud' ? 'ПРОСУНУТИЙ' : '',
      count: courseCount
    }
  })

  const nonTechnicalCourses = dynamicNonTechnical.map(category => {
    const { IconComponent } = getCategoryIconElement(category!)
    const courseCount = courses?.filter(c => c.fields.category === category).length || 0
    return {
      name: category,
      icon: <IconComponent />,
      level: category === 'Other' ? 'новий' : '',
      count: courseCount
    }
  })

  // Динамічні популярні курси - тільки ті категорії, які мають курси
  const popularCourses = [...technicalCourses, ...nonTechnicalCourses]
    .filter(course => course.count > 0) // Тільки категорії з курсами
    .sort((a, b) => b.count - a.count) // Сортуємо за кількістю курсів
    .slice(0, 4) // Показуємо топ-4
    .map(course => ({
      name: course.name,
      icon: course.icon,
      image: course.name === 'Frontend' ? '🎨' : 
             course.name === 'Backend' ? '⚙️' : 
             course.name === 'JavaScript' ? '📜' : 
             course.name === 'Database' ? '🗄️' : 
             course.name === 'Security' ? '🔒' :
             course.name === 'Cloud' ? '☁️' :
             course.name === 'Mobile' ? '📱' : '📚',
      count: course.count
    }))

  // Визначаємо, чи показувати адмін панель
  const shouldShowAdmin = userRole === 'admin' || (roleLoading && user?.email === 'siidechaiin@gmail.com')

  const navigationItems = [
    { label: 'Головна', path: '/', icon: '🏠' },
    { label: 'Курси', path: '/catalog', icon: '📚', hasDropdown: true },
    { label: 'Про нас', path: '/about', icon: 'ℹ️' },
    { label: 'Контакти', path: '/contact', icon: '📞' },
    // Додаємо адмін панель для адмінів або під час завантаження для вашого email
    ...(shouldShowAdmin ? [{ label: 'Адмін', path: '/admin', icon: '⚙️' }] : [])
  ]


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ScrollToTop />
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

            {/* Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-xs mx-4 search-container">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Пошук курсів..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                    <div className="p-2">
                      {searchResults.map((course) => (
                        <Link
                          key={course.id}
                          to={`/courses/${course.id}`}
                          onClick={() => {
                            setShowSearchResults(false)
                            setSearchQuery('')
                          }}
                          className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        >
                          <div className="w-12 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-600">📚</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {course.fields.title}
                            </p>
                            {course.fields.description && (
                              <p className="text-xs text-gray-500 truncate">
                                {course.fields.description}
                              </p>
                            )}
                          </div>
                          {course.fields.level && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                              {course.fields.level}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {showSearchResults && searchQuery && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500">Курси не знайдено</p>
                      <p className="text-xs text-gray-400 mt-1">Спробуйте інші ключові слова</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation - Center */}
            <nav className="hidden lg:flex items-center space-x-8 mr-8">
              {navigationItems.map((item) => (
                item.hasDropdown ? (
                  <div key={item.path} className="relative">
                    <button
                      onClick={() => setCoursesMenuOpen(!coursesMenuOpen)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isActiveTab(item.path) 
                          ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                          : 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <span className="font-medium">{item.label}</span>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${coursesMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Courses Dropdown */}
                    {coursesMenuOpen && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[32rem] bg-white rounded-xl shadow-large border border-gray-200 overflow-hidden z-50 lg:block hidden">
                        <div className="p-6">
                          <div className="flex gap-4">
                            {/* Left side - All courses */}
                            <div className="flex-1 min-w-0">
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
                                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                  {course.icon}
                    <span className="text-sm text-gray-700">{course.name}</span>
                  {course.level && (
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                          course.level === 'новий' 
                                            ? 'bg-success-100 text-success-800' 
                                            : 'bg-warning-100 text-warning-800'
                                        }`}>
                                          {course.level}
                      </span>
                    )}
                  </div>
                  {course.count > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {course.count}
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
                                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                  {course.icon}
                    <span className="text-sm text-gray-700">{course.name}</span>
                  {course.level && (
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-800">
                                          {course.level}
                      </span>
                    )}
                  </div>
                  {course.count > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {course.count}
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
            {popularCourses.length > 0 ? (
                                popularCourses.map((course, index) => (
                                  <Link
                key={index}
                to="/catalog"
                                    onClick={() => setCoursesMenuOpen(false)}
                                    className="flex items-center justify-between p-2 bg-white rounded-lg hover:shadow-soft transition-all"
                                  >
                                    <div className="flex items-center gap-2">
                                    <span className="text-lg">{course.image}</span>
                    {course.icon}
                                    <span className="text-sm font-medium text-gray-700">{course.name}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                      {course.count}
                                    </span>
                                  </Link>
                                ))
                              ) : (
                                <div className="text-center py-4">
                                  <p className="text-sm text-gray-500">Курси завантажуються...</p>
                                </div>
                              )}
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
                    className={`font-medium transition-colors duration-200 ${
                      isActiveTab(item.path) 
                        ? 'text-red-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </nav>

            {/* Right Side - Utility Buttons */}
            <div className="flex items-center space-x-4 ml-4">
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
              </div>
            </div>

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
        {/* Mobile Menu - Animated */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-t border-gray-200 bg-white/95 backdrop-blur-sm">
            <div className="px-4 py-6 space-y-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActiveTab(item.path) 
                      ? 'text-red-600 bg-red-50' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
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