
// Функція для визначення категорії курсу
export const getCourseCategory = (title: string, description?: string) => {
  const text = (title + ' ' + (description || '')).toLowerCase()
  if (text.includes('react') || text.includes('frontend') || text.includes('ui')) return 'Frontend'
  if (text.includes('node') || text.includes('backend') || text.includes('api') || text.includes('server')) return 'Backend'
  if (text.includes('typescript') || text.includes('javascript') || text.includes('js')) return 'JavaScript'
  if (text.includes('database') || text.includes('sql') || text.includes('data')) return 'Database'
  if (text.includes('security') || text.includes('auth') || text.includes('crypto')) return 'Security'
  if (text.includes('cloud') || text.includes('aws') || text.includes('deploy')) return 'Cloud'
  if (text.includes('mobile') || text.includes('app') || text.includes('ios') || text.includes('android')) return 'Mobile'
  return 'Other'
}

// Функція для отримання іконки категорії як JSX елемент
export const getCategoryIconElement = (category: string) => {
  const IconComponent = () => {
    switch (category) {
      case 'Frontend': 
      case 'Front End':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      case 'Backend': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        )
      case 'JavaScript': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'Database': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        )
      case 'Security': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )
      case 'Cloud': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        )
      case 'Mobile': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      default: 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
    }
  }
  
  return { IconComponent }
}

// Всі доступні категорії
export const availableCategories = [
  'Frontend',
  'Front End', // Додаємо варіант з пробілом
  'Backend', 
  'JavaScript',
  'Database',
  'Security',
  'Cloud',
  'Mobile',
  'Other'
]

// Групування категорій
export const categoryGroups = {
  technical: ['Frontend', 'Front End', 'Backend', 'JavaScript', 'Database', 'Security', 'Cloud', 'Mobile'],
  nonTechnical: ['Other']
}

// Функція для отримання групи категорії
export const getCategoryGroup = (category: string) => {
  if (categoryGroups.technical.includes(category)) return 'technical'
  return 'nonTechnical'
}
