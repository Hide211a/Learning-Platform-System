import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getApprovedTestimonials } from '../firebase'

interface TestimonialsProps {
  className?: string
}

export function Testimonials({ className = '' }: TestimonialsProps) {
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: getApprovedTestimonials
  })
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (testimonials.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [testimonials.length])

  if (isLoading) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Завантаження відгуків...</p>
      </div>
    )
  }

  if (testimonials.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Поки немає відгуків</h3>
        <p className="text-gray-500">Станьте першим, хто залишить відгук про нашу платформу!</p>
      </div>
    )
  }

  const currentTestimonial = testimonials[currentIndex]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  return (
    <div className={`relative ${className}`}>
      <div className="bg-white rounded-2xl shadow-large p-8 md:p-12">
        <div className="text-center">
          {/* Rating */}
          <div className="flex justify-center mb-4">
            {renderStars(currentTestimonial.rating)}
          </div>

          {/* Content */}
          <blockquote className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
            "{currentTestimonial.content}"
          </blockquote>

          {/* Author */}
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
              {currentTestimonial.avatar ? (
                <img
                  src={currentTestimonial.avatar}
                  alt={currentTestimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                currentTestimonial.name.split(' ').map(n => n[0]).join('')
              )}
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">
                {currentTestimonial.name}
              </div>
              <div className="text-gray-600 text-sm">
                {currentTestimonial.role}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      {testimonials.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-primary-600'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
