import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '../lib/contentful'
import { 
  getCourseCategory, 
  getCategoryIconElement, 
  availableCategories as allCategories 
} from "../lib/courseCategories"
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Chip } from '../components/ui/Chip'

export function Catalog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const { data: courses, isLoading, isError } = useQuery({ 
    queryKey: ['courses'], 
    queryFn: getCourses 
  })

  // Фільтрація та сортування курсів
  const filteredAndSortedCourses = useMemo(() => {
    if (!courses) return []
    
    let filtered = courses.filter(course => {
      const matchesSearch = !searchQuery.trim() || 
        course.fields.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.fields.description && course.fields.description.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesLevel = !levelFilter || course.fields.level === levelFilter
      
      const courseCategory = getCourseCategory(course.fields.title, course.fields.description)
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
          return getCourseCategory(a.fields.title, a.fields.description)
            .localeCompare(getCourseCategory(b.fields.title, b.fields.description))
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
    const categories = courses.map(c => getCourseCategory(c.fields.title, c.fields.description))
    return [...new Set(categories)].filter(category => allCategories.includes(category))
  }, [courses])

  const clearAllFilters = () => {
    setSearchQuery('')
    setLevelFilter('')
    setCategoryFilter('')
    setSortBy('title')
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Каталог курсів
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Оберіть курс, який вас цікавить, та розпочніть навчання
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <Card className="sticky top-8">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Фільтри</h2>
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Пошук
                    </label>
                    <Input
                      placeholder="Пошук курсів..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      startIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      }
                    />
                  </div>

                  {/* Level Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Рівень складності
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setLevelFilter('')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          levelFilter === '' 
                            ? 'bg-primary-100 text-primary-800' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Всі рівні
                      </button>
                      {availableLevels.map(level => (
                        <button
                          key={level}
                          onClick={() => setLevelFilter(level || '')}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            levelFilter === level 
                              ? 'bg-primary-100 text-primary-800' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Категорії
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setCategoryFilter('')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          categoryFilter === '' 
                            ? 'bg-primary-100 text-primary-800' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Всі категорії
                      </button>
                      {availableCategories.map(category => {
                        const { IconComponent } = getCategoryIconElement(category)
                        return (
                          <button
                            key={category}
                            onClick={() => setCategoryFilter(category)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                              categoryFilter === category 
                                ? 'bg-primary-100 text-primary-800' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <IconComponent />
                            {category}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Сортування
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="title">За назвою</option>
                      <option value="level">За рівнем</option>
                      <option value="category">За категорією</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    fullWidth
                    className="text-gray-600 border-gray-300 hover:border-error-500 hover:text-error-600"
                  >
                    Очистити всі фільтри
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Пошук курсів за назвою або описом..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  onClick={() => setViewMode('list')}
                  className="px-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600">
                {filteredAndSortedCourses.length} курсів
                {searchQuery && ` за запитом "${searchQuery}"`}
                {levelFilter && ` • Рівень: ${levelFilter}`}
                {categoryFilter && ` • Категорія: ${categoryFilter}`}
              </p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedCourses.map(course => {
                  const courseCategory = getCourseCategory(course.fields.title, course.fields.description)
                  const { IconComponent } = getCategoryIconElement(courseCategory)
                  
                  return (
                    <Card key={course.id} hover className="overflow-hidden">
                      <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100">
                        <img 
                          src={course.fields.coverUrl || 'https://via.placeholder.com/400x200?text=Course'}
                          alt={course.fields.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {course.fields.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {course.fields.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Chip 
                            icon={<IconComponent />} 
                            size="sm"
                            variant="primary"
                          >
                            {courseCategory}
                          </Chip>
                          {course.fields.level && (
                            <Chip 
                              size="sm"
                              variant="secondary"
                            >
                              {course.fields.level}
                            </Chip>
                          )}
                          <Chip 
                            size="sm"
                            variant="default"
                          >
                            2-3 години
                          </Chip>
                        </div>
                        
                        <Link to={`/courses/${course.id}`}>
                          <Button fullWidth className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700">
                            Почати курс
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedCourses.map(course => {
                  const courseCategory = getCourseCategory(course.fields.title, course.fields.description)
                  const { IconComponent } = getCategoryIconElement(courseCategory)
                  
                  return (
                    <Card key={course.id} hover>
                      <Link to={`/courses/${course.id}`} className="block">
                        <div className="flex items-center gap-4 p-6">
                          <div className="w-32 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={course.fields.coverUrl || 'https://via.placeholder.com/400x200?text=Course'}
                              alt={course.fields.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {course.fields.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {course.fields.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2">
                              <Chip 
                                icon={<IconComponent />} 
                                size="sm"
                                variant="primary"
                              >
                                {courseCategory}
                              </Chip>
                              {course.fields.level && (
                                <Chip 
                                  size="sm"
                                  variant="secondary"
                                >
                                  {course.fields.level}
                                </Chip>
                              )}
                              <Chip 
                                size="sm"
                                variant="default"
                              >
                                2-3 години
                              </Chip>
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0">
                            <Button className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700">
                              Почати курс
                            </Button>
                          </div>
                        </div>
                      </Link>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Catalog