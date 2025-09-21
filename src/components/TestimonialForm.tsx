import { useState } from 'react'
import { addTestimonial } from '../firebase'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

interface TestimonialFormProps {
  onSuccess?: () => void
}

export function TestimonialForm({ onSuccess }: TestimonialFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    content: '',
    rating: 5,
    email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const result = await addTestimonial(formData)
      
      if (result.success) {
        setMessage('✅ Дякуємо за ваш відгук! Він буде опублікований після модерації.')
        setFormData({
          name: '',
          role: '',
          content: '',
          rating: 5,
          email: ''
        })
        onSuccess?.()
      } else {
        setMessage(`❌ Помилка: ${result.error}`)
      }
    } catch (error) {
      setMessage('❌ Сталася неочікувана помилка. Спробуйте ще раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }))
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
        Залишити відгук
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Ім'я *
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ваше ім'я"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Посада/Роль *
            </label>
            <Input
              id="role"
              name="role"
              type="text"
              required
              value={formData.role}
              onChange={handleInputChange}
              placeholder="Наприклад: Frontend Developer"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email (опціонально)
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your@email.com"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
            Оцінка *
          </label>
          <select
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
          >
            <option value={5}>⭐⭐⭐⭐⭐ (5 зірок)</option>
            <option value={4}>⭐⭐⭐⭐ (4 зірки)</option>
            <option value={3}>⭐⭐⭐ (3 зірки)</option>
            <option value={2}>⭐⭐ (2 зірки)</option>
            <option value={1}>⭐ (1 зірка)</option>
          </select>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Відгук *
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={4}
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Розкажіть про ваш досвід навчання на платформі..."
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
          />
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Відправляємо...' : 'Відправити відгук'}
        </Button>
      </form>

      <p className="text-sm text-gray-500 mt-4 text-center">
        Всі відгуки проходять модерацію перед публікацією
      </p>
    </div>
  )
}
