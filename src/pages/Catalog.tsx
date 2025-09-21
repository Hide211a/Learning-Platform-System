import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '../lib/contentful'
import { 
  getCategoryIconElement, 
  availableCategories as allCategories 
} from "../lib/courseCategories"
import { useProgress } from '../features/progress/ProgressContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Footer } from '../components/Footer'

export function Catalog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const { getCompletedStudentsCount, getCourseRating } = useProgress()
  
  const { data: courses, isLoading, isError } = useQuery({ 
    queryKey: ['courses'], 
    queryFn: getCourses,
    staleTime: 0, // Завжди оновлювати дані
    gcTime: 0 // Не кешувати дані
  })

  // Фільтрація та сортування курсів
  const filteredAndSortedCourses = useMemo(() => {
    if (!courses) return []
    
    let filtered = courses.filter(course => {
      const matchesSearch = !searchQuery.trim() || 
        course.fields.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.fields.description && course.fields.description.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesLevel = !levelFilter || course.fields.level === levelFilter
      
      const courseCategory = course.fields.category
      const matchesCategory = !categoryFilter || courseCategory === categoryFilter
      
      return matchesSearch && matchesLevel && matchesCategory
    })

    // Сортування
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.fields.title.localeCompare(b.fields.title)
        case 'level':
          const levelOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 }
          return (levelOrder[a.fields.level as keyof typeof levelOrder] || 0) - 
                 (levelOrder[b.fields.level as keyof typeof levelOrder] || 0)
        case 'category':
          return (a.fields.category || '').localeCompare(b.fields.category || '')
        default:
          return 0
      }
    })

    return filtered
  }, [courses, searchQuery, levelFilter, categoryFilter, sortBy])

  // Отримання унікальних рівнів та категорій
  const availableLevels = useMemo(() => {
    if (!courses) return []
    return [...new Set(courses.map(c => c.fields.level).filter(Boolean))]
  }, [courses])

  const availableCategories = useMemo(() => {
    if (!courses) return []
    // Використовуємо ті ж категорії, що й в хедері - з поля category
    const categories = courses.map(c => c.fields.category).filter(Boolean)
    return [...new Set(categories)].filter(category => category && allCategories.includes(category))
  }, [courses])

  const clearAllFilters = () => {
    setSearchQuery('')
    setLevelFilter('')
    setCategoryFilter('')
    setSortBy('title')
  }


  const clearLevelFilter = () => {
    setLevelFilter('')
  }

  const clearCategoryFilter = () => {
    setCategoryFilter('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження курсів...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Помилка завантаження</h3>
            <p className="text-gray-600 mb-4">Не вдалося завантажити курси. Спробуйте пізніше.</p>
            <Button onClick={() => window.location.reload()}>
              Спробувати знову
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl animate-pulse delay-500"></div>
          <div className="absolute top-20 right-20 w-48 h-48 bg-blue-200/30 rounded-full blur-2xl animate-pulse delay-700"></div>
          <div className="absolute bottom-20 left-20 w-56 h-56 bg-violet-200/35 rounded-full blur-2xl animate-pulse delay-300"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[30vh] flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Каталог курсів
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
              Оберіть курс, який вас цікавить, та розпочніть навчання з найкращими викладачами
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <Card className="sticky top-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Фільтри</h2>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Level Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      📊 Рівень складності
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setLevelFilter('')}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          levelFilter === '' 
                            ? 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 shadow-lg border-2 border-primary-300' 
                            : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-gray-200'
                        }`}
                      >
                        🎯 Всі рівні
                      </button>
                      {availableLevels.map(level => (
                        <button
                          key={level}
                          onClick={() => setLevelFilter(level || '')}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            levelFilter === level 
                              ? 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 shadow-lg border-2 border-primary-300' 
                              : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-gray-200'
                          }`}
                        >
                          {level === 'Beginner' && '🟢 '}
                          {level === 'Intermediate' && '🟡 '}
                          {level === 'Advanced' && '🔴 '}
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      🏷️ Категорії
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setCategoryFilter('')}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          categoryFilter === '' 
                            ? 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 shadow-lg border-2 border-primary-300' 
                            : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-gray-200'
                        }`}
                      >
                        🎯 Всі категорії
                      </button>
                      {availableCategories.map(category => {
                        const { IconComponent } = getCategoryIconElement(category || 'Other')
                        return (
                          <button
                            key={category}
                            onClick={() => setCategoryFilter(category || '')}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                              categoryFilter === category 
                                ? 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 shadow-lg border-2 border-primary-300' 
                                : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-gray-200'
                            }`}
                          >
                            <div className={`p-1 rounded-lg ${categoryFilter === category ? 'bg-primary-300/50' : 'bg-gray-100'}`}>
                              <IconComponent />
                            </div>
                            {category}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      🔄 Сортування
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm transition-all duration-200"
                    >
                      <option value="title">📝 За назвою</option>
                      <option value="level">📊 За рівнем</option>
                      <option value="category">🏷️ За категорією</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    fullWidth
                    className="text-gray-600 border-2 border-gray-300 hover:border-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl py-3 font-semibold transition-all duration-200"
                  >
                    🗑️ Очистити всі фільтри
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    placeholder="🔍 Пошук курсів за назвою або описом..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-2 border-gray-200 focus:border-primary-500 rounded-xl shadow-lg bg-white/80 backdrop-blur-sm"
                    startIcon={
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    }
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg border-2 border-red-500' 
                      : 'border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg border-2 border-red-500' 
                      : 'border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Results Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-primary-100 to-primary-200 rounded-xl px-4 py-2">
                  <p className="text-sm font-semibold text-primary-800">
                    📚 {filteredAndSortedCourses.length} курсів знайдено
                  </p>
                </div>
                {(levelFilter || categoryFilter) && (
                  <div className="flex flex-wrap gap-2">
                    {levelFilter && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-2">
                        📊 {levelFilter}
                        <button
                          onClick={clearLevelFilter}
                          className="text-green-600 hover:text-green-800 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                          title="Скинути рівень"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {categoryFilter && (
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-2">
                        🏷️ {categoryFilter}
                        <button
                          onClick={clearCategoryFilter}
                          className="text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                          title="Скинути категорію"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Courses */}
            {filteredAndSortedCourses.length === 0 ? (
              <Card className="text-center p-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery || levelFilter || categoryFilter ? 'Курси не знайдені' : 'Курси відсутні'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery || levelFilter || categoryFilter 
                    ? 'Спробуйте змінити фільтри або пошуковий запит' 
                    : 'Курси будуть додані найближчим часом'
                  }
                </p>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAndSortedCourses.map((course, index) => {
                  const courseCategory = course.fields.category || 'Other'
                  const { IconComponent } = getCategoryIconElement(courseCategory)
                  
                  // Динамічні дані з ProgressContext
                  const completedStudentsCount = getCompletedStudentsCount(course.id)
                  const courseRating = getCourseRating(course.id)
                  
                  return (
                    <div 
                      key={course.id} 
                      className="group animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <Link to={`/courses/${course.id}`} className="block h-full">
                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden border border-gray-100 h-full flex flex-col">
                          {/* Header with image */}
                          <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden flex-shrink-0">
                        <img 
                          src={course.fields.coverUrl || 'https://via.placeholder.com/400x200?text=Course'}
                          alt={course.fields.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                            
                            {/* Level badge */}
                            <div className="absolute top-4 left-4">
                              <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                                Advanced
                              </span>
                            </div>
                            
                            {/* Category badge */}
                        <div className="absolute top-4 right-4">
                              <div className="bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-sm border border-gray-200">
                                <IconComponent />
                        </div>
                      </div>
                        </div>
                        
                          {/* Content */}
                          <div className="p-6 flex flex-col flex-grow">
                            {/* Title */}
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {course.fields.title}
                        </h3>
                            
                            {/* Description */}
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed flex-grow">
                          {course.fields.description}
                        </p>
                        
                            {/* Bottom section with chips and button */}
                            <div className="mt-auto space-y-4">
                              {/* Chips row */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                            {courseCategory}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    {course.fields.duration || '2-3 години'}
                                  </span>
                                </div>
                                {completedStudentsCount > 0 && courseRating > 0 && (
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
                                    </svg>
                                    {courseRating} ({completedStudentsCount})
                                  </div>
                                )}
                        </div>
                        
                              {/* Button */}
                              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                                <span>Почати курс</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                              </button>
                            </div>
                          </div>
                      </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredAndSortedCourses.map((course, index) => {
                  const courseCategory = course.fields.category || 'Other'
                  const { IconComponent } = getCategoryIconElement(courseCategory)
                  
                  // Динамічні дані з ProgressContext
                  const completedStudentsCount = getCompletedStudentsCount(course.id)
                  const courseRating = getCourseRating(course.id)
                  
                  return (
                    <div 
                      key={course.id} 
                      className="group animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Link to={`/courses/${course.id}`} className="block h-full">
                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden h-full">
                          <div className="flex items-center gap-6 p-6 h-full">
                            {/* Image */}
                            <div className="relative w-32 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl overflow-hidden flex-shrink-0">
                            <img 
                              src={course.fields.coverUrl || 'https://via.placeholder.com/400x200?text=Course'}
                              alt={course.fields.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                              <div className="absolute top-2 left-2">
                                <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                                  Advanced
                                </span>
                              </div>
                          </div>
                          
                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="p-1.5 bg-blue-50 rounded-lg">
                                  <IconComponent />
                                </div>
                                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                    {courseCategory}
                                  </span>
                              </div>
                              
                                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                                {course.fields.title}
                              </h3>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                                {course.fields.description}
                              </p>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    {course.fields.duration || '2-3 години'}
                                  </span>
                                  {completedStudentsCount > 0 && courseRating > 0 && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
                                      </svg>
                                      {courseRating} ({completedStudentsCount})
                                    </span>
                                  )}
                                </div>
                                
                                {/* Button */}
                                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2">
                                  <span>Почати</span>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Catalog